import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Lock, Globe, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../auth/authSlice';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const sections = [
    { title: 'Profile Settings', icon: User, desc: 'Manage your personal information and preferences' },
    { title: 'Security', icon: Lock, desc: 'Update password and multi-factor authentication' },
    { title: 'Notifications', icon: Bell, desc: 'Configure system alerts and email reports' },
    { title: 'System Config', icon: Shield, desc: 'Platform-wide administrative settings' },
    { title: 'API & Integrations', icon: Globe, desc: 'Manage API keys and external webhooks' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl space-y-8"
    >
      <div>
        <h2 className="text-2xl font-black tracking-tight">Settings</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configure your IntelOps experience</p>
      </div>

      <div className="p-8 rounded-[32px] bg-slate-900 border border-slate-800 flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-600/30">
          {(user?.username || 'A').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-white">{user?.username || 'Administrator'}</h3>
          <p className="text-slate-500 text-sm font-bold">{user?.email || 'admin@intelops.io'}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
              {user?.role || 'System Admin'}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sections.map((section, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                <section.icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{section.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{section.desc}</p>
              </div>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all">
              <Lock size={14} className="text-slate-600" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminSettings;
