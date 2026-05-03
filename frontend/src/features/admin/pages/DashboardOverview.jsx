import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '../../incidents/incidentSlice';

const DashboardOverview = () => {
  const dispatch = useDispatch();
  const { incidents } = useSelector((state) => state.incidents);

  React.useEffect(() => {
    dispatch(fetchIncidents());
  }, [dispatch]);
  
  const stats = [
    { label: 'Total Incidents', value: incidents.length, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Active Incidents', value: incidents.filter(i => i.status !== 'resolved').length, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Resolved Today', value: incidents.filter(i => i.status === 'resolved').length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Avg Resolution Time', value: '1.2h', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
            <Activity className="text-indigo-500" size={20} />
            System Performance
          </h3>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">API Gateway Cluster</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Traffic Routing</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-500">99.9%</span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uptime</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
            <Clock className="text-indigo-500" size={20} />
            Recent Alerts
          </h3>
          <div className="space-y-4">
            {incidents.slice(0, 5).map(inc => (
              <div key={inc._id} className="flex items-start gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group">
                <div className={`mt-1 w-2 h-2 rounded-full ${inc.severity === 'P1' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-amber-500'} shrink-0`} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{inc.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{inc.severity}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">•</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(inc.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
