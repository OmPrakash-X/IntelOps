import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { login, fetchMyProfile } from '../authSlice';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Zap, Check, Lock, ArrowRight, MessageSquare, AlertCircle, Clock, ShieldAlert, Sparkles } from 'lucide-react';

const ActivityItem = ({ title, time, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all cursor-default"
  >
    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
      <Activity size={18} />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[14px] font-bold text-slate-100 tracking-tight">{title}</span>
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
        <Clock size={12} />
        <span>{time}</span>
      </div>
    </div>
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: isLoading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError(false);

    const res = await dispatch(login(form));
    if (res.error) {
      setError(true);
      return;
    }
    if (res.meta.requestStatus === "fulfilled") {
      const { user } = res.payload;
      const role = user.role.toLowerCase();

      if (role === "admin") navigate("/admin");
      else if (role === "teamlead") navigate("/team-lead");
      else if (role === "bugger") navigate("/bugger");
      else if (role === "teammember") navigate("/member");
      else navigate("/unauthorized");
    }
  };

  return (
    <div className="h-screen flex bg-white font-['Inter'] selection:bg-indigo-100 overflow-hidden">
      
      {/* LEFT SIDE: Brand & System Context (Dark Navy/Purple Gradient) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-12 overflow-hidden bg-[#0A0C14]">
        {/* Deep Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0C14] via-[#101428] to-[#0A0C14] z-0" />
        
        {/* Subtle Mesh & Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Branding */}
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/40 border border-white/10">
              <Shield className="text-white" size={28} />
            </div>
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans'] font-black text-3xl text-white tracking-tight leading-none uppercase">IntelOps</span>
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5">Incident response, in sync</span>
            </div>
          </motion.div>
        </div>

        {/* Operational Intelligence Cards */}
        <div className="relative z-10 space-y-8 max-w-sm">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-white font-black text-md tracking-tight uppercase">Operational</span>
              </div>
              <ShieldAlert size={16} className="text-emerald-500" />
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-300 font-medium text-[13px]">Core systems are performing within expected latency parameters.</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                      className="h-full w-full bg-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">Live Activity Feed</h4>
            <div className="space-y-3">
              <ActivityItem title="API latency spike detected" time="2 min ago" delay={0.4} />
              <ActivityItem title="Database connection stabilized" time="5 min ago" delay={0.5} />
              <ActivityItem title="Webhook delay resolved" time="12 min ago" delay={0.6} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0C14] bg-slate-800 flex items-center justify-center text-[10px] text-white font-black">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-[13px] font-bold text-slate-500 tracking-wide">3 engineers on-call</span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form (Clean White) */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] relative z-10"
        >
          {/* Internal Use Badge */}
          <div className="flex justify-center mb-6">
            <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl">
              <Lock size={12} className="text-indigo-400" />
              Internal Use Only
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white border border-slate-200/80 rounded-[32px] p-10 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-8">
              <h1 className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-slate-900 mb-2 tracking-tighter">
                IntelOps Workspace
              </h1>
              <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                Restricted to Authorized Team Members.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label htmlFor="email" className="block text-[11px] font-black text-slate-400 tracking-[0.1em] uppercase ml-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@intelops.ai"
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-[15px] text-slate-900 placeholder:text-slate-300 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-400/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" className="block text-[11px] font-black text-slate-400 tracking-[0.1em] uppercase">
                    Security Token
                  </label>
                  <button type="button" className="text-[10px] text-indigo-600 font-black hover:text-indigo-700 transition-colors uppercase tracking-widest">
                    Request Help
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-[15px] text-slate-900 placeholder:text-slate-300 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-400/10"
                    required
                  />
                  <Lock size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600"
                >
                  <AlertCircle size={20} />
                  <span className="text-[13px] font-bold">Access Denied: Invalid Credentials</span>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full h-15 rounded-2xl font-black text-[14px] text-white uppercase tracking-widest transition-all flex items-center justify-center shadow-2xl shadow-indigo-600/20 ${
                  isLoading 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying Identity...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-5">
              <div className="flex items-center gap-2 py-1.5 px-4 bg-white border border-slate-200 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Network: Secure Gateway Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>  
  );
};

export default Login;