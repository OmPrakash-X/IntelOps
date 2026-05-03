import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, ArrowRight, Sparkles, Activity, 
  Zap, ChevronRight, Check, Play, Lock, 
  ShieldAlert, BarChart3, Terminal, Layers, 
  Box, Cpu, Globe, ArrowUpRight,
  Users,Clock,Database
} from 'lucide-react';
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_API || 'http://localhost:3000';

// --- Animated Counter ---
const Counter = ({ end, suffix = "", delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    let timer;
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const increment = end / (duration / 16);
          timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [ref, end]);

  return (
    <span ref={setRef} className="font-mono">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [incidents, setIncidents] = useState([]);
  const [incLoading, setIncLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${BASE}/api/incidents`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setIncidents(res.data?.data || res.data || []))
      .catch(() => setIncidents([]))
      .finally(() => setIncLoading(false));
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });
  };

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 overflow-x-hidden font-['Inter'] relative">
      {/* Dynamic Background Glow */}
      <motion.div 
        animate={{
          x: mousePos.x - 400,
          y: mousePos.y - 400,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 0.5 }}
        className="fixed top-0 left-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0"
      />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        @keyframes borderPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1.5px;
          bottom: -4px;
          left: 0;
          background-color: #4F46E5;
          transition: width 0.2s ease-in-out;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .shimmer-btn {
          position: relative;
          overflow: hidden;
        }
        .shimmer-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transform: rotate(45deg);
          transition: 0.5s;
        }
        .card-flat {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }
        .card-flat:hover {
          border-color: #e2e8f0;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
        }
        .premium-btn {
          position: relative;
          background: #4F46E5;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: 0.5s;
        }
        .premium-btn:hover::before {
          left: 100%;
        }
        .btn-aura {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .premium-btn:hover .btn-aura {
          opacity: 1;
          animation: aura-pulse 2s infinite;
        }
        @keyframes aura-pulse {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0.4; }
        }
        @keyframes float {
        .card-glow::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(45deg, transparent, rgba(79, 70, 229, 0.3), transparent);
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s;
        }
        .card-glow:hover::before {
          opacity: 1;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
              <Shield size={22} className="text-white" />
            </div>
            <span className="text-xl font-['Plus_Jakarta_Sans'] font-black tracking-tighter uppercase">IntelOps</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <button onClick={() => scrollTo('features')} className="nav-link hover:text-indigo-600 transition-colors">Platform</button>
            <button onClick={() => scrollTo('incidents')} className="nav-link hover:text-indigo-600 transition-colors">Solutions</button>
            <button onClick={() => scrollTo('incidents')} className="nav-link hover:text-indigo-600 transition-colors">System Status</button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 group"
          >
            <Lock size={14} className="group-hover:rotate-12 transition-transform" />
            Internal Portal
          </motion.button>
        </div>
      </nav>

      {/* HERO SECTION (Fits in 100vh) */}
      <section onMouseMove={handleMouseMove} className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span style={{ animation: 'pulse 2s infinite' }} className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              LIVE: {incidents.filter(i => i.status !== 'resolved').length} Active Incident{incidents.filter(i => i.status !== 'resolved').length !== 1 ? 's' : ''}
            </div>

            <h1 className="text-6xl md:text-7xl xl:text-8xl font-['Plus_Jakarta_Sans'] font-black leading-[1.05] tracking-tighter mb-8 text-slate-900">
              From Chaos <br />
              to <span className="text-indigo-600 italic">Clarity</span>
            </h1>

            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-xl mb-12 opacity-80">
              The autonomous intelligence platform for modern SRE teams. Resolve incidents before they impact your customers with AI-powered detection and 70% faster MTTR.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <motion.button 
                whileHover={{ 
                  scale: 1.05, 
                  y: -4,
                  boxShadow: '0 20px 40px rgba(79, 70, 229, 0.4)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollTo('incidents')}
                className="premium-btn px-8 py-4.5 rounded-2xl text-white font-black text-[13px] uppercase tracking-widest flex items-center gap-3 group"
              >
                <div className="btn-aura" />
                <span className="relative z-10 flex items-center gap-3">
                  View Live Status 
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05, y: -4, backgroundColor: '#f8fafc' }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-black text-[13px] uppercase tracking-widest transition-all flex items-center gap-3 group"
              >
                Watch Demo 
                <Play size={16} className="fill-slate-900 group-hover:scale-110 transition-transform" />
              </motion.button>
            </div>

            <div className="flex items-center gap-8 text-[12px] font-black text-slate-400 uppercase tracking-widest mb-12">
              <div className="flex flex-col gap-1">
                <span className="text-slate-900 text-lg">187,450+</span>
                <span className="text-[9px]">Incidents Resolved</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex flex-col gap-1">
                <span className="text-slate-900 text-lg">94%</span>
                <span className="text-[9px]">MTTR Reduction</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex flex-col gap-1">
                <span className="text-slate-900 text-lg">99.98%</span>
                <span className="text-[9px]">Uptime</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Used by</span>
              <div className="flex gap-4 opacity-40 grayscale text-[10px] font-black">
                <span>VERCEL</span>
                <span>LINEAR</span>
                <span>FIGMA</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative group"
          >
            {/* Spinning Glow Backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/15 blur-[120px] rounded-full -z-20 animate-[spin_30s_linear_infinite]" />
            <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full -z-10" />
            
            <div className="relative rounded-[40px] p-2 bg-white shadow-2xl border border-slate-100 overflow-hidden group-hover:shadow-indigo-500/10 transition-all duration-700">
              <motion.div 
                style={{ 
                  x: mousePos.x * 0.005,
                  y: mousePos.y * 0.005 
                }}
                className="relative rounded-[32px] overflow-hidden border border-slate-200 shadow-inner bg-slate-50"
              >
                <img 
                  src="/intelops_hero_light.png" 
                  alt="IntelOps Dashboard" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none" />
              </motion.div>
              
              {/* Floating AI Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -8, 0],
                  x: mousePos.x * -0.015,
                  translateY: mousePos.y * -0.015
                }}
                transition={{ 
                  delay: 0.8, 
                  duration: 0.6,
                  y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  x: { type: 'spring', damping: 25, stiffness: 80 }
                }}
                className="absolute bottom-10 left-10 lg:w-[300px] bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white z-10"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:rotate-12 transition-transform">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-0.5">Autonomous Agent</div>
                    <div className="text-[14px] font-black text-slate-900 leading-none">Diagnostic Reasoning</div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 mb-4 group-hover:bg-indigo-50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Incident Detected</span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight">
                    Microservice <span className="text-indigo-600 font-black">auth-v2</span> reporting high thread exhaustion.
                  </p>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[98%] h-full bg-indigo-600" />
                    </div>
                    <span className="text-[12px] font-black text-indigo-600">98%</span>
                  </div>
                </div>
              </motion.div>
            </div>
              {/* Resolution Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -bottom-10 -right-10 hidden xl:block"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-4 w-48 border border-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <Check size={18} />
                    </div>
                    <div>
                      <div className="text-[12px] font-black text-slate-900">Incident Resolved</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">INC-9481 • 4m ago</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
        </div>
      </section>

      {/* BENTO FEATURES (#features) */}
      <section id="features" className="py-32 bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight mb-4">Platform Capabilities</h2>
            <p className="text-slate-500 font-medium italic">Autonomous intelligence for modern SRE teams.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Large Card - Elevated & Professional */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -5,
                boxShadow: '0 20px 40px -10px rgba(15,23,42,0.1)'
              }}
              viewport={{ once: true }}
              className="lg:col-span-6 bg-[#0F172A] rounded-[40px] p-12 text-white relative overflow-hidden group border border-white/5"
            >
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Activity size={32} className="text-indigo-400" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">Real-time Visibility Engine</h3>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md mb-12">
                  Deep visibility across your entire stack. Monitor thousands of microservices with zero latency overhead.
                </p>
                <div className="mt-auto flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[11px]">
                  Explore Visibility <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* Small Grid - Bordered & Subtle */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Terminal, title: "Trace Analysis", desc: "Code-level root cause.", type: 'bordered' },
                { icon: Layers, title: "Impact Analysis", desc: "Revenue risk mapping.", type: 'filled' },
                { icon: Zap, title: "Remediation", desc: "Autonomous fixes.", type: 'bordered' },
                { icon: Box, title: "Audit Trail", desc: "Compliant timelines.", type: 'filled' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)' }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={`${item.type === 'bordered' ? 'bg-white border border-slate-200' : 'bg-slate-50 border border-transparent'} rounded-[32px] p-8 transition-all group cursor-pointer`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 ${item.type === 'bordered' ? 'bg-slate-50 text-indigo-600' : 'bg-white text-indigo-600 shadow-sm'}`}>
                    <item.icon size={22} />
                  </div>
                  <h4 className="font-black text-slate-900 mb-2 tracking-tight uppercase text-[12px]">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* LIVE SYSTEM STATUS PREVIEW */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-4">Live System Status Preview</h2>
            <p className="text-slate-500 font-medium">Real-time health of our global infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "API Gateway", icon: Globe, status: "Operational", uptime: "99.9%", color: "emerald" },
              { name: "Database Cluster", icon: Database, status: "Degraded", uptime: "98.2%", color: "amber" },
              { name: "Auth Service", icon: Lock, status: "Operational", uptime: "100%", color: "emerald" },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] border border-slate-100 bg-white hover:shadow-xl transition-all group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-12 h-12 rounded-xl bg-${service.color}-50 text-${service.color}-600 flex items-center justify-center`}>
                    <service.icon size={24} />
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-${service.color}-50 border border-${service.color}-100`}>
                    <span className={`w-2 h-2 rounded-full bg-${service.color}-500 ${service.color === 'emerald' ? 'animate-pulse' : 'animate-bounce'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest text-${service.color}-700`}>{service.status}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{service.name}</h3>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</span>
                  <span className="text-lg font-black text-slate-900">{service.uptime}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE INCIDENT FEED (#incidents) */}
      <section id="incidents" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Live Incident Activity</h2>
              <p className="text-slate-500 font-medium">Real-time feed from our command center.</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[10px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Monitoring Live
            </div>
          </div>

          {incLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-10 p-8 rounded-[24px] border border-slate-100 bg-white animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-20 text-center border border-slate-100 rounded-[32px] bg-white">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <Activity size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">All Systems Operational</h3>
              <p className="text-slate-400 font-medium text-sm">No active incidents at this time.</p>
            </div>
          ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-4"
          >
            {incidents.slice(0, 5).map((incident, i) => {
              const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : 'P3';
              return (
              <motion.div 
                key={incident._id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.005, x: 10 }}
                onClick={() => navigate(`/incident/${incident._id}`)}
                className={`group flex items-center justify-between p-8 rounded-[24px] border border-slate-100 cursor-pointer transition-all bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5`}
              >
                <div className="flex items-center gap-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${
                      sev === 'P1' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' : 
                      sev === 'P2' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-[10px] font-black text-slate-400">{new Date(incident.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-5 mb-2">
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{incident.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg tracking-widest border ${
                          sev === 'P1' ? 'bg-red-50 border-red-100 text-red-600' : 
                          sev === 'P2' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {sev}
                        </span>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg tracking-widest border ${
                          incident.status === 'resolved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {incident.status}
                        </span>
                        {incident.status !== 'resolved' && i === 0 && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg tracking-[0.2em]">
                            <Zap size={10} className="text-indigo-400" /> Active
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Layers size={14} className="text-slate-300" /> {incident.project?.name || 'System'}</span>
                      <span className="flex items-center gap-2"><Users size={14} className="text-slate-300" /> {incident.createdBy?.username || 'System'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </motion.div>
            )})}
          </motion.div>
          )}
        </div>
      </section>

      {/* STATS ROW (Dark Break) */}
      <section className="bg-[#050810] py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
            {[
              { label: "Incidents Resolved", value: 187450, suffix: "+" },
              { label: "Reduction in MTTR", value: 71, suffix: "%" },
              { label: "Active Integrations", value: 128, suffix: "+" },
              { label: "System Uptime", value: 99, suffix: "%", decimals: 2 },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-3"
              >
                <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING (#pricing) */}
      <section id="pricing" className="py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-8">Ready for Production?</h2>
            
            {/* Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-200/50 rounded-xl mb-12">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${!isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Yearly <span className="text-indigo-600">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Starter" 
              price="$0" 
              features={['5 Active Monitors', 'Daily AI Scans', 'Basic Root Cause', '7-day Retention']} 
              delay={0} 
            />
            <PricingCard 
              title="Growth" 
              price={isAnnual ? "$39" : "$49"} 
              recommended={true} 
              features={['Unlimited Monitors', 'Auto-Remediation', 'Real-time Telemetry', 'Slack & PagerDuty', '30-day Retention']} 
              delay={0.1} 
            />
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              features={['Air-gap Deployment', 'SLA Guarantee', 'Dedicated SRE', 'Custom Integrations', 'Unlimited Retention']} 
              isEnterprise={true}
              delay={0.2} 
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#050810] py-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-8">
              Ready to cut your <br />
              MTTR by <span className="text-indigo-500">70%?</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button 
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: '0 25px 50px rgba(79, 70, 229, 0.5)'
                }}
                whileTap={{ scale: 0.98 }}
                className="premium-btn px-10 py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest"
              >
                <div className="btn-aura" />
                <span className="relative z-10">Start Free Trial</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05, y: -5, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-white/5 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-white/10 flex items-center gap-3 group"
              >
                Book Demo <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Trust Logos */}
          <div className="pt-16 border-t border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10">Trusted by Engineering Leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale contrast-125">
              <span className="text-xl font-black text-white tracking-tighter">VERCEL</span>
              <span className="text-xl font-black text-white tracking-tighter">DOCKER</span>
              <span className="text-xl font-black text-white tracking-tighter">KUBERNETES</span>
              <span className="text-xl font-black text-white tracking-tighter">PROMETHEUS</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const PricingCard = ({ title, price, features, recommended, isEnterprise, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ 
      scale: 1.02, 
      y: -10,
      rotateX: 2,
      rotateY: -2
    }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className={`relative p-10 pt-16 rounded-[40px] bg-white border ${recommended ? 'border-indigo-500 shadow-xl' : 'border-slate-100 shadow-sm'} flex flex-col h-full transition-all duration-500`}
  >
    {recommended && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-indigo-600/40 z-30 border-2 border-white">
        Most Popular
      </div>
    )}
    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${recommended ? 'text-indigo-500' : 'text-slate-400'}`}>{title}</h3>
    <div className="text-6xl font-black text-slate-900 mb-10 tracking-tighter">{price}</div>
    <div className="space-y-5 mb-12 flex-1">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-4 text-sm font-bold text-slate-600 group/item">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${recommended ? 'bg-indigo-600' : 'bg-slate-900'} text-white group-hover/item:scale-110 transition-transform`}>
            <Check size={12} />
          </div>
          {f}
        </div>
      ))}
    </div>
    <motion.button 
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl relative overflow-hidden ${
        recommended ? 'premium-btn text-white' : 
        isEnterprise ? 'bg-slate-900 text-white hover:bg-slate-800' : 
        'bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50'
      }`}
    >
      {recommended && <div className="btn-aura" />}
      <span className="relative z-10">
        {isEnterprise ? 'Contact Sales' : 'Get Started'}
      </span>
    </motion.button>
  </motion.div>
);

export default Landing;
