# AI Features

IntelOps uses LangChain with Google Gemini 2.5 Flash to provide three AI-powered capabilities during an active incident.

---

## How It Works

AI runs **asynchronously** — it never blocks the API response. The user gets their `200 OK` immediately, and results are delivered via **Socket.io** 3–8 seconds later.

```
Timeline event posted
  → 201 OK returned instantly
    → AI runs in background (2-8s)
      → Results saved to DB
        → Socket.io emits to incident room
```

---

## Features

### 1. Root Cause Detection

Triggered automatically after every new timeline event.

Analyzes the incident description and full timeline to identify the most probable root causes, ranked by confidence.

**Socket event:** `ai:rootCause`

```json
{
  "incidentId": "...",
  "data": {
    "probableCauses": [
      {
        "cause": "Memory leak in payment service",
        "confidence": "high",
        "reasoning": "Timeline shows gradual latency increase before OOM"
      }
    ],
    "summary": "Likely a memory leak in the payment service pod"
  }
}
```

### 2. Next Action Suggestions

Triggered alongside root cause detection after each timeline event.

Recommends the highest-priority actions the team should take next, based on what has already been done.

**Socket event:** `ai:nextAction`

```json
{
  "incidentId": "...",
  "data": {
    "actions": [
      {
        "action": "Check pod memory metrics in Grafana",
        "priority": "critical",
        "rationale": "No metrics reviewed yet despite latency spike"
      }
    ],
    "estimatedResolutionHint": "Likely resolved by pod restart after memory analysis"
  }
}
```

### 3. Postmortem Generation

Triggered automatically when incident status changes to `resolved`.

Generates a full, blameless postmortem with root cause, impact, resolution steps, lessons learned, and prevention steps.

**Socket event:** `ai:postmortem`

---

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/incidents/:id/ai/suggestions` | Any | Get stored root cause + next actions |
| `POST` | `/api/incidents/:id/ai/analyze` | teamLead, admin | Manually trigger analysis |
| `GET` | `/api/incidents/:id/ai/postmortem` | Any | Get stored postmortem |
| `POST` | `/api/incidents/:id/ai/postmortem` | teamLead, admin | Manually re-trigger postmortem |

---

## Rate Limiting

To protect free-tier API limits during the demo, AI analysis runs at most **once every 30 seconds per incident**. Manual trigger endpoints bypass this cooldown.

---

## Model Configuration

| Model | Role | Limits |
|---|---|---|
| Gemini 2.5 Flash | Primary | 1,000 req/day · 15 req/min |
| Mistral Small | Fallback | Used only if Gemini fails |

Switching models requires changing one line in `src/ai/model.js`.

---

## Frontend Integration (Socket.io)

```js
// Join an incident room when opening the incident detail page
socket.emit("join:incident", incidentId);

// Listen for AI results
socket.on("ai:rootCause", ({ data }) => { /* update UI */ });
socket.on("ai:nextAction", ({ data }) => { /* update UI */ });
socket.on("ai:postmortem", ({ data }) => { /* update UI */ });

// Leave when navigating away
socket.emit("leave:incident", incidentId);
```
