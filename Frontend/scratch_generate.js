const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Cpu, Zap, Check } from 'lucide-react';
import { incidents, plans, severityConfig } from './dashboardData';

const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

const AnimatedStat = ({ end, suffix = "", label }) => {
  const value = useCountUp(end, 1500);
  return (
    <div className="flex flex-col items-center">
      <div className="font-['Plus_Jakarta_Sans'] font-black text-4xl text-slate-900 mb-1">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
};

export default function PublicStatusDashboard() {
  const [activeTab, setActiveTab] = useState('Active');

  const filteredIncidents = activeTab === 'Active' 
    ? incidents.filter(i => i.isActive)
    : incidents;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[#F8FAFC] font-['Inter'] selection:bg-sky-200 selection:text-sky-900 overflow-x-hidden relative"
    >
      {/* Top Banner */}
      <motion.div variants={itemVariants} className="w-full bg-slate-900 text-white py-2.5 px-4 text-center text-[13px] font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm relative z-50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
        </span>
        Systems are currently operating normally.
      </motion.div>

      {/* Navbar */}
      <motion.nav variants={itemVariants} className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-[64px] px-6 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center text-white font-['Plus_Jakarta_Sans'] font-bold text-sm shadow-md">
            C
          </div>
          <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 tracking-tight text-lg">IntelOps</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#pricing" className="text-slate-500 hover:text-slate-900 text-sm font-semibold transition-colors">Pricing</a>
          <Link to="/login" className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-bold transition-all">
            Team Login <ArrowRight size={16} />
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative w-full pt-[100px] pb-[80px]">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
        
        {/* Soft blue radial glow top right */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none" style={{ background: 'radial-gradient(600px circle at 80% 20%, rgba(14,165,233,0.08), transparent)' }}></div>

        <main className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 variants={itemVariants} className="font-['Plus_Jakarta_Sans'] font-black text-5xl md:text-6xl lg:text-7xl text-slate-900 tracking-tighter mb-6 max-w-4xl mx-auto leading-[1.1]">
            From Chaos to Clarity in <br className="hidden md:block"/>
            <span className="relative inline-block text-slate-900">
              Incident Response
              <span className="absolute -bottom-1 left-0 h-[4px] bg-sky-500 rounded-full animate-underline"></span>
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-16">
            IntelOps transforms messy incident data into clear timelines, AI insights, and fast resolutions for modern SaaS teams.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-24 mb-16">
            <AnimatedStat end={2847} label="Incidents Resolved" />
            <AnimatedStat end={99} suffix=".98%" label="Uptime Guaranteed" />
            <AnimatedStat end={4} suffix=".2m" label="Avg Resolution" />
          </motion.div>
        </main>
      </div>

      {/* Bento Grid Features Section */}
      <main className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {/* Large Left Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 bg-[#0F172A] rounded-3xl p-10 flex flex-col justify-end min-h-[320px] shadow-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm border border-white/10">
              <Activity size={28} strokeWidth={2} />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-2xl text-white mb-3">Real-time Visibility Engine</h3>
            <p className="text-slate-400 font-medium text-lg max-w-lg">
              See the exact state of your microservices instantly. Our streaming architecture prevents communication gaps with customers before they happen.
            </p>
          </motion.div>

          {/* Right Stacked Cards */}
          <div className="flex flex-col gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200/80 rounded-3xl p-8 flex-1 shadow-sm flex flex-col justify-center"
            >
              <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500 mb-5 border border-sky-100/50">
                <Cpu size={24} strokeWidth={2} />
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 mb-2">AI Root-Cause</h3>
              <p className="text-slate-500 font-medium text-sm">LLM pipeline generates summaries instantly.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200/80 rounded-3xl p-8 flex-1 shadow-sm flex flex-col justify-center"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-5 border border-emerald-100/50">
                <Zap size={24} strokeWidth={2} />
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 mb-2">Auto-Remediation</h3>
              <p className="text-slate-500 font-medium text-sm">Trigger webhooks to isolate faulty nodes.</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Incident Feed */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-slate-900">Live Incident Feed</h2>
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-200/60">
              <button 
                onClick={() => setActiveTab('Active')}
                className={\`px-5 py-1.5 text-[13px] font-bold rounded-lg transition-all duration-200 \${activeTab === 'Active' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}\`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('All')}
                className={\`px-5 py-1.5 text-[13px] font-bold rounded-lg transition-all duration-200 \${activeTab === 'All' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}\`}
              >
                All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredIncidents.map((incident, index) => {
              const bgTint = incident.severity === 'P1' ? 'bg-red-50/50' : incident.severity === 'P2' ? 'bg-amber-50/50' : 'bg-white';
              const conf = severityConfig[incident.severity] || severityConfig['P3'];

              return (
                <motion.div 
                  key={incident.id}
                  className={\`\${bgTint} border border-slate-200/80 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group\`}
                  variants={itemVariants}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={\`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border \${conf.badge} flex items-center gap-1.5\`}>
                        {incident.isActive && conf.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                        {incident.severity} - {incident.status}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-400">{incident.id}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{incident.updatedAt}</span>
                  </div>
                  
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-slate-900 mb-4 group-hover:text-sky-600 transition-colors">
                    {incident.title}
                  </h3>
                  
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-sm">{incident.service}</span>
                    </div>
                    <button className="bg-sky-50 text-sky-600 hover:bg-sky-100 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5">
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </main>

      {/* Dark Pricing Section */}
      <motion.section variants={itemVariants} id="pricing" className="bg-[#0F172A] py-[100px] relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="font-['Plus_Jakarta_Sans'] font-black text-4xl md:text-5xl text-white mb-4 tracking-tighter">
            Pricing that scales with you
          </h2>
          <p className="text-lg text-slate-400 font-medium mb-16">Simple, transparent pricing to bring clarity to your chaos.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto text-left">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                whileHover={{ scale: 1.02 }}
                className={\`relative rounded-3xl p-8 transition-all duration-300 \${
                  plan.featured 
                    ? 'bg-white text-slate-900 ring-4 ring-sky-400 shadow-2xl scale-[1.02] md:scale-105 z-10' 
                    : 'bg-[#1E293B] text-white border border-slate-700 shadow-lg z-0'
                }\`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-sky-400 text-slate-900 text-[12px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Most popular
                  </div>
                )}
                
                <h3 className="font-['Plus_Jakarta_Sans'] font-black text-xl mb-4">
                  {plan.name}
                </h3>
                
                <div className="mb-8">
                  <span className="text-5xl font-black tracking-tighter">
                    {plan.price}
                  </span>
                  {plan.period && <span className={\`font-bold ml-1 \${plan.featured ? 'text-slate-400' : 'text-slate-500'}\`}>{plan.period}</span>}
                </div>
                
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={\`flex items-start gap-3 text-[14px] font-semibold \${plan.featured ? 'text-slate-600' : 'text-slate-300'}\`}>
                      <div className={\`mt-0.5 rounded-full p-0.5 \${plan.featured ? 'bg-sky-100 text-sky-500' : 'bg-slate-700 text-slate-300'}\`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={\`w-full py-3.5 rounded-xl font-bold text-[14px] transition-all duration-300 flex justify-center \${
                  plan.featured 
                    ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/25' 
                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                }\`}>
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Dark Footer */}
      <motion.footer variants={itemVariants} className="bg-[#0F172A] border-t border-[#1E293B] py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Col */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center text-white font-['Plus_Jakarta_Sans'] font-bold text-sm">
                C
              </div>
              <span className="font-['Plus_Jakarta_Sans'] font-bold text-white tracking-tight text-xl">IntelOps</span>
            </div>
            <p className="text-sm font-medium text-[#94A3B8] mb-6 max-w-xs">
              The smart incident response platform for modern engineering teams.
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-auto">
              © 2026 IntelOps. All rights reserved.
            </p>
          </div>

          {/* Middle Col */}
          <div className="flex flex-col gap-3">
            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-white mb-2">Company</h4>
            {['Product', 'Status', 'Pricing', 'Blog'].map(link => (
              <a key={link} href="#" className="text-sm font-medium text-[#94A3B8] hover:text-[#E2E8F0] transition-colors w-fit">
                {link}
              </a>
            ))}
          </div>

          {/* Right Col */}
          <div className="flex flex-col items-start md:items-end justify-center">
            <button className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm mb-3">
              Start for free
            </button>
            <span className="text-xs font-medium text-slate-500">No credit card required</span>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}
`;

fs.writeFileSync('src/pages/PublicStatusDashboard.jsx', code);
console.log('Successfully generated PublicStatusDashboard.jsx');
