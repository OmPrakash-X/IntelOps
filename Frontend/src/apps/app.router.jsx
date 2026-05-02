import { createBrowserRouter } from "react-router";
import Home from "@/features/home/pages/Home";
import Login from "@/features/auth/pages/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/accounts/access/login",
    element: <Login />
  }
])