import { ChatPromptTemplate } from "@langchain/core/prompts";

// ─────────────────────────────────────────────
// 1. Root Cause Detection Prompt
// ─────────────────────────────────────────────
export const rootCausePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert Site Reliability Engineer (SRE) with deep experience in diagnosing production incidents.
Your job is to analyze incident data and identify the most probable root causes based ONLY on the evidence provided.

Rules:
- Only reference events that appear in the timeline
- Rank causes by confidence (high > medium > low)  
- Be specific and technical — vague answers are not acceptable
- Do NOT hallucinate events or systems not mentioned in the data

{format_instructions}`,
  ],
  [
    "human",
    `Analyze this production incident and identify the probable root causes.

**INCIDENT DETAILS**
Title: {title}
Description: {description}
Severity: {severity}
Current Status: {status}

**TIMELINE (chronological order)**
{timeline}

Based strictly on this data, what are the most probable root causes?`,
  ],
]);

// ─────────────────────────────────────────────
// 2. Next Action Suggestions Prompt
// ─────────────────────────────────────────────
export const nextActionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert incident response coordinator with experience managing high-severity production outages.
Your job is to recommend the most important NEXT actions the team should take.

Rules:
- NEVER suggest actions already completed in the timeline
- Focus on actions that will reduce MTTR (Mean Time To Recovery)
- Priority "critical" means do this RIGHT NOW, before anything else
- Be specific: name tools, services, or commands where appropriate
- Maximum 4 actions — prioritize ruthlessly

{format_instructions}`,
  ],
  [
    "human",
    `Given this active incident, what should the response team do NEXT?

**INCIDENT DETAILS**
Title: {title}
Description: {description}
Severity: {severity}
Current Status: {status}

**TIMELINE (chronological — what has already been done)**
{timeline}

What are the highest-priority next steps?`,
  ],
]);

// ─────────────────────────────────────────────
// 3. Postmortem Generation Prompt
// ─────────────────────────────────────────────
export const postmortemPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a senior SRE writing a formal postmortem report for a resolved production incident.
This document will be read by engineering leadership and used to drive process improvements.

Rules:
- Be factual and blameless — focus on systems and processes, not individuals
- The summary must be suitable for an executive audience (no jargon)
- Root cause must be definitive based on the timeline evidence
- Lessons learned must be actionable, not generic
- Prevention steps must be specific engineering tasks, not platitudes like "be more careful"

{format_instructions}`,
  ],
  [
    "human",
    `Write a complete postmortem report for this resolved incident.

**INCIDENT DETAILS**
Title: {title}
Description: {description}
Severity: {severity}
Resolved By: {resolvedBy}
Duration: {duration}

**COMPLETE TIMELINE (chronological)**
{timeline}

Generate a comprehensive, professional postmortem.`,
  ],
]);
