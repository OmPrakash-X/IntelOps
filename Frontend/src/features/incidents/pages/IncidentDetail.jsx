import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Activity, AlertTriangle, Terminal,
  CheckCircle, Users, Sparkles, ShieldCheck, Plus, FileText,
  Shield, Send, RefreshCw, Zap, X, ChevronDown, Bell, Download
} from 'lucide-react';
import { useSelector } from 'react-redux';
import API from '../../../services/api';
import { getSocket } from '../../../lib/socket';

// ── helpers ──────────────────────────────────────────────────────────────────
function elapsed(start, end) {
  const diff = Math.abs((end ? new Date(end) : new Date()) - new Date(start));
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const SEV_MAP = { high: 'P1', medium: 'P2', low: 'P3' };
const SEV_CONF = {
  P1: { badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  P2: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  P3: { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

// ── component ─────────────────────────────────────────────────────────────────
export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const role = user?.role?.toLowerCase();

  const [incident, setIncident]   = useState(null);
  const [timeline, setTimeline]   = useState([]);
  const [loading,  setLoading]    = useState(true);

  // modals / forms
  const [logOpen,  setLogOpen]    = useState(false);
  const [pmOpen,   setPmOpen]     = useState(false);
  const [newLog,   setNewLog]     = useState({ message: '', type: 'update' });
  const [pmForm,   setPmForm]     = useState({ summary: '', rootCause: '', impact: '', resolution: '' });

  // loading states
  const [aiLoading,  setAiLoading]  = useState(false);
  const [logSaving,  setLogSaving]  = useState(false);
  const [pmSaving,   setPmSaving]   = useState(false);
  const [resolving,  setResolving]  = useState(false);

  // toast notifications
  const [toasts, setToasts] = useState([]);
  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  // ── data fetch ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [incRes, tlRes] = await Promise.all([
        API.get(`/incidents/${id}`),
        API.get(`/incidents/${id}/timeline`),
      ]);
      const inc = incRes.data?.data || incRes.data;
      setIncident(inc);
      setTimeline(tlRes.data?.data || tlRes.data || []);
      // pre-fill postmortem form if it exists
      if (inc?.postmortem) {
        setPmForm({
          summary:    inc.postmortem.summary    || '',
          rootCause:  inc.postmortem.rootCause  || '',
          impact:     inc.postmortem.impact     || '',
          resolution: inc.postmortem.resolution || '',
        });
      }
    } catch (err) {
      console.error('Failed to load incident:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── socket ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join:incident', id);

    const refresh = () => fetchAll();
    const onAI = () => { fetchAll(); toast('✨ AI analysis complete — insights updated', 'success'); };
    const onPostmortem = () => { fetchAll(); toast('📋 AI postmortem generated successfully', 'success'); };
    const onResolved = () => { fetchAll(); toast('✅ Incident marked as resolved', 'success'); };
    socket.on('ai_generated',       onAI);
    socket.on('incident_resolved',  onResolved);
    socket.on('postmortem_updated', refresh);
    socket.on('ai:rootCause',   onAI);
    socket.on('ai:nextAction',  onAI);
    socket.on('ai:postmortem',  onPostmortem);

    return () => {
      socket.emit('leave:incident', id);
      socket.off('ai_generated');
      socket.off('incident_resolved');
      socket.off('postmortem_updated');
      socket.off('ai:rootCause');
      socket.off('ai:nextAction');
      socket.off('ai:postmortem', refresh);
    };
  }, [id, fetchAll]);

  // ── permissions ─────────────────────────────────────────────────────────────
  const isAdmin    = role === 'admin';
  const isLead     = role === 'teamlead';
  const isResponder = role === 'teammember';
  const isAssigned = isLead && (
    incident?.assignedLead?._id === (user?._id || user?.id) ||
    incident?.assignedLead === (user?._id || user?.id)
  );
  const canRunAI      = isAdmin || (isLead && isAssigned);
  const canResolve    = (isAdmin || (isLead && isAssigned)) && incident?.status !== 'resolved';
  const canLog        = (isAdmin || (isLead && isAssigned)) && incident?.status !== 'resolved';
  const canPostmortem = (isAdmin || (isLead && isAssigned)) && incident?.status === 'resolved';

  // ── actions ──────────────────────────────────────────────────────────────────
  const handleRunAI = async () => {
    try {
      setAiLoading(true);
      toast('🤖 AI analysis triggered — analyzing timeline…', 'info');
      await API.post(`/incidents/${id}/ai/analyze`);
      await fetchAll();
    } catch (err) {
      toast('AI analysis failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGeneratePostmortem = async () => {
    try {
      setAiLoading(true);
      toast('🤖 Generating AI postmortem — this may take a moment…', 'info');
      await API.post(`/incidents/${id}/ai/postmortem`);
      await fetchAll();
    } catch (err) {
      toast('Postmortem generation failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!window.confirm('Mark this incident as resolved?')) return;
    try {
      setResolving(true);
      await API.patch(`/incidents/${id}/status`, { status: 'resolved' });
      toast('✅ Incident resolved successfully', 'success');
      await fetchAll();
    } catch (err) {
      toast('Resolve failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setResolving(false);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLog.message.trim()) return;
    try {
      setLogSaving(true);
      await API.post(`/incidents/${id}/timeline`, newLog);
      setNewLog({ message: '', type: 'update' });
      setLogOpen(false);
      toast('📝 Timeline log added', 'success');
      fetchAll();
    } catch (err) {
      toast('Failed: ' + err.message, 'error');
    } finally {
      setLogSaving(false);
    }
  };

  const handlePostmortem = async (e) => {
    e.preventDefault();
    try {
      setPmSaving(true);
      await API.patch(`/incidents/${id}/postmortem`, pmForm);
      setPmOpen(false);
      toast('📋 Postmortem saved successfully', 'success');
      fetchAll();
    } catch (err) {
      toast('Failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setPmSaving(false);
    }
  };

  const handleDownloadReport = () => {
    const title = incident.title || 'Incident';
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Postmortem: ${title}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;color:#111;line-height:1.6;padding:0 20px}
  h1{font-size:1.6rem;font-weight:900;border-bottom:3px solid #10b981;padding-bottom:12px;margin-bottom:8px}
  .meta{color:#6b7280;font-size:.8rem;margin-bottom:28px}
  h2{font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;margin:24px 0 8px;color:#6b7280}
  p,li{font-size:.9rem;color:#374151}
  ul,ol{padding-left:20px;margin:0}li{margin:4px 0}
  .section{margin-bottom:20px;padding:16px;border:1px solid #e5e7eb;border-radius:8px}
  .timeline{display:flex;gap:12px;align-items:flex-start;margin:4px 0}
  .tag{font-family:monospace;font-size:.7rem;background:#ecfdf5;color:#059669;padding:2px 8px;border-radius:4px;border:1px solid #6ee7b7;white-space:nowrap}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media print{body{margin:20px}}
</style></head>
<body>
<h1>📋 Incident Postmortem: ${title}</h1>
<p class="meta">Severity: ${incident.severity?.toUpperCase()} &nbsp;|&nbsp; ID: #${incident._id?.slice(-8)} &nbsp;|&nbsp; Generated: ${pm.generatedAt ? new Date(pm.generatedAt).toLocaleString() : 'N/A'}</p>
${pm.summary ? `<div class="section"><h2>Executive Summary</h2><p>${pm.summary}</p></div>` : ''}
${pm.rootCause ? `<div class="section"><h2>🔍 Root Cause</h2><p>${pm.rootCause}</p></div>` : ''}
${pm.impact ? `<div class="section"><h2>⚡ Impact</h2><p>${pm.impact}</p></div>` : ''}
${pm.resolution ? `<div class="section"><h2>✅ Resolution</h2><p>${pm.resolution}</p></div>` : ''}
${(pm.aiTimeline || []).length > 0 ? `<div class="section"><h2>🕐 Key Milestones</h2>${(pm.aiTimeline || []).map(t => `<div class="timeline"><span class="tag">${t.time}</span><p style="margin:0">${t.event}</p></div>`).join('')}</div>` : ''}
<div class="grid">
${(pm.lessonsLearned || []).length > 0 ? `<div class="section"><h2>📚 Lessons Learned</h2><ul>${(pm.lessonsLearned || []).map(l => `<li>${l}</li>`).join('')}</ul></div>` : ''}
${(pm.preventionSteps || []).length > 0 ? `<div class="section"><h2>🛡️ Prevention Steps</h2><ol>${(pm.preventionSteps || []).map(s => `<li>${s}</li>`).join('')}</ol></div>` : ''}
</div>
</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-['Inter']">
      <RefreshCw size={28} className="text-indigo-500 animate-spin mb-3" />
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Loading incident…</span>
    </div>
  );

  if (!incident) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-['Inter'] p-10 text-center">
      <AlertTriangle size={48} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Incident Not Found</h1>
      <button onClick={() => navigate(-1)} className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Go Back</button>
    </div>
  );

  const sev  = SEV_MAP[incident.severity] || incident.severity || 'P3';
  const conf = SEV_CONF[sev] || SEV_CONF.P3;
  const pm   = incident.postmortem || {};

  // Parse AI suggestions — stored as JSON strings in the DB
  const parseAI = (v) => { try { return v ? JSON.parse(v) : null; } catch { return null; } };
  const rawAI    = incident.aiSuggestions || {};
  const ai = {
    nextAction:  parseAI(rawAI.nextAction),   // { actions:[{action,priority,rationale}], estimatedResolutionHint }
    rootCause:   parseAI(rawAI.rootCause),    // { probableCauses:[{cause,confidence,reasoning}], summary }
    generatedAt: rawAI.generatedAt,
  };
  const hasAI = !!(ai.nextAction || ai.rootCause);

  return (
    <div className="min-h-screen bg-slate-950 font-['Inter'] text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border ${conf.badge}`}>{sev}</span>
                <span className="text-[10px] font-mono text-slate-600">#{incident._id?.slice(-8)}</span>
                <span className="text-[10px] text-slate-600">·</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={11} /> {new Date(incident.createdAt).toLocaleString()}</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight">{incident.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Run AI — active incidents only */}
            {canRunAI && incident.status !== 'resolved' && (
              <button onClick={handleRunAI} disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-60">
                {aiLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {aiLoading ? 'Analyzing…' : 'Run AI'}
              </button>
            )}
            {/* AI Postmortem — resolved incidents */}
            {canPostmortem && incident.status === 'resolved' && (
              <button onClick={handleGeneratePostmortem} disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-60">
                {aiLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {aiLoading ? 'Generating…' : pm.summary ? 'Regenerate Postmortem' : 'AI Postmortem'}
              </button>
            )}
            {/* Resolve */}
            {canResolve && (
              <button onClick={handleResolve} disabled={resolving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-60">
                {resolving ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                Resolve
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div className={`w-full h-1 ${
        incident.status === 'resolved' ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600' :
        incident.status === 'inProgress' ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600' :
        sev === 'P1' ? 'bg-gradient-to-r from-red-500 via-rose-400 to-red-600' :
        'bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-600'
      }`} />
      <div className={`w-full px-8 py-3 flex items-center gap-4 border-b border-slate-800/50 ${
        incident.status === 'resolved' ? 'bg-emerald-500/5' :
        incident.status === 'inProgress' ? 'bg-amber-500/5' : 'bg-slate-900/50'
      }`}>
        <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            incident.status === 'resolved' ? 'bg-emerald-400' :
            incident.status === 'inProgress' ? 'bg-amber-400 animate-pulse' :
            'bg-red-400 animate-pulse'
          }`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            incident.status === 'resolved' ? 'text-emerald-400' :
            incident.status === 'inProgress' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {incident.status === 'inProgress' ? 'In Progress' : incident.status}
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-xs text-slate-500">Assigned Lead: <strong className="text-slate-300">{incident.assignedLead?.username || 'Unassigned'}</strong></span>
          {aiLoading && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse">
              <RefreshCw size={10} className="animate-spin" /> AI Processing…
            </span>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: 'Status',
              value: incident.status === 'inProgress' ? 'In Progress' : incident.status,
              icon: Activity,
              color: incident.status === 'resolved' ? 'text-emerald-400' : incident.status === 'inProgress' ? 'text-amber-400' : 'text-red-400',
              bg: incident.status === 'resolved' ? 'bg-emerald-500/10 border-emerald-500/20' : incident.status === 'inProgress' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20',
              pulse: incident.status !== 'resolved',
            },
            { label: 'Project',    value: incident.project?.name || '—',            icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
            { label: 'Created by', value: incident.createdBy?.username || 'System',  icon: Users,  color: 'text-slate-300',  bg: 'bg-slate-800 border-slate-700' },
            { label: 'Duration',   value: elapsed(incident.createdAt, incident.resolvedAt), icon: Clock, color: 'text-slate-300', bg: 'bg-slate-800 border-slate-700' },
          ].map((s, i) => (
            <div key={i} className={`flex items-center gap-4 p-5 rounded-2xl border ${s.bg} transition-all hover:scale-[1.02]`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color} bg-black/20 relative shrink-0`}>
                <s.icon size={20} />
                {s.pulse && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-current opacity-80 animate-ping" />}
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{s.label}</p>
                <p className={`text-sm font-black uppercase ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Timeline ── */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black tracking-tight flex items-center gap-2 text-white">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Terminal size={14} className="text-slate-400" />
                </div>
                Investigation Timeline
                <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-black">{timeline.length}</span>
              </h2>
              {canLog && (
                <button onClick={() => setLogOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 text-[10px] font-bold uppercase tracking-widest transition-all">
                  <Plus size={12} /> Add Log
                </button>
              )}
            </div>

            {/* Finalize Postmortem button — resolved + TL */}
            {canPostmortem && (
              <button onClick={() => setPmOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/5 transition-all">
                <FileText size={14} /> {pm.summary ? 'Edit Postmortem' : 'Finalize Postmortem'}
              </button>
            )}

            <div className="relative pl-7 border-l-2 border-slate-800/80 space-y-6 ml-3">
              {timeline.length === 0 && (
                <p className="text-sm text-slate-600 italic">No timeline events yet.</p>
              )}
              {timeline.map((ev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative"
                >
                  <div className={`absolute -left-[38px] top-3 w-4 h-4 rounded-full border-[3px] border-slate-950 shadow-lg ${
                    ev.type === 'status' ? 'bg-emerald-500 shadow-emerald-500/30' :
                    ev.type === 'action' ? 'bg-indigo-500 shadow-indigo-500/30' :
                    'bg-slate-600'
                  }`} />
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        ev.type === 'status' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        ev.type === 'action' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>{ev.type || 'update'}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                      {ev.createdBy?.username && (
                        <span className="ml-auto text-[9px] text-slate-600 font-medium">by {ev.createdBy.username}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{ev.message}</p>
                  </div>
                </motion.div>
              ))}
              {incident.status !== 'resolved' && (
                <div className="relative opacity-30">
                  <div className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-slate-700" />
                  <div className="text-[9px] text-slate-600 uppercase tracking-widest italic ml-2">Awaiting next update…</div>
                </div>
              )}
            </div>

            {/* Postmortem Report */}
            {pm.summary ? (
              <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/80 overflow-hidden">
                {/* Report Header */}
                <div className="px-7 py-5 border-b border-emerald-500/10 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wide">AI Incident Postmortem</h3>
                      {pm.generatedAt && (
                        <p className="text-[9px] text-emerald-400/50 font-mono mt-0.5">
                          Generated {new Date(pm.generatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {incident.resolvedBy && (
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      Resolved by {incident.resolvedBy?.username}
                    </span>
                  )}
                  <button
                    onClick={handleDownloadReport}
                    title="Download as PDF"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[9px] font-bold uppercase tracking-widest transition-all">
                    <Download size={11} /> PDF
                  </button>
                </div>

                {/* Executive Summary */}
                <div className="px-7 py-5 border-b border-emerald-500/10 bg-emerald-500/5">
                  <p className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest mb-2">Executive Summary</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{pm.summary}</p>
                </div>

                {/* Body */}
                <div className="px-7 py-5 space-y-6">
                  {/* Root Cause */}
                  {pm.rootCause && (
                    <div>
                      <p className="text-[9px] font-bold text-red-400/70 uppercase tracking-widest mb-2">🔍 Root Cause</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{pm.rootCause}</p>
                    </div>
                  )}

                  {/* Impact */}
                  {pm.impact && (
                    <div>
                      <p className="text-[9px] font-bold text-amber-400/70 uppercase tracking-widest mb-2">⚡ Impact</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{pm.impact}</p>
                    </div>
                  )}

                  {/* Resolution */}
                  {pm.resolution && (
                    <div>
                      <p className="text-[9px] font-bold text-blue-400/70 uppercase tracking-widest mb-2">✅ Resolution</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{pm.resolution}</p>
                    </div>
                  )}

                  {/* AI Timeline */}
                  {(pm.aiTimeline || []).length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold text-slate-400/70 uppercase tracking-widest mb-3">🕐 Key Milestones</p>
                      <div className="space-y-2 border-l-2 border-slate-700 pl-4">
                        {(pm.aiTimeline || []).map((t, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-[8px] font-mono text-emerald-400/60 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 whitespace-nowrap shrink-0 mt-0.5">{t.time}</span>
                            <p className="text-xs text-slate-400 leading-snug">{t.event}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lessons Learned + Prevention Steps side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {(pm.lessonsLearned || []).length > 0 && (
                      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <p className="text-[9px] font-bold text-purple-400/70 uppercase tracking-widest mb-3">📚 Lessons Learned</p>
                        <ul className="space-y-2">
                          {(pm.lessonsLearned || []).map((l, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 mt-1.5 shrink-0" />
                              <p className="text-xs text-slate-400 leading-snug">{l}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(pm.preventionSteps || []).length > 0 && (
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-[9px] font-bold text-red-400/70 uppercase tracking-widest mb-3">🛡️ Prevention Steps</p>
                        <ol className="space-y-2">
                          {(pm.preventionSteps || []).map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[9px] font-black text-red-400/60 w-4 shrink-0 mt-0.5">{i+1}.</span>
                              <p className="text-xs text-slate-400 leading-snug">{s}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : canPostmortem && incident.status === 'resolved' && (
              <div className="mt-8 p-8 rounded-2xl border border-dashed border-emerald-500/20 text-center">
                <Sparkles size={28} className="mx-auto text-emerald-500/30 mb-3" />
                <p className="text-sm font-bold text-slate-500 mb-1">No postmortem yet</p>
                <p className="text-xs text-slate-600">Click <strong className="text-emerald-400">AI Postmortem</strong> above to generate one automatically</p>
              </div>
            )}

          </div>

          {/* ── AI Sidebar ── */}
          <div className="lg:col-span-4 space-y-5">

            {/* AI Suggestions */}
            <div className="rounded-2xl bg-indigo-600/10 border border-indigo-500/20 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} /> AI Diagnostic
                </h3>
                {ai.generatedAt && (
                  <span className="text-[9px] text-indigo-400/40 font-mono">{new Date(ai.generatedAt).toLocaleTimeString()}</span>
                )}
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <RefreshCw size={22} className="text-indigo-400 animate-spin" />
                  <span className="text-[10px] text-indigo-400/60 uppercase tracking-widest">AI is analyzing…</span>
                </div>
              ) : hasAI ? (
                <div className="space-y-5">
                  {/* Next Actions */}
                  {ai.nextAction?.actions?.length > 0 && (
                    <div>
                      <p className="text-[9px] font-semibold text-indigo-300/40 uppercase tracking-widest mb-2">Next Actions</p>
                      <div className="space-y-2">
                        {ai.nextAction.actions.map((a, i) => (
                          <div key={i} className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                a.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                a.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>{a.priority}</span>
                            </div>
                            <p className="text-xs font-medium text-indigo-100/90 leading-snug">{a.action}</p>
                            {a.rationale && <p className="text-[9px] text-indigo-300/40 mt-1 leading-snug">{a.rationale}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution hint */}
                  {ai.nextAction?.estimatedResolutionHint && (
                    <div>
                      <p className="text-[9px] font-semibold text-indigo-300/40 uppercase tracking-widest mb-1">Resolution Hint</p>
                      <p className="text-xs text-indigo-100/70 leading-snug">{ai.nextAction.estimatedResolutionHint}</p>
                    </div>
                  )}

                  {/* Root Cause Summary */}
                  {ai.rootCause?.summary && (
                    <div>
                      <p className="text-[9px] font-semibold text-indigo-300/40 uppercase tracking-widest mb-1">Root Cause</p>
                      <p className="text-xs text-indigo-100/80 leading-snug">{ai.rootCause.summary}</p>
                    </div>
                  )}

                  {/* Probable Causes */}
                  {ai.rootCause?.probableCauses?.length > 0 && (
                    <div>
                      <p className="text-[9px] font-semibold text-indigo-300/40 uppercase tracking-widest mb-2">Probable Causes</p>
                      <div className="space-y-1.5">
                        {ai.rootCause.probableCauses.map((c, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${
                              c.confidence === 'high' ? 'bg-red-500/20 text-red-400' :
                              c.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>{c.confidence}</span>
                            <p className="text-[10px] text-indigo-100/70 leading-snug">{c.cause}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : incident.status === 'resolved' ? (
                <div className="flex flex-col items-center py-8 text-center gap-3">
                  <CheckCircle size={28} className="text-emerald-500/40" />
                  <p className="text-xs text-emerald-400/50 font-bold uppercase tracking-widest">Incident Resolved</p>
                  {pm.summary ? (
                    <div className="text-left w-full mt-1 space-y-2">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Postmortem Summary</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{pm.summary}</p>
                    </div>
                  ) : canPostmortem ? (
                    <p className="text-xs text-slate-600">Click <strong className="text-emerald-400">AI Postmortem</strong> above to generate a full incident analysis report</p>
                  ) : (
                    <p className="text-xs text-slate-600">Postmortem will be generated automatically</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center gap-3">
                  <Zap size={28} className="text-indigo-500/30" />
                  <p className="text-xs text-indigo-400/40">
                    {canRunAI ? 'Click "Run AI" in the header to generate real-time insights.' : 'No AI analysis yet.'}
                  </p>
                </div>
              )}
            </div>

            {/* Responders */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <Users size={13} /> Responders
              </h3>
              {(incident.responders || []).length === 0 ? (
                <p className="text-xs text-slate-600 italic">No responders assigned.</p>
              ) : (
                <div className="space-y-3">
                  {(incident.responders || []).map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {r.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-sm font-medium">{r.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {incident.description && (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Description</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{incident.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Add Log Modal ── */}
      <AnimatePresence>
        {logOpen && (
          <Modal onClose={() => setLogOpen(false)} title="Add Timeline Log">
            <form onSubmit={handleAddLog} className="space-y-5">
              <div className="flex gap-2">
                {['update', 'action', 'status'].map(t => (
                  <button key={t} type="button" onClick={() => setNewLog({ ...newLog, type: t })}
                    className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${newLog.type === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <textarea required rows={5} value={newLog.message} onChange={e => setNewLog({ ...newLog, message: e.target.value })}
                placeholder="Describe what happened or what action was taken…"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-700" />
              <button type="submit" disabled={logSaving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {logSaving ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                {logSaving ? 'Posting…' : 'Post Update'}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Postmortem Modal ── */}
      <AnimatePresence>
        {pmOpen && (
          <Modal onClose={() => setPmOpen(false)} title="Finalize Postmortem">
            <form onSubmit={handlePostmortem} className="space-y-4">
              {[
                { key: 'rootCause',  label: 'Root Cause',  ph: 'What caused this incident?' },
                { key: 'impact',     label: 'Impact',      ph: 'What was affected?' },
                { key: 'resolution', label: 'Resolution',  ph: 'How was it fixed?' },
                { key: 'summary',    label: 'Summary',     ph: 'Brief executive summary…' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{f.label} *</label>
                  <textarea required rows={2} value={pmForm[f.key]} onChange={e => setPmForm({ ...pmForm, [f.key]: e.target.value })}
                    placeholder={f.ph}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-slate-700" />
                </div>
              ))}
              <button type="submit" disabled={pmSaving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {pmSaving ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                {pmSaving ? 'Saving…' : 'Save Postmortem'}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Toast Notifications ── */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold max-w-sm pointer-events-auto ${
                t.type === 'error'   ? 'bg-red-950 border-red-500/30 text-red-300' :
                t.type === 'info'    ? 'bg-indigo-950 border-indigo-500/30 text-indigo-300' :
                'bg-emerald-950 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <span className="text-base leading-none">{
                t.type === 'error' ? '❌' : t.type === 'info' ? '⚡' : '✅'
              }</span>
              <span className="leading-snug">{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Shared Modal Shell ────────────────────────────────────────────────────────
function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-500">
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
