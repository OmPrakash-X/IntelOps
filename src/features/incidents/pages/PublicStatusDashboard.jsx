import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight, Activity, Cpu, Zap, Check, Quote, Globe, ShieldAlert, Clock, Database, Key, Server, BrainCircuit, MessageSquare, Search } from 'lucide-react';
import { incidents, plans, severityConfig, services } from './dashboardData';

const useCountUp = (end, duration = 1500, startCount = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCount) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, startCount]);

  return count;
};

const AnimatedStat = ({ end, suffix = "", label, startCount }) => {
  const value = useCountUp(end, 1500, startCount);
  return (
    <div className="flex flex-col items-center">
      <div className="font-['Plus_Jakarta_Sans'] font-black text-4xl text-slate-900 mb-1">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
};

const ServiceCard = ({ service }) => {
  const isDegraded = service.status === 'degraded';
  return (
    <motion.div 
      whileHover={{ scale: 1.05, translateY: -5 }}
      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 relative group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${isDegraded ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
          <service.icon size={20} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDegraded ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isDegraded ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDegraded ? 'text-amber-600' : 'text-emerald-600'}`}>
            {service.status}
          </span>
        </div>
      </div>
      <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 text-[15px] mb-1">{service.name}</h4>
      <p className="text-[12px] text-slate-500 font-medium">Uptime: <span className="font-bold text-slate-800">{service.uptime}</span></p>
    </motion.div>
  );
};

const DashboardPreview = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full max-w-[500px] aspect-[4/3] bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.1)] border border-slate-200 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-sky-50/30"></div>
      
      {/* Mini Header */}
      <div className="h-12 border-b border-slate-100 px-4 flex items-center gap-2 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
        </div>
        <div className="h-4 w-24 bg-slate-100 rounded-full ml-4"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-900 rounded-lg"></div>
          <div className="h-5 w-16 bg-emerald-100 rounded-md border border-emerald-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-white border border-slate-100 rounded-xl p-3 flex flex-col justify-center gap-2 shadow-sm">
              <div className="h-3 w-12 bg-slate-100 rounded-full"></div>
              <div className="h-5 w-20 bg-slate-200 rounded-md"></div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-2 bg-white/40 border border-slate-100 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                {i === 1 ? <ShieldAlert size={14} /> : <Activity size={14} />}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className={`h-2.5 rounded-full ${i === 1 ? 'w-32 bg-slate-200' : 'w-24 bg-slate-100'}`}></div>
                <div className="h-2 w-16 bg-slate-50 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-6 w-32 h-40 bg-white shadow-2xl rounded-2xl border border-slate-100 p-4 z-20"
      >
        <div className="w-full h-full flex flex-col gap-3">
          <div className="h-10 w-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500 mx-auto">
            <Zap size={20} fill="currentColor" />
          </div>
          <div className="space-y-1.5 pt-2">
            <div className="h-2 w-full bg-slate-100 rounded-full"></div>
            <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
            <div className="h-2 w-full bg-slate-100 rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AIInsightsCard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-50">
          <BrainCircuit size={24} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 leading-tight">AI Diagnostic Agent</h3>
          <p className="text-[13px] text-indigo-600 font-bold uppercase tracking-wider">Active Monitoring</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-400 uppercase">Incoming telemetry</span>
          </div>
          <p className="text-slate-800 font-semibold text-lg leading-snug">
            "Root cause likely: <span className="text-indigo-600">DB connection timeout</span> on primary cluster eu-west-1a."
          </p>
        </div>

        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">+12</div>
          </div>
          <div className="text-[13px] font-bold text-slate-500 flex items-center gap-1.5">
            <Check size={16} className="text-emerald-500" /> Confidence Score: 98.4%
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function PublicStatusDashboard() {
  const [activeTab, setActiveTab] = useState('Active');
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const filteredIncidents = activeTab === 'Active' 
    ? incidents.filter(i => i.isActive)
    : incidents;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter'] selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative">
      
      {/* Sticky Top Status Bar */}
      <div className="sticky top-0 z-50">
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="w-full bg-emerald-500 text-white py-2.5 px-4 text-center text-[13px] font-bold tracking-wide flex items-center justify-center gap-3 shadow-lg"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          ALL SYSTEMS OPERATIONAL
        </motion.div>
        
        {/* Navbar */}
        <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-[72px] px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-['Plus_Jakarta_Sans'] font-bold text-lg shadow-lg">
              I
            </div>
            <span className="font-['Plus_Jakarta_Sans'] font-black text-slate-900 tracking-tight text-2xl">IntelOps</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors">Services</a>
            <a href="#pricing" className="text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors">Pricing</a>
            <Link to="/login" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
              Team Login <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-600 text-[12px] font-black uppercase tracking-widest mb-6">
              <Zap size={14} fill="currentColor" /> Live monitoring active
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-black text-5xl md:text-7xl text-slate-900 leading-[1.05] tracking-tight mb-8">
              From Chaos to Clarity in <span className="text-indigo-600">Incident Response</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
              IntelOps transforms messy telemetry into real-time status pages, AI insights, and actionable timelines for modern SaaS teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95">
                View Active Incidents
              </button>
              <button className="w-full sm:w-auto text-slate-600 hover:text-slate-900 px-8 py-4 font-bold text-sm transition-all flex items-center justify-center gap-2">
                Watch Demo <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full"></div>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="font-['Plus_Jakarta_Sans'] font-black text-3xl md:text-4xl text-slate-900 mb-4 tracking-tight">System Infrastructure</h2>
            <p className="text-slate-500 font-medium">Real-time status tracking for our core services.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <ServiceCard key={i} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content (Incidents + AI) */}
      <section className="py-24 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left: Incident Feed */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-slate-900">Live Incident Feed</h2>
            <div className="flex p-1 bg-slate-100 rounded-xl">
              {['Active', 'All'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              show: { transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-4"
          >
            {filteredIncidents.map((incident) => {
              const conf = severityConfig[incident.severity] || severityConfig['P3'];
              return (
                <motion.div 
                  key={incident.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${conf.badge} flex items-center gap-1.5`}>
                        {incident.isActive && conf.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                        {incident.severity} - {incident.status}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-400">{incident.id}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{incident.updatedAt}</span>
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 mb-4">{incident.title}</h3>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[13px] font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{incident.service}</span>
                    <Link to={`/incident/${incident.id}`} className="text-indigo-600 text-sm font-black flex items-center gap-1 hover:gap-2 transition-all">
                      VIEW REPORT <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right: AI Insights + Metrics */}
        <div className="space-y-8">
          <AIInsightsCard />
          
          <div ref={statsRef} className="bg-slate-900 rounded-3xl p-8 text-white">
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-lg mb-8 text-slate-400 uppercase tracking-widest text-center">System Performance</h4>
            <div className="space-y-10">
              <div className="text-center">
                <div className="text-4xl font-black mb-1 font-['Plus_Jakarta_Sans'] tracking-tighter">
                  {useCountUp(2847, 2000, isStatsInView).toLocaleString()}
                </div>
                <div className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">Incidents Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black mb-1 font-['Plus_Jakarta_Sans'] tracking-tighter">
                  {useCountUp(99, 2000, isStatsInView)}.<span className="text-2xl">{useCountUp(98, 2000, isStatsInView)}%</span>
                </div>
                <div className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">Uptime (30d)</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black mb-1 font-['Plus_Jakarta_Sans'] tracking-tighter">
                  {useCountUp(4, 2000, isStatsInView)}.<span className="text-2xl">{useCountUp(2, 2000, isStatsInView)}m</span>
                </div>
                <div className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">Avg Resolution</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <h2 className="font-['Plus_Jakarta_Sans'] font-black text-4xl md:text-6xl text-slate-900 mb-6 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-lg text-slate-500 font-medium mb-16 max-w-2xl mx-auto">Scalable infrastructure management for teams of all sizes.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {plans.map((plan, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, translateY: -10 }}
                className={`bg-white rounded-3xl p-10 border transition-all duration-300 ${plan.featured ? 'ring-4 ring-indigo-600/10 border-indigo-600 shadow-2xl scale-105 relative z-20' : 'border-slate-200 shadow-lg'}`}
              >
                {plan.featured && <div className="absolute -top-4 left-10 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-indigo-600/20">Recommended</div>}
                <h3 className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-slate-900 mb-2">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                  {plan.period && <span className="text-slate-400 font-bold ml-1">{plan.period}</span>}
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-[14px] font-semibold text-slate-600">
                      <div className="mt-1 w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${plan.featured ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Dark Footer */}
      <footer className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-['Plus_Jakarta_Sans'] font-bold text-sm">I</div>
              <span className="font-['Plus_Jakarta_Sans'] font-black text-white text-xl tracking-tight">IntelOps</span>
            </div>
            <p className="text-slate-400 font-medium max-w-sm mb-6 mx-auto md:mx-0">
              Transforming messy incident data into real-time clarity for high-performing engineering teams.
            </p>
            <p className="text-[12px] font-bold text-slate-600 uppercase tracking-widest">© 2026 IntelOps Inc.</p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Product</h4>
            <ul className="space-y-3 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Infrastructure</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Connect</h4>
            <ul className="space-y-3 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
            </ul>
          </div>
        </div>
      </footer>

    </div>
  );
}
