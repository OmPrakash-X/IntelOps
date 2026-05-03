# Architecture

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookie) |
| Real-time | Socket.io |
| AI Orchestration | LangChain |
| AI Model | Gemini 2.5 Flash (+ Mistral fallback) |

---

## Project Structure

```
Backend/
├── server.js              # Entry point — HTTP server + Socket.io init
└── src/
    ├── app.js             # Express app — middleware + route registration
    ├── ai/                # AI layer (LangChain)
    │   ├── model.js       # Gemini + Mistral model factory
    │   ├── schemas.js     # Zod output schemas
    │   ├── prompts.js     # Prompt templates
    │   ├── chains.js      # LangChain LCEL chains
    │   └── ai.service.js  # Background runner with cooldown
    ├── config/            # DB connection + env validation
    ├── controllers/       # Route handlers
    ├── middlewares/       # Auth (JWT) + role enforcement
    ├── models/            # Mongoose schemas
    ├── routes/            # Express routers
    ├── socket/            # Socket.io setup
    ├── utils/             # Shared utilities
    └── validators/        # Request validation (express-validator)
```

---

## Incident Lifecycle

```
Bugger creates incident
  → auto-assigned to group's Team Lead
    → Team Lead assigns responders
      → Responders post timeline updates
        → AI analyzes after each update (async)
          → Team Lead resolves
            → AI generates postmortem (async)
```

---

## Middleware Chain

Every protected route runs:

```
protect → allowRoles → validate → controller
```

- `protect` — verifies JWT, attaches `req.user`
- `allowRoles` — checks role against allowed list
- `validate` — runs express-validator rules, returns structured errors

---

## AI Architecture

AI runs fully out of the request lifecycle — it never makes the user wait.

```
Controller sends response → AI runs in background → saves to DB → emits via Socket.io
```

**LangChain pipeline per feature:**
```
ChatPromptTemplate → ChatGoogleGenerativeAI → StructuredOutputParser (Zod)
```

Zod schemas enforce the exact JSON shape of every AI response before it touches the database.

---

## Real-time Events

Users connect to two types of Socket.io rooms:

| Room | Join event | Purpose |
|---|---|---|
| `userId` | `join` | Personal notifications |
| `incident:{id}` | `join:incident` | Real-time AI updates for a specific incident |

**Events emitted by the server:**

| Event | Room | Trigger |
|---|---|---|
| `notification` | personal | Any incident event |
| `ai:rootCause` | incident | After timeline update |
| `ai:nextAction` | incident | After timeline update |
| `ai:postmortem` | incident | After incident resolved |
| `postmortem_updated` | personal | After manual postmortem edit |
