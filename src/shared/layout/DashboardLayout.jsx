import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Server, 
  Users, 
  Zap, 
  Settings, 
  LogOut, 
  Bell, 
  Shield,
  Menu,
  X,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const sidebarConfigs = {
  admin: [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Incidents', path: '/admin/incidents', icon: AlertTriangle },
    { name: 'Infrastructure', path: '/admin/infrastructure', icon: Server },
    { name: 'SRE Team', path: '/admin/team', icon: Users },
    { name: 'Automation', path: '/admin/automation', icon: Zap },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  teamlead: [
    { name: 'Dashboard', path: '/team-lead', icon: LayoutDashboard },
    { name: 'My Group', path: '/team-lead/group', icon: Users },
    { name: 'Incidents Log', path: '/team-lead/incidents', icon: AlertTriangle },
    { name: 'Notifications', path: '/team-lead/notifications', icon: Bell },
  ],
  bugger: [
    { name: 'Dashboard', path: '/bugger', icon: LayoutDashboard },
    { name: 'My Incidents', path: '/bugger/incidents', icon: AlertTriangle },
    { name: 'Report Bug', path: '/bugger/report', icon: Zap },
    { name: 'Notifications', path: '/bugger/notifications', icon: Bell },
  ],
};

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const role = (user?.role || user?.user?.role)?.toLowerCase();
  const navItems = sidebarConfigs[role] || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    if (currentItem) return currentItem.name;
    
    // Handle sub-pages or details
    if (location.pathname.startsWith('/incident/')) return 'Incident Details';
    return 'Command Center';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Inter'] flex overflow-hidden">
      {/* --- Sidebar --- */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="h-screen bg-slate-900/50 border-r border-white/5 flex flex-col relative z-50 backdrop-blur-xl"
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <Shield size={22} className="text-white" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-black tracking-tighter text-white whitespace-nowrap">IntelOps</h1>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 opacity-80 whitespace-nowrap">
                  {role === 'admin' ? 'Command Center' : role === 'teamlead' ? 'Team Command' : 'Reporter Hub'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin' || item.path === '/team-lead' || item.path === '/bugger'}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative
                ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xs font-black uppercase tracking-widest"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isSidebarOpen && (
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={14} />
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5">
          {isSidebarOpen && (
            <div className="mb-4 p-4 rounded-2xl bg-slate-950/50 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs">
                  {(user?.username || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black text-white truncate">{user?.username || 'Admin'}</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest truncate">{role || 'SRE Lead'}</p>
                </div>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all group
            `}
          >
            <LogOut size={20} className="shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xs font-black uppercase tracking-widest"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-lg shadow-black/50"
        >
          {isSidebarOpen ? <X size={12} /> : <Menu size={12} />}
        </button>
      </motion.aside>

      {/* --- Main Content --- */}
      <main className="flex-1 h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950">
        <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 sticky top-0 bg-slate-950/80 backdrop-blur-md z-40">
          <div>
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 border-2 border-slate-950" />
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Engine</span>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
