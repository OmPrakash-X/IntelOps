import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, Server, Users, Zap,
  Settings, LogOut, Bell, Shield, Menu, X, ChevronRight, Activity
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { getSocket } from '../../lib/socket';
import API from '../../services/api';

const sidebarConfigs = {
  admin: [
    { name: 'Dashboard',       path: '/admin',                icon: LayoutDashboard },
    { name: 'Incidents',       path: '/admin/incidents',      icon: AlertTriangle },
    { name: 'Infrastructure',  path: '/admin/infrastructure', icon: Server },
    { name: 'SRE Team',        path: '/admin/team',           icon: Users },
    { name: 'Automation',      path: '/admin/automation',     icon: Zap },
    { name: 'Settings',        path: '/admin/settings',       icon: Settings },
  ],
  teamlead: [
    { name: 'Dashboard',       path: '/team-lead',                  icon: LayoutDashboard },
    { name: 'My Group',        path: '/team-lead/group',            icon: Users },
    { name: 'Incidents Log',   path: '/team-lead/incidents',        icon: AlertTriangle },
    { name: 'Notifications',   path: '/team-lead/notifications',    icon: Bell },
  ],
  bugger: [
    { name: 'Dashboard',       path: '/bugger',                     icon: LayoutDashboard },
    { name: 'My Incidents',    path: '/bugger/incidents',           icon: AlertTriangle },
    { name: 'Report Bug',      path: '/bugger/report',              icon: Zap },
    { name: 'Notifications',   path: '/bugger/notifications',       icon: Bell },
  ],
  teammember: [
    { name: 'My Workspace',    path: '/member',                     icon: LayoutDashboard },
    { name: 'Notifications',   path: '/member/notifications',       icon: Bell },
  ],
};

export default function DashboardLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useSelector(s => s.auth);

  const [sideOpen,   setSideOpen]   = useState(true);
  const [notifs,     setNotifs]     = useState([]);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const notifRef = useRef(null);

  const unread = notifs.filter(n => !n.isRead).length;

  const loadNotifs = async () => {
    try { const r = await API.get('/notifications'); setNotifs(r.data?.data || r.data || []); }
    catch {}
  };

  useEffect(() => { loadNotifs(); }, []);

  useEffect(() => {
    const s = getSocket();
    const fn = () => loadNotifs();
    s.on('new_notification', fn); s.on('notification', fn);
    return () => { s.off('new_notification', fn); s.off('notification', fn); };
  }, []);

  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAllRead = async () => {
    await Promise.all(notifs.filter(n => !n.isRead).map(n => API.patch(`/notifications/${n._id}/read`).catch(() => {})));
    loadNotifs();
  };

  const role     = (user?.role || user?.user?.role)?.toLowerCase();
  const navItems = sidebarConfigs[role] || [];

  const getTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    if (item) return item.name;
    if (location.pathname.startsWith('/incident/')) return 'Incident Details';
    return 'Command Center';
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0A0A0A] font-['Josefin_Sans'] text-[#F2F0E4]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Josefin+Sans:wght@300;400;600;700&display=swap');
        .gold-nav-active { background: rgba(212,175,55,0.12); border-left: 2px solid #D4AF37; color: #D4AF37; }
        .gold-nav-idle   { border-left: 2px solid transparent; color: #666; }
        .gold-nav-idle:hover { background: rgba(212,175,55,0.06); color: #D4AF37; border-left-color: rgba(212,175,55,0.4); }
        .deco-scrollbar::-webkit-scrollbar { width:4px; }
        .deco-scrollbar::-webkit-scrollbar-track { background:transparent; }
        .deco-scrollbar::-webkit-scrollbar-thumb { background:rgba(212,175,55,0.2); border-radius:0; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <motion.aside
        initial={false}
        animate={{ width: sideOpen ? 260 : 68 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="h-screen flex flex-col relative z-50 shrink-0 bg-[#0e0e0e] border-r border-[#D4AF37]/15"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#D4AF37]/10">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 border-2 border-[#D4AF37] rotate-45 shadow-[0_0_12px_rgba(212,175,55,0.2)] bg-transparent">
            <Shield size={15} color="#D4AF37" className="-rotate-45" />
          </div>
          <AnimatePresence>
            {sideOpen && (
              <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }}>
                <p className="font-['Marcellus'] text-xs font-black uppercase tracking-[0.22em] text-[#D4AF37] whitespace-nowrap">IntelOps</p>
                <p className="text-[8px] uppercase tracking-[0.18em] text-[#555]">
                  {role === 'admin' ? 'Command Centre' : role === 'teamlead' ? 'Team Command' : role === 'teammember' ? 'Responder Hub' : 'Reporter Hub'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 overflow-y-auto deco-scrollbar flex flex-col gap-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={['/admin','/team-lead','/bugger', '/member'].includes(item.path)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 transition-all duration-200 cursor-pointer ${isActive ? 'gold-nav-active' : 'gold-nav-idle'}`}
            >
              <item.icon size={17} className="shrink-0" />
              <AnimatePresence>
                {sideOpen && (
                  <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    className="text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap">
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-[#D4AF37]/10">
          {sideOpen && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 border border-[#D4AF37]/12 bg-[#D4AF37]/[0.04]">
              <div className="shrink-0 flex items-center justify-center w-7 h-7 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-black">
                {(user?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold truncate text-[#F2F0E4]">{user?.username || 'Admin'}</p>
                <p className="text-[8px] uppercase tracking-widest text-[#555]">{role}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { dispatch(logout()); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 border-l-2 border-transparent text-[#666] hover:text-[#ef4444] hover:border-l-[#ef4444]/40 hover:bg-[#ef4444]/5 cursor-pointer bg-transparent border-t-0 border-r-0 border-b-0"
          >
            <LogOut size={17} className="shrink-0" />
            <AnimatePresence>
              {sideOpen && (
                <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="text-[10px] font-bold uppercase tracking-[0.18em]">Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

      </motion.aside>

      {/* ── MAIN ── */}
      <main className="flex-1 h-screen overflow-y-auto deco-scrollbar bg-[#0A0A0A]">

        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 h-16 bg-[#0A0A0A]/92 backdrop-blur-[12px] border-b border-[#D4AF37]/12">
          <div className="flex items-center gap-3">
            <span className="w-0.5 h-5 bg-[#D4AF37] opacity-60" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">{getTitle()}</h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Live badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] border border-[#D4AF37]/25 text-[#D4AF37]">
              <Activity size={10} />
              Live Engine
            </div>

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)}
                className={`relative flex items-center justify-center p-1.5 transition-colors cursor-pointer bg-transparent border-none ${notifOpen ? 'text-[#D4AF37]' : 'text-[#666] hover:text-[#D4AF37]'}`}>
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-3.5 px-1 text-[8px] font-black bg-[#D4AF37] text-[#0A0A0A]">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
                    className="absolute right-0 top-full mt-2 w-80 z-50 overflow-hidden bg-[#141414] border border-[#D4AF37]/25 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[#D4AF37]/10">
                      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">Notifications</span>
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-[8px] font-bold uppercase tracking-widest text-[#888] hover:text-[#D4AF37] transition-colors bg-transparent border-none cursor-pointer">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto deco-scrollbar divide-y divide-[#D4AF37]/[0.06]">
                      {notifs.length === 0 ? (
                        <div className="py-10 text-center text-[10px] tracking-widest uppercase text-[#444]">No notifications yet</div>
                      ) : notifs.slice(0, 15).map((n, i) => (
                        <div key={n._id || i} className={`px-5 py-3 border-b border-[#D4AF37]/[0.06] ${!n.isRead ? 'bg-[#D4AF37]/[0.04]' : ''}`}>
                          <div className="flex items-start gap-2">
                            {!n.isRead && <span className="mt-1.5 shrink-0 w-1.5 h-1.5 bg-[#D4AF37]" />}
                            <div className={!n.isRead ? '' : 'ml-3.5'}>
                              <p className="text-xs leading-snug text-[#F2F0E4]">{n.message}</p>
                              <p className="text-[8px] mt-1 tracking-widest uppercase text-[#555]">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
