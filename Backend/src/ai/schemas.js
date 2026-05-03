import { z } from "zod";

// ─────────────────────────────────────────────
// 1. Root Cause Detection Schema
// ─────────────────────────────────────────────
export const rootCauseSchema = z.object({
  probableCauses: z
    .array(
      z.object({
        cause: z
          .string()
          .describe("Concise technical description of the probable root cause"),
        confidence: z
          .enum(["high", "medium", "low"])
          .describe("Confidence level based on evidence in the timeline"),
        reasoning: z
          .string()
          .describe(
            "Specific evidence from the timeline supporting this cause"
          ),
      })
    )
    .min(1)
    .max(3)
    .describe("List of probable root causes ranked by confidence"),
  summary: z
    .string()
    .describe(
      "One-sentence summary of the most likely root cause for quick display"
    ),
});

// ─────────────────────────────────────────────
// 2. Next Action Suggestions Schema
// ─────────────────────────────────────────────
export const nextActionSchema = z.object({
  actions: z
    .array(
      z.object({
        action: z
          .string()
          .describe("Specific, immediately actionable step the team must take"),
        priority: z
          .enum(["critical", "high", "medium"])
          .describe("Priority level: critical = do this right now"),
        rationale: z
          .string()
          .describe(
            "Why this action is needed based on current incident state"
          ),
      })
    )
    .min(1)
    .max(4)
    .describe("Prioritized list of next actions for the incident response team"),
  estimatedResolutionHint: z
    .string()
    .describe(
      "Brief hint on estimated resolution path if current actions are followed"
    ),
});

// ─────────────────────────────────────────────
// 3. Postmortem Generation Schema
// ─────────────────────────────────────────────
export const postmortemSchema = z.object({
  summary: z
    .string()
    .describe(
      "Executive summary of the incident: what happened, when, and the business impact (2-3 sentences)"
    ),
  rootCause: z
    .string()
    .describe("Definitive root cause of the incident based on the timeline"),
  impact: z
    .string()
    .describe(
      "What systems, users, or services were affected and for how long"
    ),
  resolution: z
    .string()
    .describe(
      "Step-by-step description of what was done to resolve the incident"
    ),
  timeline: z
    .array(
      z.object({
        time: z
          .string()
          .describe("Approximate time reference (e.g., T+5min, T+1hr)"),
        event: z.string().describe("Key event that occurred at this time"),
      })
    )
    .describe("Condensed incident timeline with only the key milestones"),
  lessonsLearned: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("Key organizational or technical lessons from this incident"),
  preventionSteps: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe(
      "Concrete action items to prevent this class of incident from recurring"
    ),
  severity: z
    .enum(["low", "medium", "high"])
    .describe("Assessed severity of the incident"),
});
