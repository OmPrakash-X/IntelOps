import Incident from "../models/incident.model.js";
import Timeline from "../models/timeline.model.js";
import { createNotification } from "../utils/notification.util.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import { runPostmortem } from "../ai/ai.service.js";

export const createIncident = async (req, res) => {
  try {
    const { title, description, severity, projectId } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const incident = await Incident.create({
      title,
      description,
      severity,
      project,
      group: project.group,
      assignedLead: project.group.teamLead,
      createdBy: req.user._id,
      status: "open"
    });

    const admin = await User.findOne({ role: "admin" }).select("_id");
    const adminIds = [admin._id];
    

    await Timeline.create({
      incident: incident._id,
      message: `Incident reported by ${req.user.username}`,
      type: "status",
      createdBy: req.user._id
    });

    await Timeline.create({
      incident: incident._id,
      message: "Incident assigned to team lead",
      type: "action",
      createdBy: req.user._id
    });

    await createNotification({
      recipients: adminIds,
      message: "New incident created",
      incidentId: incident._id,
      type: "incident"
    });

    await createNotification({
      recipients: [project.group.teamLead],
      message: "New incident assigned to you",
      incidentId: incident._id,
      type: "assignment"
    });

    res.status(201).json({
      success: true,
      data: incident
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: incidents
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    res.status(200).json({
      success: true,
      data: incident
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const assignResponders = async (req, res) => {
  try {
    const { responders } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    const users = await User.find({ _id: { $in: responders } });

    if (users.length !== responders.length) {
      return res.status(400).json({
        success: false,
        message: "Some users not found"
      });
    }

    const invalidUser = users.find(
      user => user.group?.toString() !== incident.group.toString()
    );

    if (invalidUser) {
      return res.status(400).json({
        success: false,
        message: "All responders must belong to same group"
      });
    }

    const updatedResponders = [
      ...new Set([
        ...incident.responders.map(id => id.toString()),
        ...responders
      ])
    ];

    incident.responders = updatedResponders;
    await incident.save();

    await Timeline.create({
      incident: incident._id,
      message: "Responders assigned",
      type: "action",
      createdBy: req.user._id
    });


    const newResponders = responders.filter(
      id => !incident.responders.includes(id)
    );

    if (newResponders.length > 0) {
      await createNotification({
        recipients: newResponders,
        message: "You have been assigned as responder",
        incidentId: incident._id,
        type: "assignment"
      });
    }

    res.status(200).json({
      success: true,
      data: incident
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updateData = { status };

    // When resolving, record who resolved it and when
    if (status === "resolved") {
      updateData.resolvedBy = req.user._id;
      updateData.resolvedAt = new Date();
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    await Timeline.create({
      incident: incident._id,
      message: `Status changed to ${status}`,
      type: "status",
      createdBy: req.user._id
    });

    const admin = await User.findOne({ role: "admin" }).select("_id");
    const adminIds = [admin._id];

    const notifyUsers = [
      incident.assignedLead,
      ...incident.responders,
      ...adminIds
    ].filter(Boolean);

    const uniqueUsers = [...new Set(notifyUsers.map(id => id.toString()))];

    await createNotification({
      recipients: uniqueUsers,
      message: `Status updated to ${status}`,
      incidentId: incident._id,
      type: "status"
    });


    res.status(200).json({
      success: true,
      data: incident
    });

    // Fire-and-forget: Generate AI postmortem AFTER response is sent
    // Only triggers when incident is fully resolved
    if (status === "resolved") {
      runPostmortem(incident._id).catch((err) =>
        console.error("[AI] Postmortem generation error:", err.message)
      );
    }


  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const resolveIncident = async (req, res) => {
  try {
    const incidentId = req.params.id;

    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    if (incident.assignedLead.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only TeamLead can resolve incident"
      });
    }

    if (incident.status === "resolved") {
      return res.status(400).json({
        success: false,
        message: "Incident already resolved"
      });
    }

    if (!incident.responders || incident.responders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Assign responders before resolving"
      });
    }

    incident.status = "resolved";
    incident.resolvedBy = req.user._id;
    incident.resolvedAt = new Date();

    await incident.save();

    await Timeline.create({
      incident: incident._id,
      message: "Incident resolved",
      type: "resolution",
      createdBy: req.user._id
    });

    const adminUsers = await User.find({ role: "admin" }).select("_id");

    const recipients = [
      ...incident.responders,
      ...adminUsers.map(a => a._id)
    ].map(id => id.toString());

    const uniqueRecipients = [...new Set(recipients)];

    await createNotification({
      recipients: uniqueRecipients,
      message: "Incident resolved",
      incidentId: incident._id,
      type: "incidentResolved"
    });

    const io = getIO();
    uniqueRecipients.forEach(userId => {
      io.to(userId).emit("incident_resolved", {
        incidentId: incident._id
      });
    });

    return res.status(200).json({
      success: true,
      data: incident
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const updatePostmortem = async (req, res) => {
  try {
    const incidentId = req.params.id;
    const { summary, rootCause, impact, resolution } = req.body;

    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    if (incident.assignedLead.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only TeamLead can update postmortem"
      });
    }

    if (incident.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Resolve incident before postmortem"
      });
    }

    if (!summary || !rootCause || !impact || !resolution) {
      return res.status(400).json({
        success: false,
        message: "All postmortem fields are required"
      });
    }

    incident.postmortem = {
      summary,
      rootCause,
      impact,
      resolution
    };

    await incident.save();

    await Timeline.create({
      incident: incident._id,
      message: "Postmortem finalized",
      type: "postmortem",
      createdBy: req.user._id
    });

    const adminUsers = await User.find({ role: "admin" }).select("_id");

    const recipients = [
      ...incident.responders,
      ...adminUsers.map(a => a._id)
    ].map(id => id.toString());

    const uniqueRecipients = [...new Set(recipients)];

    await createNotification({
      recipients: uniqueRecipients,
      message: "Postmortem updated",
      incidentId: incident._id,
      type: "postmortemUpdated"
    });

    const io = getIO();
    uniqueRecipients.forEach(userId => {
      io.to(userId).emit("postmortem_updated", {
        incidentId: incident._id
      });
    });

    return res.status(200).json({
      success: true,
      data: incident.postmortem
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};