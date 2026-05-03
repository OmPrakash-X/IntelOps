import { createBrowserRouter } from "react-router";

import Home from "@/features/home/pages/Home";
import Login from "@/features/auth/pages/Login";
import AdminBuggers from "@/features/admin/pages/AdminBuggers";
import AdminIssues from "@/features/admin/pages/AdminIssues";
import TeamDashboard from "@/features/team/pages/TeamDashboard";
import BuggerDashboard from "@/features/bugger/pages/BuggerDashboard";
import RootLayout from "./RootLayout";
import AdminTeams from "@/features/admin/pages/AdminTeams";
import AdminLayout from "@/features/admin/pages/AdminLayout";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import TeamLayout from "@/features/team/pages/TeamLayout";
import TeamTeams from "@/features/team/pages/TeamTeams";
import TeamAssign from "@/features/team/pages/TeamAssign";
import TeamIssues from "@/features/team/pages/TeamIssues";
import BuggerLayout from "@/features/bugger/pages/BuggerLayout";
import BuggerIssues from "@/features/bugger/pages/BuggerIssues";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/account/login",
        element: <Login />,
      },
      {
        path: "/admin/dashboard",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "teams",
            element: <AdminTeams />,
          },
          {
            path: "buggers",
            element: <AdminBuggers />,
          },
          {
            path: "issues",
            element: <AdminIssues />,
          },
        ],
      },
      {
        path: "/team/dashboard",
        element: <TeamLayout />,
        children: [
          {
            index: true,
            element: <TeamDashboard />,
          },
          {
            path: "teams",
            element: <TeamTeams />,
          },
          {
            path: "team/assigent",
            element: <TeamAssign />,
          },
          {
            path: "issues",
            element: <TeamIssues />,
          },
        ],
      },
      {
        path: "/bugger/dashboard",
        element: <BuggerLayout />,
        children: [
          {
            index: true,
            element: <BuggerDashboard />,
          },
          {
            path: "issues",
            element: <BuggerIssues />,
          },
        ],
      },

    ],
  },
]);