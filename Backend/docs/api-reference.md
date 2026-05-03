# API Reference

All routes require authentication via JWT cookie unless marked public. Token is set on login and sent automatically with each request.

Base URL: `http://localhost:3000`

---

## Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | Any | Get current user |
| `POST` | `/api/auth/logout` | Any | Clear session |

**Login request:**
```json
{ "email": "user@example.com", "password": "yourpassword" }
```

---

## Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/users/create` | admin, teamLead | Create a new user |
| `GET` | `/api/users` | admin, teamLead | List users |

Admin can create `bugger` and `teamLead`. TeamLead can create `teamMember` only.

---

## Groups

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/groups` | admin | Create group |
| `GET` | `/api/groups` | admin | List all groups |
| `PATCH` | `/api/groups/:id/lead` | admin | Assign team lead |
| `PATCH` | `/api/groups/:id/members` | admin | Add members |

---

## Projects

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/projects` | admin | Create project |
| `GET` | `/api/projects` | admin, teamLead | List projects |
| `GET` | `/api/projects/:id` | Any | Get project by ID |

---

## Incidents

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/incidents` | bugger | Report new incident |
| `GET` | `/api/incidents` | Any | List all incidents |
| `GET` | `/api/incidents/:id` | Any | Get incident details |
| `PATCH` | `/api/incidents/:id/responders` | teamLead | Assign responders |
| `PATCH` | `/api/incidents/:id/status` | teamLead | Update status |
| `PATCH` | `/api/incidents/:id/postmortem` | teamLead | Write/edit postmortem |

**Status values:** `open` → `inProgress` → `resolved`

Resolving requires: you are the assigned team lead, and at least one responder is assigned.

---

## Timeline

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/incidents/:id/timeline` | teamLead, responders | Post timeline update |
| `GET` | `/api/incidents/:id/timeline` | Any | Get full timeline |

**Event types:** `update`, `action`, `status`

---

## Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Any | Get your notifications |
| `PATCH` | `/api/notifications/:id/read` | Any | Mark as read |

---

## AI

See [AI Features](./ai-features.md) for full details.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/incidents/:id/ai/suggestions` | Any | Get root cause + next actions |
| `POST` | `/api/incidents/:id/ai/analyze` | teamLead, admin | Manually trigger analysis |
| `GET` | `/api/incidents/:id/ai/postmortem` | Any | Get AI postmortem |
| `POST` | `/api/incidents/:id/ai/postmortem` | teamLead, admin | Manually re-trigger postmortem |

---

## Error Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```
