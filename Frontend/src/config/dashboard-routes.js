// src/config/dashboard-routes.js
import {
  LayoutDashboard,
  Bug,
  CircleAlert,
  Users,
  ClipboardList,
} from "lucide-react";

export const adminRoutes = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Buggers",
    href: "/admin/dashboard/buggers",
    icon: Bug,
  },
  {
    title: "Issues",
    href: "/admin/dashboard/issues",
    icon: CircleAlert,
  },
];

export const teamRoutes = [
  {
    title: "Dashboard",
    href: "/team/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Teams",
    href: "/team/dashboard/teams",
    icon: Users,
  },
  {
    title: "Team Assign",
    href: "/team/dashboard/team/assigent",
    icon: ClipboardList,
  },
  {
    title: "Issues",
    href: "/team/dashboard/issues",
    icon: CircleAlert,
  },
];

export const buggerRoutes = [
    {
        title: "Dashboard",
        href: "/bugger/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Issues",
        href: "/bugger/dashboard/issues",
        icon: CircleAlert,
    },
]