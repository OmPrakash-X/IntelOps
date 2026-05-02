import Incident from "../models/incident.model.js";
import Timeline from "../models/timeline.model.js";


export const createIncident = async (req, res) => {
  try {
    const { title, description, severity, project } = req.body;

    const incident = await Incident.create({
      title,
      description,
      severity,
      project,
      createdBy: req.user._id,
      status: "open"
    });

    await Timeline.create({
      incident: incident._id,
      message: `Incident reported by ${req.user.username}`,
      type: "status",
      createdBy: req.user._id
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


export const assignLead = async (req, res) => {
  try {
    const { teamLeadId } = req.body;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        assignedLead: teamLeadId,
        status: "inProgress"
      },
      { new: true }
    );

    await Timeline.create({
      incident: incident._id,
      message: `Team Lead assigned`,
      type: "action",
      createdBy: req.user._id
    });

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

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { responders },
      { new: true }
    );

    await Timeline.create({
      incident: incident._id,
      message: `Responders assigned`,
      type: "action",
      createdBy: req.user._id
    });

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

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    await Timeline.create({
      incident: incident._id,
      message: `Status changed to ${status}`,
      type: "status",
      createdBy: req.user._id
    });

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