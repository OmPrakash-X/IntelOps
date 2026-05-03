import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Send, RefreshCw, ChevronDown, FileText, Info } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../project/projectSlice';
import API from '../../../services/api';

const SEVERITY = [
  { value: 'high',   label: 'P1 — Critical',  desc: 'Complete outage / data loss', color: 'text-red-400 border-red-500/30 bg-red-500/5' },
  { value: 'medium', label: 'P2 — High',       desc: 'Major feature degraded',      color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
  { value: 'low',    label: 'P3 — Low',        desc: 'Minor issue / cosmetic bug',  color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
];

const BuggerReport = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { projects } = useSelector(s => s.projects);

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium',
    projectId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())         { setError('Title is required (min 5 chars).');    return; }
    if (form.title.trim().length < 5){ setError('Title must be at least 5 characters.'); return; }
    if (!form.projectId)             { setError('Select a project.');                    return; }
    if (form.description && form.description.trim().length > 0 && form.description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    setError('');
    try {
      setSubmitting(true);
      await API.post('/incidents', form);
      navigate('/bugger');
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg || 
        err.response?.data?.message || 
        'Failed to submit report.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight">Report an Incident</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          Submit a new bug or system issue for triage
        </p>
      </div>

      {/* Severity picker */}
      <div className="grid grid-cols-3 gap-3">
        {SEVERITY.map(s => (
          <button key={s.value} type="button" onClick={() => set('severity', s.value)}
            className={`p-4 rounded-2xl border text-left transition-all ${form.severity === s.value ? s.color + ' ring-1 ring-current/20' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}>
            <p className="text-xs font-black uppercase tracking-widest">{s.label}</p>
            <p className="text-[9px] font-bold mt-1 opacity-60">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
            <Info size={14} /> {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Incident Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Payment gateway returning 502 errors"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
          />
        </div>

        {/* Project */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Affected Project *
          </label>
          <div className="relative">
            <select
              value={form.projectId}
              onChange={e => set('projectId', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none transition-all appearance-none pr-10">
          <option value="">Select a project…</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Description
          </label>
          <textarea
            rows={5}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe what happened, what you expected, and any steps to reproduce…"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-700"
          />
        </div>

        {/* Selected severity display */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${SEVERITY.find(s => s.value === form.severity)?.color}`}>
          <AlertTriangle size={14} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest">
              Severity: {SEVERITY.find(s => s.value === form.severity)?.label}
            </p>
            <p className="text-[9px] opacity-60 font-bold mt-0.5">
              {SEVERITY.find(s => s.value === form.severity)?.desc}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => navigate('/bugger')}
            className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BuggerReport;
