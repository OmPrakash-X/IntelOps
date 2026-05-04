import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, CheckCircle, Clock, AlertTriangle, Zap, FileText } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { Link } from 'react-router-dom';

// Safely parse AI JSON — the backend returns stringified JSON objects
const parseAI = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { _raw: raw }; // fallback: plain text
  }
};

const PRIORITY_COLOR = { critical: '#ef4444', high: '#f59e0b', medium: '#6366f1', low: '#10b981' };

function Corners({ opacity = "opacity-60" }) {
  return (
    <>
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-l-2 border-[#D4AF37] top-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-r-2 border-[#D4AF37] top-1 right-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-l-2 border-[#D4AF37] bottom-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-r-2 border-[#D4AF37] bottom-1 right-1 pointer-events-none ${opacity}`} />
    </>
  );
}

const AutomationManagement = () => {
  const dispatch = useDispatch();
  const { incidents, loading } = useSelector(s => s.incidents);

  useEffect(() => { dispatch(fetchIncidents()); }, [dispatch]);

  const aiIncidents    = incidents.filter(i => i.aiSuggestions?.nextAction || i.postmortem?.summary);
  const withPostmortem = incidents.filter(i => i.postmortem?.summary);
  const pending        = incidents.filter(i => !i.aiSuggestions?.nextAction && i.status !== 'resolved').length;

  const stats = [
    { label: 'AI Analyses Run',   value: aiIncidents.length,                        color: '#D4AF37' },
    { label: 'Postmortems Filed', value: withPostmortem.length,                      color: '#10b981' },
    { label: 'Avg AI Next Action',value: aiIncidents.length ? '< 2s' : '—',         color: '#D4AF37' },
    { label: 'Pending Analysis',  value: pending,                                    color: '#f59e0b' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 font-['Josefin_Sans']">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-6 bg-[#D4AF37]/40" />
            <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">AI Intelligence Engine</h2>
          </div>
          <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">Root cause analysis & next-action recommendations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
          <Sparkles size={13} />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">AI Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="relative p-6 bg-[#141414] border border-[#D4AF37]/15 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40">
            <Corners opacity="opacity-30" />
            <div className="flex items-center justify-center w-9 h-9 mb-3 border rotate-45" style={{ borderColor: `${s.color}40`, backgroundColor: `${s.color}10` }}>
              <Sparkles size={14} color={s.color} className="-rotate-45" />
            </div>
            <p className="text-[#666] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <h3 className="font-['Marcellus'] text-3xl text-[#F2F0E4]">{loading ? '…' : s.value}</h3>
          </div>
        ))}
      </div>

      {/* AI Analysis Log */}
      <div className="relative bg-[#141414] border border-[#D4AF37]/15 overflow-hidden">
        <Corners opacity="opacity-40" />
        <div className="px-8 py-5 border-b border-[#D4AF37]/10 flex items-center gap-3">
          <Sparkles size={14} color="#D4AF37" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">AI Analysis Log</h3>
        </div>
        <div className="divide-y divide-[#D4AF37]/[0.06]">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="px-8 py-5 animate-pulse">
                <div className="h-4 bg-[#D4AF37]/10 w-2/3 mb-2" />
                <div className="h-3 bg-[#D4AF37]/10 w-1/3 opacity-50" />
              </div>
            ))
          ) : aiIncidents.length === 0 ? (
            <div className="p-16 text-center">
              <Sparkles size={40} className="mx-auto text-[#333] mb-4" />
              <p className="text-[#555] font-bold text-sm uppercase tracking-[0.1em]">No AI analyses yet.</p>
              <p className="text-[#444] text-[11px] mt-2">Open an incident and click "Run AI" to generate insights.</p>
            </div>
          ) : (
            aiIncidents.map(inc => {
              const sev = inc.severity === 'high' ? 'P1' : inc.severity === 'medium' ? 'P2' : 'P3';
              const sevColor = sev === 'P1' ? '#ef4444' : sev === 'P2' ? '#f59e0b' : '#6366f1';
              return (
                <div key={inc._id} className="px-8 py-5 hover:bg-[#D4AF37]/[0.04] transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] border" style={{ borderColor: `${sevColor}40`, backgroundColor: `${sevColor}10`, color: sevColor }}>
                          {sev}
                        </span>
                        {inc.status === 'resolved' && <CheckCircle size={12} color="#10b981" />}
                      </div>
                      <h4 className="font-['Marcellus'] text-sm text-[#F2F0E4] group-hover:text-[#D4AF37] transition-colors truncate mb-3">{inc.title}</h4>
                      {inc.aiSuggestions?.nextAction && (() => {
                        const ai = parseAI(inc.aiSuggestions.nextAction);
                        if (!ai) return null;
                        if (ai._raw) return (
                          <div className="p-3 bg-[#D4AF37]/[0.05] border border-[#D4AF37]/15 mb-2">
                            <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-1">Next Action</p>
                            <p className="text-[11px] text-[#ccc] leading-relaxed">{ai._raw}</p>
                          </div>
                        );
                        const actions = Array.isArray(ai.actions) ? ai.actions : Array.isArray(ai) ? ai : [];
                        const priority = ai.priority || (actions[0]?.priority);
                        const pColor = PRIORITY_COLOR[priority?.toLowerCase()] || '#D4AF37';
                        return (
                          <div className="mb-3 border border-[#D4AF37]/15 bg-[#D4AF37]/[0.03]">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-[#D4AF37]/10">
                              <div className="flex items-center gap-2">
                                <Zap size={11} color="#D4AF37" />
                                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Next Actions</span>
                              </div>
                              {priority && (
                                <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] border"
                                  style={{ borderColor: `${pColor}40`, background: `${pColor}10`, color: pColor }}>
                                  {priority}
                                </span>
                              )}
                            </div>
                            <div className="divide-y divide-[#D4AF37]/[0.06]">
                              {actions.map((act, idx) => {
                                const item = typeof act === 'string' ? { action: act } : act;
                                const iColor = PRIORITY_COLOR[item.priority?.toLowerCase()] || '#D4AF37';
                                return (
                                  <div key={idx} className="flex items-start gap-3 px-4 py-3">
                                    <span className="flex items-center justify-center w-5 h-5 border text-[8px] font-bold shrink-0 mt-0.5"
                                      style={{ borderColor: `${iColor}40`, color: iColor }}>{idx + 1}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] text-[#F2F0E4] leading-relaxed">{item.action}</p>
                                      {item.rationale && <p className="text-[10px] text-[#888] mt-1 leading-relaxed italic">{item.rationale}</p>}
                                      {item.estimatedResolutionHint && <p className="text-[9px] text-[#D4AF37]/60 mt-1 uppercase tracking-[0.1em]">⏱ {item.estimatedResolutionHint}</p>}
                                    </div>
                                    {item.priority && (
                                      <span className="text-[7px] font-bold uppercase px-1.5 py-0.5 border shrink-0"
                                        style={{ borderColor: `${iColor}30`, color: iColor }}>{item.priority}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {ai.summary && <div className="px-4 py-2 border-t border-[#D4AF37]/10"><p className="text-[10px] text-[#888] leading-relaxed italic">{ai.summary}</p></div>}
                          </div>
                        );
                      })()}
                      {inc.postmortem?.summary && (() => {
                        const pm = parseAI(inc.postmortem.summary);
                        if (!pm) return null;
                        if (pm._raw) return (
                          <div className="p-3 bg-[#10b981]/[0.05] border border-[#10b981]/15 mb-2">
                            <p className="text-[9px] font-bold text-[#10b981] uppercase tracking-[0.2em] mb-1">Postmortem Generated</p>
                            <p className="text-[11px] text-[#ccc] leading-relaxed line-clamp-3">{pm._raw}</p>
                          </div>
                        );
                        return (
                          <div className="mb-2 border border-[#10b981]/20 bg-[#10b981]/[0.03]">
                            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#10b981]/10">
                              <FileText size={11} color="#10b981" />
                              <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-[0.2em]">Postmortem Filed</span>
                            </div>
                            <div className="px-4 py-3 space-y-2">
                              {pm.summary && <p className="text-[11px] text-[#ccc] leading-relaxed">{pm.summary}</p>}
                              {pm.rootCause && <p className="text-[10px] text-[#888] leading-relaxed"><span className="text-[#10b981] font-bold">Root Cause: </span>{pm.rootCause}</p>}
                              {pm.impact && <p className="text-[10px] text-[#888] leading-relaxed"><span className="text-[#f59e0b] font-bold">Impact: </span>{pm.impact}</p>}
                              {pm.lessonsLearned && <p className="text-[10px] text-[#888] leading-relaxed"><span className="text-[#6366f1] font-bold">Lessons: </span>{pm.lessonsLearned}</p>}
                            </div>
                          </div>
                        );
                      })()}
                      {inc.aiSuggestions?.timelineSummary && (
                        <div className="p-3 bg-[#D4AF37]/[0.02] border border-[#D4AF37]/10 mb-2">
                          <p className="text-[9px] font-bold text-[#888] uppercase tracking-[0.2em] mb-1">Timeline Summary</p>
                          <p className="text-[11px] text-[#aaa] leading-snug whitespace-pre-line">{inc.aiSuggestions.timelineSummary}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Clock size={10} className="text-[#555]" />
                        <span className="text-[9px] font-bold text-[#555]">
                          {new Date(inc.postmortem?.generatedAt || inc.aiSuggestions?.generatedAt || inc.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Link to={`/incident/${inc._id}`} className="flex items-center justify-center w-8 h-8 bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all shrink-0 mt-1">
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AutomationManagement;
