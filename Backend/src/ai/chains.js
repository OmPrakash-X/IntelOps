import { StructuredOutputParser } from "@langchain/core/output_parsers";
import aiModel from "./model.js";
import { rootCausePrompt, nextActionPrompt, postmortemPrompt } from "./prompts.js";
import { rootCauseSchema, nextActionSchema, postmortemSchema } from "./schemas.js";



// Create parsers (reused across calls — not recreated each request)
const rootCauseParser = StructuredOutputParser.fromZodSchema(rootCauseSchema);
const nextActionParser = StructuredOutputParser.fromZodSchema(nextActionSchema);
const postmortemParser = StructuredOutputParser.fromZodSchema(postmortemSchema);

// Build the three LCEL chains (LangChain Expression Language)
const rootCauseChain = rootCausePrompt.pipe(aiModel).pipe(rootCauseParser);
const nextActionChain = nextActionPrompt.pipe(aiModel).pipe(nextActionParser);
const postmortemChain = postmortemPrompt.pipe(aiModel).pipe(postmortemParser);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Formats timeline events into numbered, readable text for the prompt.
 * Includes type, message, author, and timestamp.
 */
const formatTimeline = (events) => {
  if (!events || events.length === 0) return "No timeline events recorded yet.";

  return events
    .map((e, i) => {
      const author = e.createdBy?.username || "system";
      const time = new Date(e.createdAt).toISOString();
      const tag = e.type?.toUpperCase() || "UPDATE";
      return `${i + 1}. [${tag}] ${e.message}  (by: ${author} | ${time})`;
    })
    .join("\n");
};

/**
 * Calculates incident duration from creation to resolution (or now).
 */
const calcDuration = (incident) => {
  const start = new Date(incident.createdAt);
  const end = incident.resolvedAt ? new Date(incident.resolvedAt) : new Date();
  const diffMs = end - start;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} minutes`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hours`;
};

// ─────────────────────────────────────────────
// Exported Chain Runners
// ─────────────────────────────────────────────

/**
 * Runs root cause detection.
 * Returns validated object matching rootCauseSchema.
 */
export const analyzeRootCause = async (incident, timelineEvents) => {
  return await rootCauseChain.invoke({
    title: incident.title,
    description: incident.description || "No description provided",
    severity: incident.severity,
    status: incident.status,
    timeline: formatTimeline(timelineEvents),
    format_instructions: rootCauseParser.getFormatInstructions(),
  });
};

/**
 * Runs next action suggestion.
 * Returns validated object matching nextActionSchema.
 */
export const suggestNextActions = async (incident, timelineEvents) => {
  return await nextActionChain.invoke({
    title: incident.title,
    description: incident.description || "No description provided",
    severity: incident.severity,
    status: incident.status,
    timeline: formatTimeline(timelineEvents),
    format_instructions: nextActionParser.getFormatInstructions(),
  });
};

/**
 * Runs postmortem generation.
 * Returns validated object matching postmortemSchema.
 */
export const generatePostmortem = async (incident, timelineEvents) => {
  return await postmortemChain.invoke({
    title: incident.title,
    description: incident.description || "No description provided",
    severity: incident.severity,
    resolvedBy: incident.resolvedBy?.username || "Unknown",
    duration: calcDuration(incident),
    timeline: formatTimeline(timelineEvents),
    format_instructions: postmortemParser.getFormatInstructions(),
  });
};
