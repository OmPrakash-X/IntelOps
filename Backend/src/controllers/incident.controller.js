import Incident from "../models/incident.model.js";
import Timeline from "../models/timeline.model.js";
import { createNotification } from "../utils/notification.util.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import { runPostmortem } from "../ai/ai.service.js";
import { getIO } from "../socket/index.js";

// ─────────────────────────────────────────────
// CREATE INCIDENT
// ─────────────────────────────────────────────
export const createIncident = async (req, res) => {
  try {
    const { title, description, severity, projectId } = req.body;

    // Populate group so we can access group.teamLead directly
    const project = await Project.findById(projectId).populate("group");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.group) {
      return res.status(400).json({ success: false, message: "Project has no group assigned" });
    }

    const incident = await Incident.create({
      title,
      description,
      severity,
      project: project._id,
      group: project.group._id,
      assignedLead: project.group.teamLead,
      createdBy: req.user._id,
      status: "open"
    });

    const admin = await User.findOne({ role: "admin" }).select("_id");

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

    if (admin) {
      await createNotification({
        recipients: [admin._id],
        message: "New incident created",
        incidentId: incident._id,
        type: "incident"
      });
    }

    if (project.group.teamLead) {
      await createNotification({
        recipients: [project.group.teamLead],
        message: "New incident assigned to you",
        incidentId: incident._id,
        type: "assignment"
      });
    }

    res.status(201).json({ success: true, data: incident });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET ALL INCIDENTS
// ─────────────────────────────────────────────
export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET SINGLE INCIDENT
// ─────────────────────────────────────────────
export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("assignedLead", "username email")
      .populate("responders", "username email")
      .populate("resolvedBy", "username email");

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    res.status(200).json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ASSIGN RESPONDERS
// ─────────────────────────────────────────────
export const assignResponders = async (req, res) => {
  try {
    const { responders } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    const users = await User.find({ _id: { $in: responders } });

    if (users.length !== responders.length) {
      return res.status(400).json({ success: false, message: "Some users not found" });
    }

    const invalidUser = users.find(
      user => user.group?.toString() !== incident.group.toString()
    );

    if (invalidUser) {
      return res.status(400).json({
        success: false,
        message: "All responders must belong to the same group"
      });
    }

    const updatedResponders = [
      ...new Set([
        ...incident.responders.map(id => id.toString()),
        ...responders
      ])
    ];

    // Track only newly added responders before overwriting
    const newResponders = responders.filter(
      id => !incident.responders.map(r => r.toString()).includes(id)
    );

    incident.responders = updatedResponders;
    await incident.save();

    await Timeline.create({
      incident: incident._id,
      message: "Responders assigned",
      type: "action",
      createdBy: req.user._id
    });

    if (newResponders.length > 0) {
      await createNotification({
        recipients: newResponders,
        message: "You have been assigned as a responder",
        incidentId: incident._id,
        type: "assignment"
      });
    }

    res.status(200).json({ success: true, data: incident });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE STATUS
// Handles open → inProgress → resolved
// Guards merged from the old resolveIncident function:
//   - Only assignedLead can resolve
//   - Responders must be assigned before resolving
// ─────────────────────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    if (incident.status === "resolved") {
      return res.status(400).json({ success: false, message: "Incident is already resolved" });
    }

    // Extra guards when resolving
    if (status === "resolved") {
      if (incident.assignedLead.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only the assigned Team Lead can resolve an incident"
        });
      }

      if (!incident.responders || incident.responders.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Assign responders before resolving the incident"
        });
      }

      incident.resolvedBy = req.user._id;
      incident.resolvedAt = new Date();
    }

    incident.status = status;
    await incident.save();

    await Timeline.create({
      incident: incident._id,
      message: `Status changed to ${status}`,
      type: "status",
      createdBy: req.user._id
    });

    const admin = await User.findOne({ role: "admin" }).select("_id");

    const notifyUsers = [
      incident.assignedLead,
      ...incident.responders,
      ...(admin ? [admin._id] : [])
    ].filter(Boolean);

    const uniqueUsers = [...new Set(notifyUsers.map(id => id.toString()))];

    await createNotification({
      recipients: uniqueUsers,
      message: `Incident status updated to ${status}`,
      incidentId: incident._id,
      type: "status"
    });

    res.status(200).json({ success: true, data: incident });

    // Fire-and-forget: generate AI postmortem after response is sent
    if (status === "resolved") {
      runPostmortem(incident._id).catch(err =>
        console.error("[AI] Postmortem generation error:", err.message)
      );
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// UPDATE POSTMORTEM (Manual override)
// Lets the Team Lead write or edit the postmortem manually.
// AI auto-generates postmortem on resolve, but this allows refinement.
// ─────────────────────────────────────────────
export const updatePostmortem = async (req, res) => {
  try {
    const { summary, rootCause, impact, resolution } = req.body;

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    if (incident.assignedLead.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned Team Lead can update the postmortem"
      });
    }

    if (incident.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Resolve the incident before updating the postmortem"
      });
    }

    if (!summary || !rootCause || !impact || !resolution) {
      return res.status(400).json({
        success: false,
        message: "summary, rootCause, impact, and resolution are all required"
      });
    }

    // Merge with existing AI-generated postmortem — don't overwrite AI extras
    incident.postmortem = {
      ...incident.postmortem,
      summary,
      rootCause,
      impact,
      resolution
    };

    await incident.save();

    await Timeline.create({
      incident: incident._id,
      message: "Postmortem manually updated",
      type: "action",
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
      message: "Postmortem has been updated",
      incidentId: incident._id,
      type: "status"
    });

    const io = getIO();
    uniqueRecipients.forEach(userId => {
      io.to(userId).emit("postmortem_updated", { incidentId: incident._id });
    });

    return res.status(200).json({ success: true, data: incident.postmortem });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};