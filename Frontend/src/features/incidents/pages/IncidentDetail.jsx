import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Activity, AlertTriangle, Terminal,
  CheckCircle, Users, Sparkles, ShieldCheck, Plus, FileText,
  Shield, Send, RefreshCw, Zap, X, Download
} from 'lucide-react';
import { useSelector } from 'react-redux';
import API from '../../../services/api';
import { getSocket } from '../../../lib/socket';

function Corners({ opacity = "opacity-60", color = "border-[#D4AF37]" }) {
  return (
    <>
      <span aria-hidden className={`absolute w-2.5 h-2.5 border-t-2 border-l-2 ${color} top-2 left-2 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2.5 h-2.5 border-t-2 border-r-2 ${color} top-2 right-2 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2.5 h-2.5 border-b-2 border-l-2 ${color} bottom-2 left-2 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2.5 h-2.5 border-b-2 border-r-2 ${color} bottom-2 right-2 pointer-events-none ${opacity}`} />
    </>
  );
}

function elapsed(start, end) {
  const diff = Math.abs((end ? new Date(end) : new Date()) - new Date(start));
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const SEV_MAP = { high: 'P1', medium: 'P2', low: 'P3' };
const SEV_COLORS = {
  P1: { border: 'border-[#ef4444]/40', bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
  P2: { border: 'border-[#f59e0b]/40', bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
  P3: { border: 'border-[#6366f1]/40', bg: 'bg-[#6366f1]/10', text: 'text-[#6366f1]' },
};

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const role = user?.role?.toLowerCase();

  const [incident, setIncident] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const [logOpen, setLogOpen] = useState(false);
  const [pmOpen, setPmOpen] = useState(false);
  const [newLog, setNewLog] = useState({ message: '', type: 'update' });
  const [pmForm, setPmForm] = useState({ summary: '', rootCause: '', impact: '', resolution: '' });

  const [aiLoading, setAiLoading] = useState(false);
  const [logSaving, setLogSaving] = useState(false);
  const [pmSaving, setPmSaving] = useState(false);
  const [resolving, setResolving] = useState(false);

  const [toasts, setToasts] = useState([]);
  const toast = (msg, type = 'success') => {
    const tid = Date.now();
    setToasts(t => [...t, { id: tid, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== tid)), 4000);
  };

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
      if (inc?.postmortem) {
        setPmForm({
          summary: inc.postmortem.summary || '',
          rootCause: inc.postmortem.rootCause || '',
          impact: inc.postmortem.impact || '',
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

  useEffect(() => {
    const socket = getSocket();
    socket.emit('join:incident', id);
    const refresh = () => fetchAll();
    const onAI = () => { fetchAll(); toast('✨ AI analysis complete — insights updated', 'success'); };
    const onPostmortem = () => { fetchAll(); toast('📋 AI postmortem generated successfully', 'success'); };
    const onResolved = () => { fetchAll(); toast('✅ Incident marked as resolved', 'success'); };
    socket.on('ai_generated', onAI);
    socket.on('incident_resolved', onResolved);
    socket.on('postmortem_updated', refresh);
    socket.on('ai:rootCause', onAI);
    socket.on('ai:nextAction', onAI);
    socket.on('ai:postmortem', onPostmortem);
    return () => {
      socket.emit('leave:incident', id);
      socket.off('ai_generated'); socket.off('incident_resolved'); socket.off('postmortem_updated');
      socket.off('ai:rootCause'); socket.off('ai:nextAction'); socket.off('ai:postmortem');
    };
  }, [id, fetchAll]);

  const isAdmin = role === 'admin';
  const isLead = role === 'teamlead';
  const isAssigned = isLead && (incident?.assignedLead?._id === (user?._id || user?.id) || incident?.assignedLead === (user?._id || user?.id));
  const canRunAI = isAdmin || (isLead && isAssigned);
  const canResolve = (isAdmin || (isLead && isAssigned)) && incident?.status !== 'resolved';
  const canLog = (isAdmin || (isLead && isAssigned)) && incident?.status !== 'resolved';
  const canPostmortem = (isAdmin || (isLead && isAssigned)) && incident?.status === 'resolved';

  const handleRunAI = async () => {
    try {
      setAiLoading(true); toast('🤖 AI analysis triggered — analyzing timeline…', 'info');
      await API.post(`/incidents/${id}/ai/analyze`);
      await fetchAll();
    } catch (err) { toast('AI analysis failed: ' + (err.response?.data?.message || err.message), 'error'); } finally { setAiLoading(false); }
  };

  const handleGeneratePostmortem = async () => {
    try {
      setAiLoading(true); toast('🤖 Generating AI postmortem — this may take a moment…', 'info');
      await API.post(`/incidents/${id}/ai/postmortem`);
      await fetchAll();
    } catch (err) { toast('Postmortem generation failed: ' + (err.response?.data?.message || err.message), 'error'); } finally { setAiLoading(false); }
  };

  const handleResolve = async () => {
    if (!window.confirm('Mark this incident as resolved?')) return;
    try {
      setResolving(true);
      await API.patch(`/incidents/${id}/status`, { status: 'resolved' });
      toast('✅ Incident resolved successfully', 'success');
      await fetchAll();
    } catch (err) { toast('Resolve failed: ' + (err.response?.data?.message || err.message), 'error'); } finally { setResolving(false); }
  };

  const handleAddLog = async (e) => {
    e.preventDefault(); if (!newLog.message.trim()) return;
    try {
      setLogSaving(true);
      await API.post(`/incidents/${id}/timeline`, newLog);
      setNewLog({ message: '', type: 'update' }); setLogOpen(false); toast('📝 Timeline log added', 'success'); fetchAll();
    } catch (err) { toast('Failed: ' + err.message, 'error'); } finally { setLogSaving(false); }
  };

  const handlePostmortem = async (e) => {
    e.preventDefault();
    try {
      setPmSaving(true);
      await API.patch(`/incidents/${id}/postmortem`, pmForm);
      setPmOpen(false); toast('📋 Postmortem saved successfully', 'success'); fetchAll();
    } catch (err) { toast('Failed: ' + (err.response?.data?.message || err.message), 'error'); } finally { setPmSaving(false); }
  };

  const handleDownloadReport = () => {
    const title = incident.title || 'Incident';
    const pm = incident.postmortem || {};
    const sevLabel = (SEV_MAP[incident.severity] || incident.severity || 'P3').toUpperCase();

    const section = (label, content, color = '#111') =>
      content
        ? `<div class="section">
            <div class="section-label" style="color:${color}">${label}</div>
            <p>${content.replace(/\n/g, '<br/>')}</p>
           </div>`
        : '';

    const list = (label, items, color = '#111') =>
      items?.length
        ? `<div class="section">
            <div class="section-label" style="color:${color}">${label}</div>
            <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
           </div>`
        : '';

    const timelineRows = (timeline || []).map(ev => {
      const tColor = ev.type === 'status' ? '#10b981' : ev.type === 'action' ? '#1d6fc4' : '#8a6d00';
      return `<tr>
        <td style="white-space:nowrap;padding:7px 12px 7px 0;vertical-align:top;color:#555;font-size:12px;">${new Date(ev.createdAt).toLocaleString()}</td>
        <td style="padding:7px 12px;vertical-align:top;"><span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${tColor};border:1px solid ${tColor}40;padding:2px 6px;">${ev.type || 'update'}</span></td>
        <td style="padding:7px 0;vertical-align:top;font-size:13px;">${ev.message || ''}</td>
        <td style="padding:7px 0 7px 12px;vertical-align:top;font-size:11px;color:#777;white-space:nowrap;">${ev.createdBy?.username || ''}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Postmortem — ${title}</title>
  <style>
    @media print { @page { margin: 28mm 20mm; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; font-size: 14px; color: #111; line-height: 1.7; background: #fff; padding: 48px 52px; max-width: 900px; margin: 0 auto; }

    .header { border-bottom: 3px solid #B8973A; padding-bottom: 18px; margin-bottom: 28px; }
    .header h1 { font-size: 22px; font-weight: 900; color: #111; margin-bottom: 8px; }
    .meta { display: flex; flex-wrap: wrap; gap: 20px; font-size: 12px; color: #555; font-family: monospace; }
    .meta span strong { color: #111; }

    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; border: 1px solid; }
    .badge-p1 { color: #c0392b; border-color: #c0392b; }
    .badge-p2 { color: #d68910; border-color: #d68910; }
    .badge-p3 { color: #5b40c0; border-color: #5b40c0; }
    .badge-resolved { color: #0e8a5f; border-color: #0e8a5f; background: #f0faf6; }

    h2 { font-size: 15px; font-weight: 700; color: #B8973A; text-transform: uppercase; letter-spacing: 0.1em; margin: 32px 0 14px; border-bottom: 1px solid #e8e0cc; padding-bottom: 6px; }

    .section { margin-bottom: 20px; }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 6px; }
    .section p { font-size: 13.5px; color: #222; line-height: 1.75; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 8px; }

    ul { padding-left: 18px; }
    ul li { font-size: 13px; color: #333; margin-bottom: 5px; line-height: 1.6; }

    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    thead tr { background: #f7f4ee; }
    thead th { text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; font-weight: 700; border-bottom: 1px solid #e0d8c8; }
    tbody tr { border-bottom: 1px solid #f0ece4; }
    tbody tr:last-child { border-bottom: none; }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
    .stat-box { border: 1px solid #e8e0cc; padding: 12px 14px; }
    .stat-box .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 4px; font-family: sans-serif; }
    .stat-box .stat-value { font-size: 14px; font-weight: 700; color: #222; }

    .footer { margin-top: 40px; padding-top: 14px; border-top: 1px solid #e0d8c8; font-size: 11px; color: #aaa; text-align: center; }
  </style>
</head>
<body>

  <div class="header">
    <h1>Incident Postmortem Report</h1>
    <div style="margin-bottom:10px;">
      <span class="badge badge-${sevLabel.toLowerCase()}">${sevLabel}</span>
      ${incident.status === 'resolved' ? '<span class="badge badge-resolved" style="margin-left:8px;">Resolved</span>' : ''}
    </div>
    <div class="meta">
      <span><strong>Title:</strong> ${title}</span>
      <span><strong>ID:</strong> #${incident._id?.slice(-8) || '—'}</span>
      <span><strong>Created:</strong> ${new Date(incident.createdAt).toLocaleString()}</span>
      ${incident.resolvedAt ? `<span><strong>Resolved:</strong> ${new Date(incident.resolvedAt).toLocaleString()}</span>` : ''}
      <span><strong>Lead:</strong> ${incident.assignedLead?.username || 'Unassigned'}</span>
      <span><strong>Project:</strong> ${incident.project?.name || '—'}</span>
      <span><strong>Reported by:</strong> ${incident.createdBy?.username || '—'}</span>
      <span><strong>Duration:</strong> ${elapsed(incident.createdAt, incident.resolvedAt)}</span>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat-box"><div class="stat-label">Status</div><div class="stat-value">${incident.status === 'inProgress' ? 'In Progress' : (incident.status || '—')}</div></div>
    <div class="stat-box"><div class="stat-label">Severity</div><div class="stat-value">${sevLabel}</div></div>
    <div class="stat-box"><div class="stat-label">Project</div><div class="stat-value">${incident.project?.name || '—'}</div></div>
    <div class="stat-box"><div class="stat-label">Duration</div><div class="stat-value">${elapsed(incident.createdAt, incident.resolvedAt)}</div></div>
  </div>

  ${pm.summary || pm.rootCause || pm.impact || pm.resolution ? `<h2>Postmortem Analysis</h2>` : ''}
  ${section('Executive Summary', pm.summary, '#0e8a5f')}
  ${section('Root Cause', pm.rootCause, '#c0392b')}
  ${section('Impact', pm.impact, '#d68910')}
  ${section('Resolution', pm.resolution, '#1d6fc4')}

  ${pm.lessonsLearned?.length || pm.preventionSteps?.length ? `
  <div class="grid-2">
    ${pm.lessonsLearned?.length ? `<div>${list('Lessons Learned', pm.lessonsLearned, '#7b3fc4')}</div>` : '<div></div>'}
    ${pm.preventionSteps?.length ? `<div>${list('Prevention Steps', pm.preventionSteps, '#0e8a5f')}</div>` : '<div></div>'}
  </div>` : ''}

  ${timelineRows ? `
  <h2>Investigation Timeline (${(timeline || []).length} events)</h2>
  <table>
    <thead><tr>
      <th>Time</th><th>Type</th><th>Message</th><th>By</th>
    </tr></thead>
    <tbody>${timelineRows}</tbody>
  </table>` : ''}

  <div class="footer">
    Generated on ${new Date().toLocaleString()} &nbsp;·&nbsp; Incident #${incident._id?.slice(-8) || '—'}
  </div>

</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow popups to download the report.'); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#D4AF37]">
      <RefreshCw size={28} className="animate-spin mb-4" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Loading incident…</span>
    </div>
  );

  if (!incident) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <AlertTriangle size={48} className="text-[#ef4444]" />
      <h1 className="font-['Marcellus'] text-2xl text-[#F2F0E4]">Incident Not Found</h1>
      <button onClick={() => navigate(-1)} className="mt-2 px-6 py-2.5 bg-[#D4AF37] text-[#0A0A0A] font-bold text-[10px] uppercase tracking-[0.2em]">Go Back</button>
    </div>
  );

  const sevLevel = SEV_MAP[incident.severity] || incident.severity || 'P3';
  const sColor = SEV_COLORS[sevLevel] || SEV_COLORS.P3;
  const statColor = incident.status === 'resolved' ? '#10b981' : incident.status === 'inProgress' ? '#f59e0b' : '#ef4444';
  const pm = incident.postmortem || {};
  const parseAI = (v) => { try { return v ? JSON.parse(v) : null; } catch { return null; } };
  const rawAI = incident.aiSuggestions || {};
  const ai = { nextAction: parseAI(rawAI.nextAction), rootCause: parseAI(rawAI.rootCause), generatedAt: rawAI.generatedAt };
  const hasAI = !!(ai.nextAction || ai.rootCause);

  return (
    <div className="font-['Josefin_Sans'] px-6 py-8 max-w-screen-xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between pb-6 border-b border-[#D4AF37]/15">
        <div className="flex items-start gap-5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 mt-1 border border-[#D4AF37]/30 bg-transparent text-[#D4AF37] flex items-center justify-center cursor-pointer hover:bg-[#D4AF37]/10 transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] border ${sColor.border} ${sColor.bg} ${sColor.text}`}>
                {sevLevel}
              </span>
              <span className="text-[10px] text-[#666] font-mono">#{incident._id?.slice(-8)}</span>
              <span className="text-[10px] text-[#555]">·</span>
              <span className="text-[10px] text-[#777] flex items-center gap-1.5">
                <Clock size={11} />
                {new Date(incident.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="font-['Marcellus'] text-2xl text-[#F2F0E4] leading-snug">{incident.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 mt-1">
          {canRunAI && incident.status !== 'resolved' && (
            <button
              onClick={handleRunAI}
              disabled={aiLoading}
              className="px-5 py-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] font-bold tracking-[0.2em] uppercase cursor-pointer hover:bg-[#D4AF37]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {aiLoading ? 'Analyzing…' : 'Run AI'}
            </button>
          )}
          {canPostmortem && incident.status === 'resolved' && (
            <button
              onClick={handleGeneratePostmortem}
              disabled={aiLoading}
              className="px-5 py-2.5 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-[9px] font-bold tracking-[0.2em] uppercase cursor-pointer hover:bg-[#10b981]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {aiLoading ? 'Generating…' : pm.summary ? 'Regenerate PM' : 'AI PM'}
            </button>
          )}
          {canResolve && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="px-5 py-2.5 bg-[#10b981] text-[#0A0A0A] border-none text-[9px] font-bold tracking-[0.2em] uppercase cursor-pointer hover:bg-[#34d399] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {resolving ? <RefreshCw size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* ── Status Strip ── */}
      <div
        className="flex items-center gap-4 px-6 py-4 border"
        style={{ background: `${statColor}10`, borderColor: `${statColor}30` }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: statColor, boxShadow: `0 0 8px ${statColor}` }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: statColor }}
        >
          {incident.status === 'inProgress' ? 'In Progress' : incident.status}
        </span>
        <span className="text-[#444]">·</span>
        <span className="text-[10px] text-[#777] uppercase tracking-[0.1em]">
          Lead: <strong className="text-[#D4AF37]">{incident.assignedLead?.username || 'Unassigned'}</strong>
        </span>
        {aiLoading && (
          <span className="ml-auto flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            <RefreshCw size={10} className="animate-spin" /> AI Processing…
          </span>
        )}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left Column ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Status', v: incident.status, c: statColor, i: Activity },
              { label: 'Project', v: incident.project?.name || '—', c: '#D4AF37', i: Shield },
              { label: 'Creator', v: incident.createdBy?.username || 'System', c: '#D4AF37', i: Users },
              { label: 'Time', v: elapsed(incident.createdAt, incident.resolvedAt), c: '#D4AF37', i: Clock },
            ].map((s, idx) => (
              <div
                key={idx}
                className="relative p-5 flex items-center gap-4 bg-[#141414] border border-[#D4AF37]/15 hover:-translate-y-0.5 transition-transform"
              >
                <Corners opacity="opacity-30" />
                <div
                  className="flex items-center justify-center shrink-0 w-9 h-9 border rotate-45"
                  style={{ borderColor: `${s.c}40`, backgroundColor: `${s.c}10` }}
                >
                  <s.i size={14} color={s.c} className="-rotate-45" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#555] mb-1">{s.label}</p>
                  <p className="font-['Marcellus'] text-sm uppercase leading-snug break-words" style={{ color: s.c }}>
                    {s.v === 'inProgress' ? 'In Progress' : s.v}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative p-8 bg-[#141414] border border-[#D4AF37]/15">
            <Corners opacity="opacity-30" />

            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-[#D4AF37]/10">
              <h2 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                <Terminal size={14} />
                Investigation Timeline
                <span className="px-2 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[8px]">
                  {timeline.length}
                </span>
              </h2>
              {canLog && (
                <button
                  onClick={() => setLogOpen(true)}
                  className="px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#D4AF37]/20 transition-all"
                >
                  <Plus size={11} /> Add Log
                </button>
              )}
            </div>

            {/* Timeline Events */}
            <div className="pl-8 border-l border-[#D4AF37]/20 ml-3 space-y-6">
              {timeline.length === 0 && (
                <p className="text-[11px] text-[#444] italic py-4">No timeline events yet.</p>
              )}
              {timeline.map((ev, i) => {
                const cColor = ev.type === 'status' ? '#10b981' : ev.type === 'action' ? '#3b82f6' : '#D4AF37';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute w-3.5 h-3.5 border-2 border-[#141414] rotate-45"
                      style={{ left: -40, top: 16, background: cColor }}
                    />

                    <div className="p-5 bg-[#D4AF37]/[0.03] border border-[#D4AF37]/10">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span
                          className="text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-1 border"
                          style={{ borderColor: `${cColor}40`, color: cColor }}
                        >
                          {ev.type || 'update'}
                        </span>
                        <span className="text-[10px] text-[#555] font-mono">
                          {new Date(ev.createdAt).toLocaleTimeString()}
                        </span>
                        {ev.createdBy?.username && (
                          <span className="ml-auto text-[10px] text-[#777] uppercase tracking-[0.1em]">
                            by {ev.createdBy.username}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#E8E6DC] leading-relaxed">{ev.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {canPostmortem && (
              <button
                onClick={() => setPmOpen(true)}
                className="w-full mt-8 py-4 flex items-center justify-center gap-2 bg-transparent border border-dashed border-[#10b981]/50 text-[#10b981] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#10b981]/10 transition-colors"
              >
                <FileText size={14} />
                {pm.summary ? 'Edit Postmortem' : 'Finalize Postmortem'}
              </button>
            )}
          </div>

          {/* Postmortem Report */}
          {pm.summary && (
            <div className="relative p-8 bg-[#141414] border border-[#10b981]/40">
              <Corners opacity="opacity-100" color="border-[#10b981]" />

              <div className="flex justify-between items-start mb-8 pb-6 border-b border-[#10b981]/20">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 border border-[#10b981] bg-[#10b981]/10 rotate-45 shrink-0">
                    <FileText size={16} color="#10b981" className="-rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-['Marcellus'] text-xl text-[#10b981] uppercase tracking-[0.1em]">
                      AI Postmortem
                    </h3>
                    {pm.generatedAt && (
                      <p className="text-[9px] text-[#10b981]/60 tracking-[0.15em] uppercase mt-1">
                        Generated {new Date(pm.generatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#10b981]/20 transition-all"
                >
                  <Download size={12} /> PDF
                </button>
              </div>

              <div className="space-y-7 text-sm text-[#bbb] leading-relaxed">
                {pm.summary && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-[#10b981] uppercase tracking-[0.2em]">Executive Summary</h4>
                    <p className="text-[#ccc]">{pm.summary}</p>
                  </div>
                )}
                {pm.rootCause && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-[#ef4444] uppercase tracking-[0.2em]">Root Cause</h4>
                    <p className="text-[#ccc]">{pm.rootCause}</p>
                  </div>
                )}
                {pm.impact && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-[#f59e0b] uppercase tracking-[0.2em]">Impact</h4>
                    <p className="text-[#ccc]">{pm.impact}</p>
                  </div>
                )}
                {pm.resolution && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-[#3b82f6] uppercase tracking-[0.2em]">Resolution</h4>
                    <p className="text-[#ccc]">{pm.resolution}</p>
                  </div>
                )}

                {(pm.lessonsLearned?.length > 0 || pm.preventionSteps?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2 pt-6 border-t border-[#10b981]/15">
                    {pm.lessonsLearned?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] text-[#a855f7] uppercase tracking-[0.2em]">Lessons Learned</h4>
                        <ul className="space-y-2.5 pl-4 list-square marker:text-[#a855f7]">
                          {pm.lessonsLearned.map((l, i) => (
                            <li key={i} className="text-[#aaa] text-[13px] leading-relaxed">{l}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pm.preventionSteps?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] text-[#10b981] uppercase tracking-[0.2em]">Prevention Steps</h4>
                        <ul className="space-y-2.5 pl-4 list-square marker:text-[#10b981]">
                          {pm.preventionSteps.map((s, i) => (
                            <li key={i} className="text-[#aaa] text-[13px] leading-relaxed">{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* AI Suggestions */}
          <div className="relative p-7 bg-[#141414] border border-[#D4AF37]/30">
            <Corners opacity="opacity-60" />
            <h3 className="flex items-center gap-2.5 mb-6 pb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/10">
              <Sparkles size={14} /> AI Diagnostic
            </h3>

            {aiLoading ? (
              <div className="py-10 text-center text-[#D4AF37]">
                <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
                <span className="text-[9px] uppercase tracking-[0.2em]">Analyzing…</span>
              </div>
            ) : hasAI ? (
              <div className="space-y-7">
                {ai.nextAction?.actions?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[9px] text-[#666] uppercase tracking-[0.2em] mb-3">Next Actions</h4>
                    {ai.nextAction.actions.map((a, i) => (
                      <div key={i} className="p-4 bg-[#D4AF37]/[0.05] border border-[#D4AF37]/15 space-y-2">
                        <span className="text-[8px] px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] uppercase tracking-[0.1em]">
                          {a.priority}
                        </span>
                        <p className="text-[13px] text-[#F2F0E4] leading-snug">{a.action}</p>
                        {a.rationale && <p className="text-[11px] text-[#777] leading-relaxed">{a.rationale}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {ai.rootCause?.probableCauses?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[9px] text-[#666] uppercase tracking-[0.2em] mb-3">Probable Causes</h4>
                    {ai.rootCause.probableCauses.map((c, i) => (
                      <div key={i} className="flex gap-3 py-1">
                        <span className="text-[9px] text-[#ef4444] uppercase mt-0.5 shrink-0">[{c.confidence}]</span>
                        <p className="text-[12px] text-[#ccc] leading-snug">{c.cause}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : incident.status === 'resolved' ? (
              pm.summary ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-[9px] text-[#10b981] uppercase tracking-[0.2em]">Summary</h4>
                    <p className="text-[12px] text-[#ccc] leading-relaxed">{pm.summary}</p>
                  </div>
                  {pm.rootCause && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] text-[#ef4444] uppercase tracking-[0.2em]">Root Cause</h4>
                      <p className="text-[12px] text-[#ccc] leading-relaxed">{pm.rootCause}</p>
                    </div>
                  )}
                  {pm.resolution && (
                    <div className="space-y-2">
                      <h4 className="text-[9px] text-[#3b82f6] uppercase tracking-[0.2em]">Resolution</h4>
                      <p className="text-[12px] text-[#ccc] leading-relaxed">{pm.resolution}</p>
                    </div>
                  )}
                  <div className="pt-3 mt-1 border-t border-[#10b981]/15 flex items-center gap-2 text-[#10b981]">
                    <CheckCircle size={13} />
                    <span className="text-[9px] uppercase tracking-[0.15em] font-bold">Incident Resolved</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-[#10b981] space-y-2">
                  <CheckCircle size={24} className="mx-auto opacity-50" />
                  <p className="text-[10px] uppercase tracking-[0.1em]">Incident Resolved</p>
                  <p className="text-[10px] text-[#555]">No postmortem generated yet.</p>
                </div>
              )
            ) : (
              <div className="py-8 text-center text-[#444]">
                <p className="text-[10px] uppercase tracking-[0.1em]">No AI analysis yet.</p>
              </div>
            )}
          </div>

          {/* Responders */}
          <div className="relative p-7 bg-[#141414] border border-[#D4AF37]/15">
            <Corners opacity="opacity-30" />
            <h3 className="flex items-center gap-2.5 mb-6 pb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] border-b border-[#D4AF37]/10">
              <Users size={14} /> Responders
            </h3>
            {(incident.responders || []).length === 0 ? (
              <p className="text-[11px] text-[#444] italic">No responders assigned.</p>
            ) : (
              <div className="space-y-4">
                {incident.responders.map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 border border-[#D4AF37]/30 text-[#D4AF37] rotate-45 shrink-0">
                      <span className="-rotate-45 font-['Marcellus'] text-[11px]">
                        {r.username?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                    </div>
                    <span className="text-[13px] text-[#E8E6DC]">{r.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {logOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-lg p-8 bg-[#141414] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.15)]"
            >
              <Corners opacity="opacity-100" />
              <div className="flex justify-between items-center mb-7 pb-5 border-b border-[#D4AF37]/20">
                <h3 className="font-['Marcellus'] text-xl text-[#D4AF37] uppercase">Add Log</h3>
                <button
                  onClick={() => setLogOpen(false)}
                  className="bg-transparent border-none text-[#666] cursor-pointer hover:text-[#D4AF37] transition-colors p-1"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAddLog} className="space-y-6">
                <div className="flex gap-3">
                  {['update', 'action', 'status'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewLog({ ...newLog, type: t })}
                      className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] cursor-pointer transition-colors border ${newLog.type === t
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'border-[#333] bg-transparent text-[#666] hover:border-[#D4AF37]/50 hover:text-[#999]'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe the update…"
                  value={newLog.message}
                  onChange={e => setNewLog({ ...newLog, message: e.target.value })}
                  className="w-full p-4 bg-transparent border border-[#D4AF37]/30 text-[#F2F0E4] font-['Josefin_Sans'] text-sm resize-none outline-none focus:border-[#D4AF37] placeholder:text-[#444] transition-colors"
                />
                <button
                  type="submit"
                  disabled={logSaving}
                  className="w-full flex justify-center items-center gap-2 py-3.5 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-[#F2E8C4] transition-colors disabled:opacity-60"
                >
                  {logSaving ? <><RefreshCw size={12} className="animate-spin" /> Posting…</> : 'Post Update'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {pmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-xl p-8 bg-[#141414] border border-[#10b981] shadow-[0_0_40px_rgba(16,185,129,0.15)]"
            >
              <Corners opacity="opacity-100" color="border-[#10b981]" />
              <div className="flex justify-between items-center mb-7 pb-5 border-b border-[#10b981]/20">
                <h3 className="font-['Marcellus'] text-xl text-[#10b981] uppercase">Finalize Postmortem</h3>
                <button
                  onClick={() => setPmOpen(false)}
                  className="bg-transparent border-none text-[#666] cursor-pointer hover:text-[#10b981] transition-colors p-1"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handlePostmortem} className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
                {[
                  { key: 'rootCause', label: 'Root Cause' },
                  { key: 'impact', label: 'Impact' },
                  { key: 'resolution', label: 'Resolution' },
                  { key: 'summary', label: 'Summary' },
                ].map(f => (
                  <div key={f.key} className="space-y-2">
                    <label className="block text-[9px] text-[#10b981] uppercase tracking-[0.2em]">
                      {f.label} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={pmForm[f.key]}
                      onChange={e => setPmForm({ ...pmForm, [f.key]: e.target.value })}
                      className="w-full p-4 bg-transparent border border-[#10b981]/30 text-[#F2F0E4] font-['Josefin_Sans'] text-sm resize-none outline-none focus:border-[#10b981] transition-colors"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={pmSaving}
                  className="w-full flex justify-center items-center gap-2 py-3.5 bg-[#10b981] text-[#0A0A0A] border-none font-bold text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-[#34d399] transition-colors mt-2 disabled:opacity-60"
                >
                  {pmSaving ? <><RefreshCw size={12} className="animate-spin" /> Saving…</> : 'Save Postmortem'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toasts ── */}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className={`px-5 py-3.5 bg-[#141414] border text-[#F2F0E4] text-[11px] tracking-[0.05em] shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${t.type === 'error' ? 'border-[#ef4444]' : t.type === 'info' ? 'border-[#3b82f6]' : 'border-[#10b981]'
                }`}
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}