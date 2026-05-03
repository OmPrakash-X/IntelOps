import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { Link } from 'react-router-dom';

const AutomationManagement = () => {
  const dispatch = useDispatch();
  const { incidents, loading } = useSelector(s => s.incidents);

  useEffect(() => { dispatch(fetchIncidents()); }, [dispatch]);

  // Incidents that have AI suggestions
  const aiIncidents = incidents.filter(i => i.aiSuggestions?.nextAction);
  // Resolved with postmortem
  const withPostmortem = incidents.filter(i => i.postmortem?.summary);

  const stats = [
    { label: 'AI Analyses Run',      value: aiIncidents.length,      color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Postmortems Filed',     value: withPostmortem.length,   color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Avg AI Next Action',    value: aiIncidents.length ? '< 2s' : '—', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Pending Analysis',      value: incidents.filter(i => !i.aiSuggestions?.nextAction && i.status !== 'resolved').length, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">AI Intelligence Engine</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Root cause analysis & next-action recommendations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <Sparkles size={18} className={s.color} />
            </div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className={`text-2xl font-black ${s.color}`}>{loading ? '…' : s.value}</h3>
          </div>
        ))}
      </div>

      {/* AI Analysis Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-800 flex items-center gap-3">
          <Sparkles size={16} className="text-indigo-400" />
          <h3 className="text-sm font-black uppercase tracking-widest">AI Analysis Log</h3>
        </div>
        <div className="divide-y divide-slate-800/50">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="px-8 py-5 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-1/3 opacity-50" />
              </div>
            ))
          ) : aiIncidents.length === 0 ? (
            <div className="p-16 text-center">
              <Sparkles size={40} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold text-sm">No AI analyses yet.</p>
              <p className="text-slate-600 text-xs mt-1">Open an incident and click "Run AI" to generate insights.</p>
            </div>
          ) : (
            aiIncidents.map(inc => (
              <div key={inc._id} className="px-8 py-5 hover:bg-white/5 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${inc.severity === 'high' ? 'text-red-400 border-red-500/20 bg-red-500/5' : inc.severity === 'medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' : 'text-blue-400 border-blue-500/20 bg-blue-500/5'}`}>
                        {inc.severity === 'high' ? 'P1' : inc.severity === 'medium' ? 'P2' : 'P3'}
                      </span>
                      {inc.status === 'resolved' && <CheckCircle size={12} className="text-emerald-400" />}
                    </div>
                    <h4 className="text-sm font-bold group-hover:text-indigo-400 transition-colors truncate">{inc.title}</h4>
                    <div className="mt-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                      <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest mb-1">Next Action</p>
                      <p className="text-xs text-indigo-200/80 font-medium leading-snug">{inc.aiSuggestions.nextAction}</p>
                    </div>
                    {inc.aiSuggestions.timelineSummary && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Timeline Summary</p>
                        <p className="text-xs text-slate-400 font-medium leading-snug whitespace-pre-line">{inc.aiSuggestions.timelineSummary}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <Clock size={10} className="text-slate-600" />
                      <span className="text-[9px] font-bold text-slate-600">{new Date(inc.aiSuggestions.generatedAt || inc.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <Link to={`/incident/${inc._id}`}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0 mt-1">
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AutomationManagement;
