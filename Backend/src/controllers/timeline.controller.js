import Timeline from "../models/timeline.model.js";
import Incident from "../models/incident.model.js";
import { createNotification } from "../utils/notification.util.js";
import User from "../models/user.model.js";

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
    
    if (incident.status === "resolved") {
        return res.status(400).json({
        success: false,
        message: "Cannot add timeline to resolved incident"
      });
    }
    const timeline = await Timeline.create({
      incident: id,
      message,
      type,
      isPublic: isPublic || false,
      createdBy: req.user._id
    });

    let notifyUsers = [
        incident.assignedLead,
        ...incident.responders
    ].filter(Boolean);

    notifyUsers = notifyUsers.filter(
        id => id.toString() !== req.user._id.toString()
    );



    notifyUsers = [...new Set(notifyUsers.map(id => id.toString()))];

    await createNotification({
        recipients: notifyUsers,
        message: "New timeline update",
        incidentId: incident._id,
        type: "timeline"
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