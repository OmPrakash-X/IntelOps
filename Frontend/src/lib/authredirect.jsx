import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { setSessionExpired } from "@/features/auth/auth.slice";

export default function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const pathname = location.pathname;
  const { user, isAuthenticated, loading, sessionExpired } = useSelector(
    (state) => state.auth
  );

  const getRoleBasedRoute = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "bugger":
        return "/bugger/dashboard";
      case "teamLead":
      case "teamMember":
        return "/team/dashboard";
      default:
        return "/";
    }
  };

  const roleAccessMap = {
    admin: ["/admin"],
    bugger: ["/bugger"],
    teamLead: ["/team"],
    teamMember: ["/team"],
  };

  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/bugger") ||
    pathname.startsWith("/team");

  const canAccessRoute = (role, currentPath) => {
    const allowedPrefixes = roleAccessMap[role] || [];
    return allowedPrefixes.some((prefix) => currentPath.startsWith(prefix));
  };

  useEffect(() => {
    if (!loading && sessionExpired && pathname !== "/account/login") {
      dispatch(setSessionExpired(false));
      navigate("/account/login", { replace: true });
    }
  }, [loading, sessionExpired, pathname, navigate, dispatch]);

  useEffect(() => {
    if (!loading && !isAuthenticated && isProtectedRoute) {
      navigate("/account/login", { replace: true });
    }
  }, [loading, isAuthenticated, isProtectedRoute, navigate]);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role) {
      if (
        pathname === "/account/login" ||
        pathname === "/account/register"
      ) {
        navigate(getRoleBasedRoute(user.role), { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, pathname, navigate]);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role && isProtectedRoute) {
      const isAllowed = canAccessRoute(user.role, pathname);

      if (!isAllowed) {
        navigate(getRoleBasedRoute(user.role), { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, pathname, isProtectedRoute, navigate]);

  return null;
}