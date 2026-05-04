import { createBrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// pages
import Login from "../features/auth/pages/Login";
import DashboardLayout from "../shared/layout/DashboardLayout";
import DashboardOverview from "../features/admin/pages/DashboardOverview";
import IncidentManagement from "../features/admin/pages/IncidentManagement";
import InfrastructureManagement from "../features/admin/pages/InfrastructureManagement";
import TeamManagement from "../features/admin/pages/TeamManagement";
import AutomationManagement from "../features/admin/pages/AutomationManagement";
import AdminSettings from "../features/admin/pages/AdminSettings";
import TeamLeadDashboard from "../features/teamLead/pages/TeamLeadDashboard";
import ResponderDashboard from "../features/responder/pages/ResponderDashboard";
import BuggerDashboard from "../features/bugger/pages/BuggerDashboard";
import BuggerReport from "../features/bugger/pages/BuggerReport";
import Landing from "../features/landing/pages/Landing";
import IncidentDetail from "../features/incidents/pages/IncidentDetail";
import Unauthorized from "../shared/pages/Unauthorized";

// --- Role Redirection Logic ---
const RoleRedirect = () => {
  const { user } = useSelector((state) => state.auth);
  const role = (user?.role || user?.user?.role)?.toLowerCase();

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'teamlead') return <Navigate to="/team-lead" replace />;
  if (role === 'teammember') return <Navigate to="/member" replace />;
  if (role === 'bugger') return <Navigate to="/bugger" replace />;
  
  return <Navigate to="/login" replace />;
};

//Protected Route
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useSelector((state) => state.auth);

  // ❌ Not logged in
  if (!token) return <Navigate to="/login" replace />;

  // ⏳ Wait until full profile is loaded (user starts as {id,role} after login)
  if (token && !user?.username) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-10 font-['Josefin_Sans'] relative overflow-hidden">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-none rotate-45 animate-spin mb-10" />
          <h2 className="text-xl font-['Marcellus'] text-[#F2F0E4] uppercase tracking-[0.2em] mb-2">Syncing Profile</h2>
          <p className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.3em] opacity-80">Securing your command session...</p>
        </div>
      </div>
    );
  }

  // 🎭 Role check
  const userRole = (user.role || user.user?.role)?.toLowerCase();
  const lowerAllowedRoles = allowedRoles?.map(r => r.toLowerCase());

  if (lowerAllowedRoles && (!userRole || !lowerAllowedRoles.includes(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// 🚫 Public Route
const PublicRoute = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (token && user) {
    const role = (user.role || user.user?.role)?.toLowerCase();
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'teamlead') return <Navigate to="/team-lead" replace />;
    if (role === 'teammember') return <Navigate to="/member" replace />;
    if (role === 'bugger') return <Navigate to="/bugger" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: <RoleRedirect />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: "incidents", element: <IncidentManagement /> },
      { path: "infrastructure", element: <InfrastructureManagement /> },
      { path: "team", element: <TeamManagement /> },
      { path: "automation", element: <AutomationManagement /> },
      { path: "settings", element: <AdminSettings /> },
    ]
  },
  {
    path: "/team-lead",
    element: (
      <ProtectedRoute allowedRoles={["teamLead"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TeamLeadDashboard /> },
      { path: "group", element: <TeamLeadDashboard /> },
      { path: "incidents", element: <TeamLeadDashboard /> },
      { path: "notifications", element: <TeamLeadDashboard /> },
    ]
  },
  {
    path: "/bugger",
    element: (
      <ProtectedRoute allowedRoles={["bugger"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <BuggerDashboard /> },
      { path: "incidents", element: <BuggerDashboard /> },
      { path: "report", element: <BuggerReport /> },
      { path: "notifications", element: <BuggerDashboard /> },
    ]
  },
  {
    path: "/member",
    element: (
      <ProtectedRoute allowedRoles={["teamMember"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,                element: <ResponderDashboard /> },
      { path: "notifications",      element: <ResponderDashboard /> },
    ]
  },
  {
    path: "/incident/:id",
    element: <IncidentDetail />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F2F0E4] flex flex-col items-center justify-center p-10 font-['Josefin_Sans'] text-center">
        <h1 className="text-8xl font-['Marcellus'] text-[#D4AF37] opacity-20 mb-4 tracking-widest">404</h1>
        <h2 className="text-3xl font-['Marcellus'] uppercase tracking-[0.1em] mb-8">Route Missing</h2>
        <a href="/" className="px-6 py-3 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors font-bold uppercase tracking-[0.2em] text-[10px]">Return to IntelOps</a>
      </div>
    )
  }
]);