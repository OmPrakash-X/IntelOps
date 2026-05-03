import { createBrowserRouter } from "react-router";

import Home from "@/features/home/pages/Home";
import Login from "@/features/auth/pages/Login";
import RootLayout from "./RootLayout";

// Admin
import AdminLayout from "@/features/admin/pages/AdminLayout";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import AdminTeams from "@/features/admin/pages/AdminTeams";
import AdminBuggers from "@/features/admin/pages/AdminBuggers";
import AdminIssues from "@/features/admin/pages/AdminIssues";

// Team Lead (uses shared sidebar layout)
import TeamLayout from "@/features/team/pages/TeamLayout";
import TeamLeadDashboard from "@/features/teamLead/pages/TeamLeadDashboard";
import TeamTeams from "@/features/team/pages/TeamTeams";
import TeamAssign from "@/features/team/pages/TeamAssign";
import TeamIssues from "@/features/team/pages/TeamIssues";

// Responder (standalone full-page — has own sidebar)
import ResponderDashboard from "@/features/responder/pages/ResponderDashboard";

// Bugger (uses shared sidebar layout)
import BuggerLayout from "@/features/bugger/pages/BuggerLayout";
import BuggerDashboard from "@/features/bugger/pages/BuggerDashboard";
import BuggerIssues from "@/features/bugger/pages/BuggerIssues";

// Shared
import IncidentDetail from "@/features/incidents/pages/IncidentDetail";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ─── Public ──────────────────────────────────────────────────────────
      { path: "/", element: <Home /> },
      { path: "/account/login", element: <Login /> },

      // ─── Shared (all authenticated roles) ────────────────────────────────
      { path: "/incidents/:id", element: <IncidentDetail /> },

      // ─── Responder (standalone — has own full-page layout) ────────────────
      { path: "/responder/dashboard", element: <ResponderDashboard /> },

      // ─── Admin ────────────────────────────────────────────────────────────
      {
        path: "/admin/dashboard",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "teams", element: <AdminTeams /> },
          { path: "buggers", element: <AdminBuggers /> },
          { path: "issues", element: <AdminIssues /> },
        ],
      },

      // ─── Team Lead (sidebar layout) ───────────────────────────────────────
      {
        path: "/team/dashboard",
        element: <TeamLayout />,
        children: [
          { index: true, element: <TeamLeadDashboard /> },
          { path: "teams", element: <TeamTeams /> },
          { path: "team/assigent", element: <TeamAssign /> },
          { path: "issues", element: <TeamLeadDashboard /> },
          { path: "notifications", element: <TeamLeadDashboard /> },
        ],
      },

      // ─── Bugger (sidebar layout) ──────────────────────────────────────────
      {
        path: "/bugger/dashboard",
        element: <BuggerLayout />,
        children: [
          { index: true, element: <BuggerDashboard /> },
          { path: "issues", element: <BuggerIssues /> },
        ],
      },
    ],
  },
]);