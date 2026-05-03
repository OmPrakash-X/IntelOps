import React from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Shield, Globe, Cpu, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const InfrastructureManagement = () => {
  const services = [
    { name: 'API Gateway Cluster', status: 'Operational', uptime: '99.99%', latency: '42ms', load: '12%', icon: Globe, color: 'emerald' },
    { name: 'Auth Service (IAM)', status: 'Operational', uptime: '99.95%', latency: '120ms', load: '45%', icon: Shield, color: 'emerald' },
    { name: 'Production Database', status: 'Degraded', uptime: '98.40%', latency: '450ms', load: '89%', icon: Database, color: 'amber' },
    { name: 'Worker Nodes (K8s)', status: 'Operational', uptime: '99.90%', latency: '15ms', load: '34%', icon: Cpu, color: 'emerald' },
    { name: 'Edge CDN', status: 'Operational', uptime: '100%', latency: '8ms', load: '5%', icon: Zap, color: 'emerald' },
    { name: 'Storage Cluster', status: 'Operational', uptime: '99.99%', latency: '25ms', load: '21%', icon: Server, color: 'emerald' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Infrastructure</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time system health monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Status: Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, idx) => (
          <div key={idx} className="p-8 rounded-[32px] bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${service.color}-500/5 blur-[60px] group-hover:bg-indigo-500/10 transition-colors`} />
            
            <div className="flex items-center justify-between mb-8 relative">
              <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-${service.color}-500 group-hover:text-indigo-400 transition-colors`}>
                <service.icon size={28} />
              </div>
              <div className="text-right">
                <div className={`flex items-center justify-end gap-1.5 ${service.color === 'emerald' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {service.color === 'emerald' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{service.status}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status</p>
              </div>
            </div>

            <h3 className="text-lg font-black mb-6 relative">{service.name}</h3>

            <div className="grid grid-cols-3 gap-4 relative">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Uptime</p>
                <p className="text-xs font-black text-white">{service.uptime}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Latency</p>
                <p className="text-xs font-black text-white">{service.latency}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Load</p>
                <p className="text-xs font-black text-white">{service.load}</p>
              </div>
            </div>

            <div className="mt-8 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: service.load }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full ${service.color === 'emerald' ? 'bg-indigo-500' : 'bg-amber-500'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default InfrastructureManagement;
