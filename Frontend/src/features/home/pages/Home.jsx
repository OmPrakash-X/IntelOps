import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import Landing from "@/features/landing/pages/Landing";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) return; // show landing page

    const roleRoutes = {
      admin: "/admin/dashboard",
      teamLead: "/team/dashboard",
      teamMember: "/responder/dashboard",
      bugger: "/bugger/dashboard",
    };

    navigate(roleRoutes[user?.role] || "/account/login", { replace: true });
  }, [isAuthenticated, loading, user, navigate]);

  // Show landing while loading auth or when not authenticated
  if (loading || !isAuthenticated) {
    return <Landing />;
  }

  return null;
}
