import Incident from "../models/incident.model.js";
import { runIncidentAnalysis, runPostmortem } from "../ai/ai.service.js";

/**
 * GET /api/incidents/:id/ai/suggestions
 * Returns the stored AI analysis (root cause + next actions) for an incident.
 * Parses the stored JSON strings back into objects for the frontend.
 */
export const getAISuggestions = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).select("aiSuggestions title status");

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    const { aiSuggestions } = incident;

    // Parse stored JSON strings back into objects
    const rootCause = aiSuggestions?.rootCause
      ? JSON.parse(aiSuggestions.rootCause)
      : null;

    const nextAction = aiSuggestions?.nextAction
      ? JSON.parse(aiSuggestions.nextAction)
      : null;

    res.status(200).json({
      success: true,
      data: {
        rootCause,
        nextAction,
        generatedAt: aiSuggestions?.generatedAt || null,
        hasAnalysis: !!(rootCause || nextAction),
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/incidents/:id/ai/analyze
 * Manually triggers AI analysis (teamLead/admin only).
 * Useful during the demo to force a fresh analysis.
 */
export const triggerAnalysis = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).select("_id title status");

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    if (incident.status === "resolved") {
      return res.status(400).json({
        success: false,
        message: "Incident is already resolved. Use postmortem endpoint instead.",
      });
    }

    // Respond immediately — AI runs in background
    res.status(202).json({
      success: true,
      message: "AI analysis triggered. Results will arrive via Socket.io: ai:rootCause and ai:nextAction",
    });

    runIncidentAnalysis(incident._id, { force: true }).catch((err) =>
      console.error("[AI] Manual trigger error:", err.message)
    );

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/incidents/:id/ai/postmortem
 * Returns the stored postmortem for a resolved incident.
 */
export const getPostmortem = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .select("postmortem title status severity resolvedAt resolvedBy")
      .populate("resolvedBy", "username");

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    if (!incident.postmortem?.summary) {
      return res.status(404).json({
        success: false,
        message: incident.status === "resolved"
          ? "Postmortem is being generated. Check back in a few seconds or subscribe to ai:postmortem socket event."
          : "Postmortem only available for resolved incidents.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        incident: {
          title: incident.title,
          severity: incident.severity,
          resolvedAt: incident.resolvedAt,
          resolvedBy: incident.resolvedBy,
        },
        postmortem: incident.postmortem,
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/incidents/:id/ai/postmortem
 * Manually triggers postmortem generation for a resolved incident.
 */
export const triggerPostmortem = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).select("_id title status");

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    if (incident.status !== "resolved") {
      return res.status(400).json({
        success: false,
        message: "Postmortem can only be generated for resolved incidents.",
      });
    }

    res.status(202).json({
      success: true,
      message: "Postmortem generation triggered. Result will arrive via Socket.io: ai:postmortem",
    });

    runPostmortem(incident._id).catch((err) =>
      console.error("[AI] Manual postmortem error:", err.message)
    );

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
