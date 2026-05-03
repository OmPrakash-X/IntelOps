# IntelOps Backend — Incident Management Platform

<div align="center">

![Node](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb)
![LangChain](https://img.shields.io/badge/LangChain-Gemini_2.5_Flash-blue?logo=google)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-white?logo=socket.io)

**Production-grade incident management backend with AI-powered analysis.**  
Built for teams that need fast, structured incident response — from reporting to postmortem.

</div>

---

## What it does

IntelOps lets engineering teams manage production incidents end-to-end:

- **Report** — Buggers raise incidents tied to projects
- **Respond** — Team leads assign responders, track status
- **Analyze** — AI detects root cause and suggests next actions in real time
- **Resolve** — Status update triggers an AI-generated postmortem automatically
- **Learn** — Full immutable timeline and postmortem stored per incident

---

## AI Features

Three AI capabilities powered by **LangChain + Gemini 2.5 Flash** (with automatic Mistral fallback):

| Feature | Trigger | Delivery |
|---|---|---|
| 🔍 Root Cause Detection | New timeline event | Socket.io `ai:rootCause` |
| ⚡ Next Action Suggestions | New timeline event | Socket.io `ai:nextAction` |
| 📄 Postmortem Generation | Incident resolved | Socket.io `ai:postmortem` |

AI runs **fully asynchronously** — the API responds instantly and results arrive via Socket.io within seconds. A 30-second per-incident cooldown protects API rate limits.

→ [Full AI documentation](./docs/ai-features.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookie) |
| Real-time | Socket.io |
| AI Orchestration | LangChain |
| AI Model | Gemini 2.5 Flash + Mistral fallback |
| Output Validation | Zod (via LangChain StructuredOutputParser) |

---

## Quick Start

```bash
git clone https://github.com/OmPrakash-X/IntelOps.git
cd IntelOps/Backend
npm install
```

Add your keys to `.env`:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key
MISTRAL_API_KEY=your_mistral_key   # optional fallback
```

```bash
npm run dev          # start server
npm run create-admin # create first admin user
```

→ [Full setup guide](./docs/getting-started.md)

---

## Roles

| Role | Can do |
|---|---|
| `admin` | Create groups, projects, users — full oversight |
| `teamLead` | Assign responders, update status, write postmortem |
| `bugger` | Report incidents |
| `teamMember` | Respond to incidents, post timeline updates |

---

## Architecture

```
Client
  │
  ▼
Express API
  ├── protect (JWT)
  ├── allowRoles (RBAC)
  ├── validate (Zod / express-validator)
  └── controller
        │
        ├── MongoDB (Mongoose)
        │
        ├── Socket.io ──→ user rooms + incident rooms
        │
        └── AI Service (fire-and-forget)
              │
              └── LangChain
                    ├── ChatPromptTemplate
                    ├── Gemini 2.5 Flash  ──→ (fails?) Mistral fallback
                    └── StructuredOutputParser (Zod schema)
```

Every request goes through `protect → allowRoles → validate → controller`. The controller sends the HTTP response first, then fires AI work in the background. Results reach the frontend via Socket.io — the user never waits for AI.

---

## Incident Lifecycle

```
Bugger creates incident
  └─→ auto-assigned to group's Team Lead
        └─→ Team Lead assigns responders
              └─→ Responders post timeline updates
                    └─→ AI: root cause + next actions (async, ~3s)
                          └─→ Team Lead marks resolved
                                └─→ AI: full postmortem generated (async, ~8s)
```

---

## Real-time Events

Frontend subscribes to two Socket.io room types:

```js
socket.emit("join", userId)              // personal notifications
socket.emit("join:incident", incidentId) // incident-specific AI results
```

| Event | Room | Trigger |
|---|---|---|
| `notification` | personal | Any incident activity |
| `ai:rootCause` | incident | After each timeline event |
| `ai:nextAction` | incident | After each timeline event |
| `ai:postmortem` | incident | When incident resolved |
| `postmortem_updated` | personal | Manual postmortem edit |

---

## Documentation

| Doc | What's inside |
|---|---|
| [Getting Started](./docs/getting-started.md) | Setup, env vars, first admin |
| [API Reference](./docs/api-reference.md) | All endpoints, access levels, error format |
| [AI Features](./docs/ai-features.md) | AI pipeline, Socket events, frontend integration |
| [Architecture](./docs/architecture.md) | Full system design, folder structure, data flow |
