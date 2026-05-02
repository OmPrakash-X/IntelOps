import { createBrowserRouter } from "react-router";


import Home from "@/features/home/pages/Home";
import Login from "@/features/auth/pages/Login";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import TeamDashboard from "@/features/team/pages/TeamDashboard";
import BuggerDashboard from "@/features/bugger/pages/BuggerDashboard";
import RootLayout from "./RootLayout";

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
        element: <AdminDashboard />,
      },
      {
        path: "/team/dashboard",
        element: <TeamDashboard />,
      },
      {
        path: "/bugger/dashboard",
        element: <BuggerDashboard />,
      },
    ],
  },
]);