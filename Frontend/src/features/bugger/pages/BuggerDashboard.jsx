import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  Plus, Activity, Clock, CheckCircle, AlertCircle,
  Shield, ArrowRight, RefreshCw, X, Zap
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '@/features/incidents/incidentSlice';
import { fetchProjects } from '@/features/project/projectSlice';
import { createIncident } from '@/features/incidents/services/incidents.api';

const SEV_CONFIG = {
  high:   { label: 'P1 – Critical', badge: 'bg-red-500/10 text-red-400 border-red-500/20',    dot: 'bg-red-500' },
  medium: { label: 'P2 – High',     badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  low:    { label: 'P3 – Low',      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',  dot: 'bg-blue-400' },
};

const STATUS_CONFIG = {
  open:       { label: 'Open',       color: 'text-red-400',    bg: 'bg-red-500/10' },
  inProgress: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  resolved:   { label: 'Resolved',   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export default function BuggerDashboard() {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { user }   = useSelector((s) => s.auth);
  const { incidents, loading } = useSelector((s) => s.incidents);
  const { projects }           = useSelector((s) => s.projects);

  // Only show incidents created by this user
  const myIncidents = incidents.filter(
    (i) => i.createdBy?._id === user?._id || i.createdBy === user?._id
  );

  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [formData,      setFormData]      = useState({
    title: '', description: '', severity: 'medium', projectId: '',
  });

  useEffect(() => {
    dispatch(fetchIncidents());
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.projectId) return;
    try {
      setSubmitting(true);
      await createIncident({
        title:       formData.title,
        description: formData.description,
        severity:    formData.severity,
        projectId:   formData.projectId,
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', severity: 'medium', projectId: '' });
      dispatch(fetchIncidents());
    } catch (err) {
      alert('Failed to report incident: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total:    myIncidents.length,
    open:     myIncidents.filter((i) => i.status === 'open').length,
    active:   myIncidents.filter((i) => i.status === 'inProgress').length,
    resolved: myIncidents.filter((i) => i.status === 'resolved').length,
  };

  return (
    <div className="space-y-8">
        {/* Hero + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Incident Reports</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Report and track all issues you've raised.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} /> Report Incident
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',      value: stats.total,    icon: Activity,     color: 'text-white' },
            { label: 'Open',       value: stats.open,     icon: AlertCircle,  color: 'text-red-400' },
            { label: 'In Progress',value: stats.active,   icon: Clock,        color: 'text-amber-400' },
            { label: 'Resolved',   value: stats.resolved, icon: CheckCircle,  color: 'text-emerald-400' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800"
            >
              <s.icon size={18} className={`${s.color} mb-3`} />
              <div className="text-2xl font-bold mb-0.5">{s.value}</div>
              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Incident list */}
        <section className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <RefreshCw size={24} className="text-indigo-500 animate-spin" />
            </div>
          )}

          {!loading && myIncidents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 opacity-40">
              <Shield size={40} className="mb-4 text-slate-500" />
              <h3 className="font-bold mb-1">No incidents reported yet</h3>
              <p className="text-xs text-slate-600 uppercase tracking-widest">Click "Report Incident" to start</p>
            </div>
          )}

          {myIncidents.map((incident, i) => {
            const sev = SEV_CONFIG[incident.severity] || SEV_CONFIG.low;
            const st  = STATUS_CONFIG[incident.status] || STATUS_CONFIG.open;
            return (
              <motion.div
                key={incident._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest ${sev.badge}`}>
                        {sev.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${st.bg} ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-[9px] font-mono text-slate-600">#{incident._id?.slice(-6)}</span>
                    </div>
                    <h3 className="text-sm font-bold mb-1 truncate">{incident.title}</h3>
                    {incident.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2">{incident.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-[9px] font-semibold text-slate-600 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Shield size={11} />
                        {incident.project?.name || 'Unknown project'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} />
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/incidents/${incident._id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-semibold uppercase tracking-widest transition-all shrink-0"
                  >
                    View <ArrowRight size={13} />
                  </button>
                </div>

                {/* AI insights strip (shown when available) */}
                {incident.aiSuggestions?.nextAction && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="text-[9px] font-semibold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Zap size={11} /> AI Next Action
                    </div>
                    <p className="text-xs text-indigo-100/80 font-medium leading-snug">
                      {incident.aiSuggestions.nextAction}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </section>

      {/* Report Incident Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Report Incident</h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
                    Raise a new issue for your team
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Title *
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief summary of the issue..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Steps to reproduce, impact, what you observed..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Severity *
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="low">P3 – Low</option>
                      <option value="medium">P2 – Medium</option>
                      <option value="high">P1 – Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Project *
                    </label>
                    <select
                      required
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="">Select project...</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}