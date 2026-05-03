import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Send, RefreshCw, ChevronDown, Info } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../project/projectSlice';
import API from '../../../services/api';

const SEVERITY = [
  { value: 'high',   label: 'P1 — Critical',  desc: 'Complete outage / data loss', border:'border-[#ef4444]/40', bg:'bg-[#ef4444]/10', text:'text-[#ef4444]', ring:'ring-[#ef4444]/20' },
  { value: 'medium', label: 'P2 — High',       desc: 'Major feature degraded',      border:'border-[#f59e0b]/40', bg:'bg-[#f59e0b]/10', text:'text-[#f59e0b]', ring:'ring-[#f59e0b]/20' },
  { value: 'low',    label: 'P3 — Low',        desc: 'Minor issue / cosmetic bug',  border:'border-[#6366f1]/40', bg:'bg-[#6366f1]/10', text:'text-[#6366f1]', ring:'ring-[#6366f1]/20' },
];

function Corners({ opacity = "opacity-60", color = "border-[#D4AF37]" }) {
  return (
    <>
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-l-2 ${color} top-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-r-2 ${color} top-1 right-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-l-2 ${color} bottom-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-r-2 ${color} bottom-1 right-1 pointer-events-none ${opacity}`} />
    </>
  );
}

const BuggerReport = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { projects } = useSelector(s => s.projects);

  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', projectId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())          { setError('Title is required (min 5 chars).'); return; }
    if (form.title.trim().length < 5){ setError('Title must be at least 5 characters.'); return; }
    if (!form.projectId)             { setError('Select a project.'); return; }
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
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentSev = SEVERITY.find(s => s.value === form.severity);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8 font-['Josefin_Sans']">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-6 bg-[#D4AF37]/40" />
          <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">Report Incident</h2>
        </div>
        <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">Submit a system issue for immediate triage</p>
      </div>

      {/* Severity picker */}
      <div className="grid grid-cols-3 gap-3">
        {SEVERITY.map(s => (
          <button key={s.value} type="button" onClick={() => set('severity', s.value)}
            className={`relative p-4 text-left transition-all cursor-pointer border ${form.severity === s.value ? `${s.border} ${s.bg} ${s.text}` : 'border-[#D4AF37]/15 bg-[#141414] text-[#666] hover:border-[#D4AF37]/30 hover:text-[#D4AF37]'}`}>
            {form.severity === s.value && <Corners opacity="opacity-100" color={`border-current`} />}
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{s.label}</p>
            <p className="text-[8px] opacity-60">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative bg-[#141414] border border-[#D4AF37]/25 p-8 space-y-6">
        <Corners opacity="opacity-60" />

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-[11px] font-bold">
            <Info size={14} /> {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-2">Incident Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Payment gateway returning 502 errors"
            className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[13px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors font-['Josefin_Sans'] placeholder-[#444]" />
        </div>

        {/* Project */}
        <div>
          <label className="block text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-2">Affected Project *</label>
          <div className="relative">
            <select value={form.projectId} onChange={e => set('projectId', e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#D4AF37]/30 px-4 py-3 text-[12px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors appearance-none font-['Josefin_Sans']">
              <option value="">Select a project…</option>
              {projects.map(p => (
                <option key={p._id} value={p._id} disabled={!p.group}>
                  {p.name} {!p.group ? '(No Squad Assigned)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-2">Description</label>
          <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Describe what happened, what you expected, and any steps to reproduce…"
            className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[13px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors resize-none font-['Josefin_Sans'] placeholder-[#444]" />
        </div>

        {/* Selected severity summary */}
        {currentSev && (
          <div className={`flex items-center gap-3 p-4 border ${currentSev.border} ${currentSev.bg} ${currentSev.text}`}>
            <AlertTriangle size={14} />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Severity: {currentSev.label}</p>
              <p className="text-[8px] opacity-60 mt-0.5">{currentSev.desc}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => navigate('/bugger')}
            className="flex-1 py-3 bg-transparent border border-[#D4AF37]/30 text-[#888] hover:text-[#D4AF37] hover:border-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#F2E8C4] text-[#0A0A0A] border-none text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BuggerReport;
