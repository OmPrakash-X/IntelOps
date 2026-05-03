import { analyzeRootCause, suggestNextActions, generatePostmortem } from "./chains.js";
import Incident from "../models/incident.model.js";
import Timeline from "../models/timeline.model.js";
import { getIO } from "../socket/index.js";


const cooldownMap = new Map();
const COOLDOWN_MS = 30 * 1000; // 30 seconds per incident

/**
 * Checks if an incident is within the cooldown window.
 * Returns true if AI should be skipped.
 */
const isOnCooldown = (incidentId) => {
  const lastRun = cooldownMap.get(incidentId);
  if (!lastRun) return false;
  return Date.now() - lastRun < COOLDOWN_MS;
};

/**
 * Records the current time as the last AI run for this incident.
 */
const setCooldown = (incidentId) => {
  cooldownMap.set(incidentId, Date.now());
};

// ─────────────────────────────────────────────
// Helper: Load incident + timeline from DB
// ─────────────────────────────────────────────
const loadIncidentData = async (incidentId) => {
  const [incident, timelineEvents] = await Promise.all([
    Incident.findById(incidentId)
      .populate("assignedLead", "username email")
      .populate("responders", "username email")
      .populate("resolvedBy", "username email")
      .populate("createdBy", "username email"),
    Timeline.find({ incident: incidentId })
      .populate("createdBy", "username")
      .sort({ createdAt: 1 }),
  ]);
  return { incident, timelineEvents };
};

// ─────────────────────────────────────────────
// 1. Incident Analysis (Root Cause + Next Action)
//    Triggered after each new timeline event
// ─────────────────────────────────────────────
export const runIncidentAnalysis = async (incidentId) => {
  const id = incidentId.toString();

  // Skip if within cooldown window
  if (isOnCooldown(id)) {
    console.log(`[AI] Skipping analysis for ${id} — cooldown active`);
    return;
  }

  try {
    const { incident, timelineEvents } = await loadIncidentData(id);

    // Need at least 2 events to have meaningful context for AI
    if (!incident || timelineEvents.length < 2) {
      console.log(`[AI] Skipping — insufficient context (events: ${timelineEvents.length})`);
      return;
    }

    // Mark cooldown BEFORE async AI calls to prevent parallel triggers
    setCooldown(id);
    console.log(`[AI] Running analysis for incident: ${incident.title}`);

    // Run both AI features in PARALLEL — saves time
    const [rootCauseResult, nextActionResult] = await Promise.allSettled([
      analyzeRootCause(incident, timelineEvents),
      suggestNextActions(incident, timelineEvents),
    ]);

    // Build DB update object only from successful results
    const updates = { "aiSuggestions.generatedAt": new Date() };

    if (rootCauseResult.status === "fulfilled") {
      updates["aiSuggestions.rootCause"] = JSON.stringify(rootCauseResult.value);
      console.log("[AI] Root cause analysis complete");
    } else {
      console.error("[AI] Root cause failed:", rootCauseResult.reason?.message);
    }

    if (nextActionResult.status === "fulfilled") {
      updates["aiSuggestions.nextAction"] = JSON.stringify(nextActionResult.value);
      console.log("[AI] Next action analysis complete");
    } else {
      console.error("[AI] Next action failed:", nextActionResult.reason?.message);
    }

    // Save to MongoDB
    await Incident.findByIdAndUpdate(id, updates);

    // Emit real-time results to all users viewing this incident
    const io = getIO();
    if (rootCauseResult.status === "fulfilled") {
      io.to(`incident:${id}`).emit("ai:rootCause", {
        incidentId: id,
        data: rootCauseResult.value,
        generatedAt: new Date(),
      });
    }
    if (nextActionResult.status === "fulfilled") {
      io.to(`incident:${id}`).emit("ai:nextAction", {
        incidentId: id,
        data: nextActionResult.value,
        generatedAt: new Date(),
      });
    }

  } catch (err) {
    // AI failure must never break the main incident flow
    console.error(`[AI] Analysis error for ${id}:`, err.message);
  }
};

// ─────────────────────────────────────────────
// 2. Postmortem Generation
//    Triggered when incident status → "resolved"
// ─────────────────────────────────────────────
export const runPostmortem = async (incidentId) => {
  const id = incidentId.toString();

  // Postmortem has its own separate cooldown (longer — 2 mins)
  // so it doesn't conflict with analysis cooldown
  const postmortemKey = `postmortem:${id}`;
  if (isOnCooldown(postmortemKey)) {
    console.log(`[AI] Skipping postmortem for ${id} — cooldown active`);
    return;
  }

  try {
    const { incident, timelineEvents } = await loadIncidentData(id);

    if (!incident) {
      console.error(`[AI] Postmortem: incident ${id} not found`);
      return;
    }

    setCooldown(postmortemKey);
    console.log(`[AI] Generating postmortem for: ${incident.title}`);

    const postmortem = await generatePostmortem(incident, timelineEvents);
    console.log("[AI] Postmortem generation complete");

    // Save the full postmortem object to the incident
    await Incident.findByIdAndUpdate(id, {
      postmortem: {
        summary: postmortem.summary,
        rootCause: postmortem.rootCause,
        impact: postmortem.impact,
        resolution: postmortem.resolution,
        lessonsLearned: postmortem.lessonsLearned,
        preventionSteps: postmortem.preventionSteps,
        aiTimeline: postmortem.timeline,
        generatedAt: new Date(),
      },
    });

    // Emit to all users viewing this incident
    const io = getIO();
    io.to(`incident:${id}`).emit("ai:postmortem", {
      incidentId: id,
      data: postmortem,
      generatedAt: new Date(),
    });

  } catch (err) {
    console.error(`[AI] Postmortem error for ${id}:`, err.message);
  }
};
