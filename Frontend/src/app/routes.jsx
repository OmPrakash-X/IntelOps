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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 font-['Inter']">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin mb-8" />
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest opacity-50 mb-2">Syncing Profile</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">Securing your session...</p>
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
        <ResponderDashboard />
      </ProtectedRoute>
    ),
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-10 font-['Inter'] text-center">
        <h1 className="text-9xl font-black opacity-10">404</h1>
        <h2 className="text-4xl font-black mb-4">Route Missing</h2>
        <a href="/" className="px-8 py-3 bg-indigo-600 rounded-xl font-black uppercase tracking-widest text-xs">Return Home</a>
      </div>
    )
  }
]);