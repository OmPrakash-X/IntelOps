# IntelOps — Frontend

> React + Vite SPA powering the IntelOps incident intelligence platform. Art Deco design system, role-based dashboards, and real-time socket updates.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 + custom Art Deco CSS tokens |
| State Management | Redux Toolkit + React-Redux |
| Routing | React Router v7 |
| HTTP Client | Axios (with auth interceptor) |
| Animations | Framer Motion + Lenis smooth scroll |
| Real-time | Socket.IO Client |
| Icons | Lucide React |

---

## Project Structure

```
Frontend/
├── index.html                  # App entry point — Google Font imports (Marcellus, Josefin Sans)
├── vite.config.js              # Vite + Tailwind plugin config
├── package.json                # All dependencies
├── .env                        # VITE_API_URL (must be created locally)
│
└── src/
    ├── app/
    │   ├── App.jsx             # Root — Lenis scroll init, Socket.IO connection, router outlet
    │   └── routes.jsx          # All route definitions + ProtectedRoute RBAC guard
    │
    ├── services/
    │   └── api.js              # Axios instance — sets base URL from env, attaches JWT token
    │
    ├── styles/
    │   └── index.css           # Global Art Deco design tokens, body defaults, scrollbar styles
    │
    ├── shared/
    │   └── layout/
    │       ├── DashboardLayout.jsx   # Sidebar + top navbar shell wrapping all admin/lead pages
    │       └── Sidebar.jsx           # Navigation links, role-aware menu items, logout
    │
    └── features/               # All domain-specific logic lives here (one folder per feature)
        │
        ├── auth/
        │   ├── pages/Login.jsx       # Login form — submits credentials, saves JWT to Redux
        │   └── authSlice.js          # Redux slice — stores token, user object, handles logout
        │
        ├── landing/
        │   └── pages/Landing.jsx     # Public marketing page — live incident feed, pricing, hero
        │
        ├── incidents/
        │   ├── pages/
        │   │   ├── IncidentDetail.jsx          # Full incident view — timeline, responders, AI diagnostics, postmortem
        │   │   └── PublicStatusDashboard.jsx   # Public /status page — real-time incident status without login
        │   ├── incidentSlice.js      # Redux slice for incidents list + status updates
        │   └── services/incidents.api.js       # All incident API calls (fetch, create, assign, status, AI)
        │
        ├── admin/
        │   └── pages/
        │       ├── DashboardOverview.jsx        # Admin home — live stats, incident count, team overview
        │       ├── IncidentManagement.jsx       # Admin incident table — create, filter, status management
        │       ├── TeamManagement.jsx           # Personnel + Squads — create users, assign roles & squads, appoint leads
        │       ├── InfrastructureManagement.jsx # Service health monitoring + infrastructure map
        │       ├── AutomationManagement.jsx     # AI intelligence engine — analysis logs, postmortems
        │       └── AdminSettings.jsx            # Profile card + logout
        │
        ├── teamLead/
        │   └── pages/TeamLeadDashboard.jsx      # Team Lead workspace — incident log, assign responders, manage squad members
        │
        ├── bugger/
        │   └── pages/
        │       ├── BuggerDashboard.jsx           # Bugger's own submitted reports list
        │       └── BuggerReport.jsx              # Bug submission form
        │
        ├── responder/
        │   └── pages/ResponderDashboard.jsx      # Incidents assigned to this responder
        │
        ├── groups/
        │   ├── groupSlice.js          # Redux slice — squads/groups list
        │   └── services/group.api.js  # Group CRUD API calls
        │
        ├── users/
        │   ├── userSlice.js           # Redux slice — all users list
        │   └── services/user.api.js   # Fetch users, create user API calls
        │
        └── project/
            ├── projectSlice.js        # Redux slice — projects list
            └── services/project.api.js
```

---

## Role-Based Access

The app enforces RBAC at both the **route level** (`ProtectedRoute` in `routes.jsx`) and the **UI level** (conditional rendering per role).

| Role | Dashboard | Key Capabilities |
|---|---|---|
| `admin` | `/admin/*` | Manage all users, squads, incidents, infrastructure, automation |
| `teamLead` | `/team-lead/*` | Assign responders, manage squad members, update incident status |
| `teamMember` | `/team-lead/*` | View assigned incidents, add timeline updates |
| `bugger` | `/bugger/*` | Submit bug reports, view own submissions |
| `responder` | `/responder/*` | View & action incidents assigned to them |

---

## Key Pages

| Route | Who Can Access | What It Does |
|---|---|---|
| `/` | Public | Landing page with live incident ticker |
| `/login` | Public | JWT authentication |
| `/status` | Public | Real-time service status dashboard |
| `/admin/dashboard` | Admin | Overview stats, quick actions |
| `/admin/incidents` | Admin | Full incident management |
| `/admin/team` | Admin | Create users, build squads, assign leads |
| `/admin/automation` | Admin | AI analysis log + postmortems |
| `/admin/infrastructure` | Admin | Service health monitoring |
| `/team-lead` | Team Lead | Squad overview, unassigned incident alerts |
| `/team-lead/incidents` | Team Lead | Incident table with responder assignment |
| `/incident/:id` | Admin + Lead | Full incident detail with AI diagnostics & timeline |
| `/bugger/report` | Bugger | Bug report submission form |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Backend server running on port `5000` (see `../Backend/README.md`)

### Install & Run

```bash
cd Frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

### Environment Variables

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Design System

IntelOps uses a custom **Art Deco** visual language defined in `src/styles/index.css` and applied throughout via Tailwind utility classes and inline styles.

| Token | Value | Usage |
|---|---|---|
| Obsidian | `#0A0A0A` | Page backgrounds |
| Charcoal | `#141414` | Cards, panels |
| Gold | `#D4AF37` | Accents, borders, icons |
| Cream | `#F2F0E4` | Primary text |
| Heading font | `Marcellus` | Titles, labels |
| Body font | `Josefin Sans` | All UI text |

Recurring motifs: rotated diamond shapes, Art Deco corner brackets, gold geometric grid background pattern.

---

## Build for Production

```bash
npm run build      # Output in /dist
npm run preview    # Preview built app locally
```
