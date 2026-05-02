import Timeline from "../models/timeline.model.js";
import Incident from "../models/incident.model.js";

export const addTimelineEvent = async (req, res) => {
  try {
    const { message, type, isPublic } = req.body;
    const { id } = req.params;

    const incident = await Incident.findById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    const userId = req.user._id.toString();

    const isLead =
      incident.assignedLead &&
      incident.assignedLead.toString() === userId;

    const isResponder =
      incident.responders &&
      incident.responders.map(r => r.toString()).includes(userId);

    if (!isLead && !isResponder) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add timeline"
      });
    }

    const timeline = await Timeline.create({
      incident: id,
      message,
      type,
      isPublic: isPublic || false,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: timeline
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const getTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const timeline = await Timeline.find({ incident: id })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: timeline
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};