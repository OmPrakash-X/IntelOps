import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Search, ChevronRight, Clock, ChevronDown, RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { updateIncidentStatus } from '../../incidents/services/incidents.api';

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

const SEV_MAP = { high: 'P1', medium: 'P2', low: 'P3' };
const SEV_COLORS = {
  P1: { border: 'border-[#ef4444]/40', bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
  P2: { border: 'border-[#f59e0b]/40', bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
  P3: { border: 'border-[#6366f1]/40', bg: 'bg-[#6366f1]/10', text: 'text-[#6366f1]' },
};

export default function IncidentManagement() {
  const dispatch = useDispatch();
  const { incidents, loading } = useSelector(s => s.incidents);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [updating, setUpdating] = useState(null);
  const [openStatusMenu, setOpenStatusMenu] = useState(null);

  useEffect(() => { dispatch(fetchIncidents()); }, [dispatch]);

  const handleStatusChange = async (incidentId, newStatus) => {
    setOpenStatusMenu(null);
    try {
      setUpdating(incidentId);
      await updateIncidentStatus(incidentId, newStatus);
      dispatch(fetchIncidents());
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    const close = () => setOpenStatusMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const filtered = incidents.filter(i => {
    const matchesFilter = filter === 'all' ? true : filter === 'active' ? i.status !== 'resolved' : i.status === filter;
    const matchesSearch = i.title?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 font-['Josefin_Sans']">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-6 bg-[#D4AF37]/40" />
            <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">Incidents</h2>
          </div>
          <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">
            {incidents.length} total · {incidents.filter(i => i.status !== 'resolved').length} active
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={14} />
            <input type="text" placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-[#141414] border border-[#D4AF37]/25 outline-none transition-colors text-[#F2F0E4] text-xs w-[260px] pl-9 pr-4 py-2 font-['Josefin_Sans'] focus:border-[#D4AF37] placeholder-[#444] rounded-none"
            />
          </div>
          
          <div className="flex bg-[#141414] border border-[#D4AF37]/25 p-0.5">
            {['all', 'active', 'open', 'inProgress', 'resolved'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`transition-all px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] border-none cursor-pointer ${filter === f ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-transparent text-[#666] hover:text-[#D4AF37]'}`}>
                {f === 'inProgress' ? 'In Progress' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative overflow-visible bg-[#141414] border border-[#D4AF37]/15">
        <Corners opacity="opacity-40" />
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#D4AF37]/[0.03] border-b border-[#D4AF37]/15">
              <tr>
                {['Incident', 'Severity', 'Status', 'Lead', 'Created', ''].map((th, i) => (
                  <th key={i} className="px-6 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/[0.06]">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-5"><div className="h-4 w-full bg-[#D4AF37]/10" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[11px] text-[#555] uppercase tracking-[0.2em]">No incidents match your criteria</td>
                </tr>
              ) : filtered.map((inc) => {
                const sevLevel = SEV_MAP[inc.severity] || inc.severity || 'P3';
                const sColor = SEV_COLORS[sevLevel] || SEV_COLORS.P3;
                
                // Keep styles for dynamic colors
                const statColor = inc.status === 'resolved' ? '#10b981' : inc.status === 'inProgress' ? '#f59e0b' : '#ef4444';

                return (
                  <tr key={inc._id} className="transition-colors group bg-transparent hover:bg-[#D4AF37]/[0.04]">
                    
                    {/* Title & Project */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => document.getElementById(`link-${inc._id}`).click()}>
                      <Link id={`link-${inc._id}`} to={`/incident/${inc._id}`} className="no-underline block">
                        <h4 className="font-['Marcellus'] text-[15px] text-[#F2F0E4] mb-1 transition-colors group-hover:text-[#D4AF37]">
                          {inc.title}
                        </h4>
                        <p className="text-[9px] text-[#666] font-bold uppercase tracking-[0.15em]">
                          {inc.project?.name || '—'}
                        </p>
                      </Link>
                    </td>

                    {/* Severity */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] border ${sColor.border} ${sColor.bg} ${sColor.text}`}>
                        {sevLevel}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenStatusMenu(openStatusMenu === inc._id ? null : inc._id)}
                          disabled={updating === inc._id}
                          className="flex items-center gap-2 transition-all px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                          style={{
                            border: `1px solid ${statColor}40`, background: `${statColor}15`, color: statColor, cursor: updating === inc._id ? 'not-allowed' : 'pointer'
                          }}>
                          {updating === inc._id ? <RefreshCw size={10} className="animate-spin" /> : <>{inc.status === 'inProgress' ? 'In Progress' : inc.status} <ChevronDown size={10} /></>}
                        </button>
                        
                        <AnimatePresence>
                          {openStatusMenu === inc._id && inc.status !== 'resolved' && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                              className="absolute top-full left-0 mt-1 z-50 overflow-hidden bg-[#141414] border border-[#D4AF37]/30 w-[140px] shadow-[0_0_24px_rgba(0,0,0,0.8)]">
                              {[{ label: 'Open', val: 'open', c: '#ef4444' }, { label: 'In Progress', val: 'inProgress', c: '#f59e0b' }, { label: 'Resolved', val: 'resolved', c: '#10b981' }]
                                .filter(s => s.val !== inc.status).map(st => (
                                <button key={st.val} onClick={() => handleStatusChange(inc._id, st.val)}
                                  className="w-full text-left px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] bg-transparent border-none border-b border-[#D4AF37]/10 cursor-pointer hover:bg-[#D4AF37]/10 transition-colors"
                                  style={{ color: st.c }}>
                                  {st.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>

                    {/* Lead */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {inc.assignedLead ? (
                          <>
                            <div className="flex items-center justify-center shrink-0 w-6 h-6 border border-[#D4AF37]/30 text-[#D4AF37] rotate-45">
                              <span className="-rotate-45 font-['Marcellus'] text-[11px]">{inc.assignedLead.username?.[0]?.toUpperCase() ?? 'U'}</span>
                            </div>
                            <span className="text-[11px] text-[#F2F0E4] ml-1">{inc.assignedLead.username}</span>
                          </>
                        ) : <span className="text-[10px] text-[#555] italic">Unassigned</span>}
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4">
                      <span className="text-[10px] text-[#888] tracking-[0.05em]">{new Date(inc.createdAt).toLocaleString()}</span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Link to={`/incident/${inc._id}`} className="inline-flex items-center justify-center w-8 h-8 bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-[#0A0A0A]">
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
