import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Bell, LogOut, LayoutDashboard, AlertCircle, 
  Users, Plus, ArrowRight, Activity, 
  Clock, CheckCircle, ShieldAlert,
  Search, Shield, X, UserPlus, Filter, ChevronDown, ChevronRight, RefreshCw
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../auth/authSlice';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { fetchProjects } from '../../project/projectSlice';
import { fetchGroups } from '../../groups/groupSlice';
import { fetchUsers } from '../../users/userSlice';
import { 
  addGroupMembers, assignResponders, 
  updateIncidentStatus, getNotifications 
} from '../../incidents/services/incidents.api';

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

const TeamLeadDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  useEffect(() => {
    if (token && user) {
      const role = (user.role || user.user?.role)?.toLowerCase();
      if (role !== 'teamlead') {
        navigate('/unauthorized');
      }
    }
  }, [user, token, navigate]);

  const { incidents, loading: incidentsLoading } = useSelector(state => state.incidents);
  const { groups, loading: groupsLoading } = useSelector(state => state.groups);
  const { projects } = useSelector(state => state.projects);
  const { users: allUsers } = useSelector(state => state.users);
  
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProjectId, setSelectedProjectId] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [openStatusMenu, setOpenStatusMenu] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAssignRespondersModalOpen, setIsAssignRespondersModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myUserId = user?._id || user?.id;
  const myGroup = groups.find(g =>
    g.teamLead?._id?.toString() === myUserId?.toString() ||
    g.teamLead?.toString() === myUserId?.toString()
  );

  useEffect(() => {
    dispatch(fetchIncidents());
    dispatch(fetchGroups());
    dispatch(fetchProjects());
    dispatch(fetchUsers());
    loadNotifications();
  }, [dispatch]);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleAddMembers = async () => {
    if (!myGroup || selectedMembers.length === 0) return;
    try {
      setIsSubmitting(true);
      await addGroupMembers(myGroup._id, selectedMembers);
      setIsAddMemberModalOpen(false);
      setSelectedMembers([]);
      dispatch(fetchGroups());
    } catch (err) {
      alert("Failed to add members: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignResponders = async () => {
    if (!selectedIncident) return;
    try {
      await assignResponders(selectedIncident._id, selectedMembers);
      setIsAssignRespondersModalOpen(false);
      setSelectedMembers([]);
      setSelectedIncident(null);
      dispatch(fetchIncidents());
    } catch (err) {
      alert("Failed to assign responders: " + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setOpenStatusMenu(null);
    try {
      setUpdatingStatus(id);
      await updateIncidentStatus(id, status);
      dispatch(fetchIncidents());
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    const close = () => setOpenStatusMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const stats = {
    groupIncidents: incidents.length,
    needsResponders: incidents.filter(i => (i.responders || []).length === 0).length,
    inProgress: incidents.filter(i => i.status === 'inProgress').length,
    resolvedThisWeek: incidents.filter(i => {
      if (i.status !== 'resolved') return false;
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(i.resolvedAt || i.updatedAt) > lastWeek;
    }).length
  };

  const filteredIncidents = incidents.filter(i => {
    const isOurGroup = !myGroup || i.group?.toString() === myGroup?._id?.toString();
    const statusMatch = activeFilter === 'All' || i.status === activeFilter.toLowerCase().replace(' ', '');
    const projectMatch = selectedProjectId === 'All' || i.project?._id === selectedProjectId || i.project === selectedProjectId;
    return isOurGroup && statusMatch && projectMatch;
  });

  const priorityIncidents = incidents.filter(i => {
    const isOurGroup = !myGroup || i.group?.toString() === myGroup?._id?.toString();
    return isOurGroup && (i.responders || []).length === 0 && i.status !== 'resolved';
  });

  return (
    <div className="space-y-10 font-['Josefin_Sans']">

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        
        {/* Header Section */}
        {(location.pathname === '/team-lead' || location.pathname === '/team-lead/group') && (
          <section className="relative p-8 bg-[#141414] border border-[#D4AF37]/20 group">
            <Corners opacity="opacity-100" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="font-['Marcellus'] text-3xl text-[#F2F0E4] mb-2 uppercase tracking-[0.1em]">
                  {myGroup?.name || (groupsLoading ? 'Loading Team...' : 'No Group Assigned')}
                </h2>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-[#888] uppercase tracking-[0.2em] mb-1">Lead Responsible</span>
                    <span className="font-['Marcellus'] text-[#D4AF37] text-lg">{user?.username}</span>
                  </div>
                  <div className="w-px h-10 bg-[#D4AF37]/20" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-[#888] uppercase tracking-[0.2em] mb-2">Team Roster</span>
                    <div className="flex -space-x-2">
                      {myGroup?.teamMembers?.map((m, i) => (
                        <div key={i} className="w-8 h-8 rounded-none border border-[#D4AF37]/40 bg-[#D4AF37]/5 flex items-center justify-center rotate-45 group-hover:border-[#D4AF37]" title={m.username}>
                          <span className="-rotate-45 font-['Marcellus'] text-[#F2F0E4] text-[10px]">{m.username?.[0]?.toUpperCase() ?? '?'}</span>
                        </div>
                      ))}
                      <button onClick={() => setIsAddMemberModalOpen(true)} className="w-8 h-8 rounded-none border border-[#D4AF37] bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] rotate-45 hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors ml-4 cursor-pointer">
                        <Plus size={12} className="-rotate-45" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAddMemberModalOpen(true)} className="px-6 py-3.5 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#F2E8C4] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <Plus size={14} /> Manage Members
              </button>
            </div>
          </section>
        )}

        {location.pathname === '/team-lead' && (
          <>
            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Active Issues', value: stats.groupIncidents, icon: Activity, color: '#D4AF37' },
                { label: 'Pending Assignment', value: stats.needsResponders, icon: ShieldAlert, color: '#ef4444' },
                { label: 'In Progress', value: stats.inProgress, icon: Clock, color: '#f59e0b' },
                { label: 'Resolved (7d)', value: stats.resolvedThisWeek, icon: CheckCircle, color: '#10b981' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} 
                  className="relative p-6 bg-[#141414] border border-[#D4AF37]/15 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 group">
                  <Corners opacity="opacity-30" />
                  <div className="flex items-center justify-center w-10 h-10 mb-4 border bg-opacity-10 rotate-45" style={{ borderColor: `${stat.color}40`, backgroundColor: `${stat.color}10` }}>
                    <stat.icon size={16} color={stat.color} className="-rotate-45" />
                  </div>
                  <div className={`font-['Marcellus'] text-3xl mb-1 ${stat.color === '#D4AF37' ? 'text-[#F2F0E4]' : `text-[${stat.color}]`}`}>{stat.value}</div>
                  <div className="text-[9px] font-bold text-[#666] uppercase tracking-[0.2em]">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* PRIORITY SECTION */}
            {priorityIncidents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-1 border-b border-[#ef4444]/20 pb-4">
                  <AlertCircle className="text-[#ef4444]" size={16} />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ef4444]">Critical: Needs Assignment</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {priorityIncidents.map((incident, i) => {
                      const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : incident.severity === 'low' ? 'P3' : incident.severity;
                      return (
                        <motion.div key={incident._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} 
                          className="relative p-6 bg-[#141414] border border-[#ef4444]/30 flex flex-col justify-between group">
                          <Corners opacity="opacity-100" color="border-[#ef4444]" />
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span className="px-2 py-0.5 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 text-[8px] font-bold uppercase tracking-[0.2em]">Unassigned</span>
                              <span className="text-[9px] font-bold text-[#ef4444] tracking-[0.2em]">{sev}</span>
                            </div>
                            <h3 className="font-['Marcellus'] text-[18px] text-[#F2F0E4] mb-2 leading-tight group-hover:text-[#ef4444] transition-colors">{incident.title}</h3>
                            <p className="text-[#888] text-[12px] line-clamp-2 mb-6">{incident.description}</p>
                          </div>
                          <button onClick={() => { setSelectedIncident(incident); setIsAssignRespondersModalOpen(true); }}
                            className="w-full py-3 bg-[#ef4444]/10 hover:bg-[#ef4444] text-[#ef4444] hover:text-[#0A0A0A] border border-[#ef4444]/30 hover:border-[#ef4444] text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer">
                            Assign Responders <ArrowRight size={12} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}
          </>
        )}

        {location.pathname === '/team-lead/notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 border-b border-[#D4AF37]/10 pb-4 mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Notifications</h2>
            </div>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={n._id || i} className={`p-5 relative border ${n.isRead ? 'bg-[#141414]/40 border-[#D4AF37]/5 opacity-60' : 'bg-[#141414] border-[#D4AF37]/20'} flex items-start gap-4`}>
                  {!n.isRead && <Corners opacity="opacity-30" />}
                  <div className={`flex items-center justify-center w-8 h-8 border rotate-45 shrink-0 ${n.isRead ? 'border-[#D4AF37]/10 bg-transparent text-[#666]' : 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                    <Bell size={12} className="-rotate-45" />
                  </div>
                  <div className="flex-1 min-w-0 ml-2">
                    <p className="text-[12px] text-[#F2F0E4] leading-relaxed mb-2">{n.message}</p>
                    <span className="text-[8px] font-bold text-[#666] uppercase tracking-[0.2em] block">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && <div className="py-10 text-center text-[#555] text-[10px] uppercase tracking-[0.2em]">No notifications yet.</div>}
            </div>
          </div>
        )}

        {(location.pathname === '/team-lead' || location.pathname === '/team-lead/incidents') && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 border-b border-[#D4AF37]/10 pb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Incident Log</h2>
                <div className="flex bg-[#141414] border border-[#D4AF37]/25 p-0.5">
                  {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer border-none ${activeFilter === f ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-transparent text-[#666] hover:text-[#D4AF37]'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-[#141414] border border-[#D4AF37]/25 outline-none transition-colors text-[#F2F0E4] text-[10px] uppercase tracking-[0.1em] pl-3 pr-8 py-2 appearance-none">
                  <option value="All">All Projects</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="relative bg-[#141414] border border-[#D4AF37]/15 overflow-hidden min-h-[400px]">
              <Corners opacity="opacity-40" />
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-[#D4AF37]/[0.03] border-b border-[#D4AF37]/15">
                    <tr>
                      {['Incident', 'Severity', 'Status', 'Responders', 'Date', ''].map((th, i) => (
                        <th key={i} className="px-6 py-4 text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">{th}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/[0.06]">
                    {incidentsLoading ? (
                      [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-5"><div className="h-4 w-full bg-[#D4AF37]/10" /></td></tr>)
                    ) : filteredIncidents.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-[10px] text-[#555] uppercase tracking-[0.2em]">No incidents match criteria</td></tr>
                    ) : filteredIncidents.map(incident => {
                      const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : incident.severity === 'low' ? 'P3' : incident.severity;
                      const sevColor = sev === 'P1' ? '#ef4444' : sev === 'P2' ? '#f59e0b' : '#6366f1';
                      const statColor = incident.status === 'resolved' ? '#10b981' : incident.status === 'inProgress' ? '#f59e0b' : '#ef4444';
                      
                      return (
                        <tr key={incident._id} className="transition-colors group hover:bg-[#D4AF37]/[0.04]">
                          <td className="px-6 py-4">
                            <h4 className="font-['Marcellus'] text-[15px] text-[#F2F0E4] mb-1 group-hover:text-[#D4AF37] transition-colors">{incident.title}</h4>
                            <p className="text-[9px] text-[#666] font-bold uppercase tracking-[0.15em]">{incident.project?.name || 'Unknown Project'} · #{incident._id?.slice(-6).toUpperCase()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] border" style={{ borderColor: `${sevColor}40`, background: `${sevColor}10`, color: sevColor }}>{sev}</span>
                          </td>
                          <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                            <div className="relative inline-block">
                              <button onClick={() => setOpenStatusMenu(openStatusMenu === incident._id ? null : incident._id)} disabled={updatingStatus === incident._id}
                                className="flex items-center gap-2 transition-all px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] border cursor-pointer"
                                style={{ borderColor: `${statColor}40`, background: `${statColor}15`, color: statColor, opacity: updatingStatus === incident._id ? 0.5 : 1 }}>
                                {updatingStatus === incident._id ? <RefreshCw size={10} className="animate-spin" /> : <>{incident.status === 'inProgress' ? 'In Progress' : incident.status} <ChevronDown size={10} /></>}
                              </button>
                              
                              <AnimatePresence>
                                {openStatusMenu === incident._id && incident.status !== 'resolved' && (
                                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="absolute top-full left-0 mt-1 z-50 bg-[#141414] border border-[#D4AF37]/30 w-[140px] shadow-[0_0_24px_rgba(0,0,0,0.8)]">
                                    {[{ label: 'Open', val: 'open', c: '#ef4444' }, { label: 'In Progress', val: 'inProgress', c: '#f59e0b' }, { label: 'Resolved', val: 'resolved', c: '#10b981' }]
                                      .filter(s => s.val !== incident.status).map(st => (
                                      <button key={st.val} onClick={() => handleStatusUpdate(incident._id, st.val)}
                                        className="w-full text-left px-3 py-2 text-[8px] font-bold uppercase tracking-[0.15em] bg-transparent border-none border-b border-[#D4AF37]/10 cursor-pointer hover:bg-[#D4AF37]/10 transition-colors"
                                        style={{ color: st.c }}>{st.label}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {incident.responders?.length > 0 ? (
                              <div className="flex -space-x-2">
                                {incident.responders.map((r, i) => (
                                  <div key={i} className="w-6 h-6 flex items-center justify-center border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] rotate-45" title={r.username}>
                                    <span className="-rotate-45 font-['Marcellus'] text-[9px]">{r.username?.[0]?.toUpperCase()}</span>
                                  </div>
                                ))}
                                <button onClick={() => { setSelectedIncident(incident); setIsAssignRespondersModalOpen(true); }} className="w-6 h-6 flex items-center justify-center border border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] rotate-45 hover:bg-[#D4AF37] hover:text-[#0A0A0A] ml-3 cursor-pointer">
                                  <Plus size={8} className="-rotate-45" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => { setSelectedIncident(incident); setIsAssignRespondersModalOpen(true); }} className="px-2 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[8px] font-bold uppercase tracking-[0.1em] hover:bg-[#D4AF37]/20 transition-all cursor-pointer">Assign</button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[10px] text-[#888] tracking-[0.05em]">{new Date(incident.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/incident/${incident._id}`} className="inline-flex items-center justify-center w-7 h-7 bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all">
                              <ChevronRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ── Add Members Modal ── */}
      <AnimatePresence>
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2)] p-8">
              <Corners opacity="opacity-100" />
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D4AF37]/20">
                <h3 className="font-['Marcellus'] text-xl text-[#D4AF37] uppercase">Add Members to Team</h3>
                <button onClick={() => setIsAddMemberModalOpen(false)} className="bg-transparent border-none text-[#666] hover:text-[#D4AF37] cursor-pointer"><X size={16} /></button>
              </div>
              
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={14} />
                <input type="text" placeholder="Search users by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-[#D4AF37]/30 text-[#F2F0E4] text-[12px] pl-9 pr-4 py-2.5 outline-none focus:border-[#D4AF37] font-['Josefin_Sans']" />
              </div>

              <div className="max-h-60 overflow-y-auto border border-[#D4AF37]/15 bg-[#D4AF37]/[0.02] mb-6 p-2">
                {allUsers?.filter(u => {
                  const notInGroup = !myGroup?.teamMembers?.some(m => m._id === u._id) && myGroup?.teamLead?._id !== u._id;
                  const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
                  return notInGroup && matchesSearch;
                }).map(u => (
                  <div key={u._id} onClick={() => setSelectedMembers(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-[#D4AF37]/5 last:border-0 ${selectedMembers.includes(u._id) ? 'bg-[#D4AF37]/10' : 'hover:bg-[#D4AF37]/5'}`}>
                    <div className={`w-3.5 h-3.5 border flex items-center justify-center rotate-45 ${selectedMembers.includes(u._id) ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#D4AF37]/30'}`}>
                      {selectedMembers.includes(u._id) && <CheckCircle size={8} className="-rotate-45 text-[#0A0A0A]" />}
                    </div>
                    <div>
                      <div className="text-[12px] text-[#F2F0E4]">{u.username}</div>
                      <div className="text-[9px] text-[#666]">{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D4AF37]/10">
                <button onClick={() => setIsAddMemberModalOpen(false)} className="px-5 py-2.5 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-[#D4AF37]/10">Cancel</button>
                <button onClick={handleAddMembers} disabled={selectedMembers.length === 0 || isSubmitting} className="px-5 py-2.5 bg-[#D4AF37] border-none text-[#0A0A0A] text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer disabled:opacity-50 hover:bg-[#F2E8C4]">
                  {isSubmitting ? 'Adding...' : `Add ${selectedMembers.length} Members`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Assign Responders Modal ── */}
      <AnimatePresence>
        {isAssignRespondersModalOpen && selectedIncident && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#141414] border border-[#ef4444] shadow-[0_0_40px_rgba(239,68,68,0.2)] p-8">
              <Corners opacity="opacity-100" color="border-[#ef4444]" />
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#ef4444]/20">
                <div>
                  <h3 className="font-['Marcellus'] text-xl text-[#ef4444] uppercase">Assign Responders</h3>
                  <p className="text-[9px] font-bold text-[#888] uppercase tracking-[0.1em] mt-1">INC-{selectedIncident._id?.slice(-6).toUpperCase()}</p>
                </div>
                <button onClick={() => setIsAssignRespondersModalOpen(false)} className="bg-transparent border-none text-[#666] hover:text-[#ef4444] cursor-pointer"><X size={16} /></button>
              </div>
              
              <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ef4444]">Select from your team:</div>
              <div className="max-h-60 overflow-y-auto border border-[#ef4444]/15 bg-[#ef4444]/[0.02] mb-6 p-2">
                {myGroup?.teamMembers?.map(u => {
                  const isAssigned = selectedIncident.responders?.some(r => r._id === u._id);
                  return (
                    <div key={u._id} onClick={() => !isAssigned && setSelectedMembers(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                      className={`flex items-center justify-between p-3 transition-colors border-b border-[#ef4444]/5 last:border-0 ${isAssigned ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#ef4444]/5'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center rotate-45 ${selectedMembers.includes(u._id) || isAssigned ? 'border-[#ef4444] bg-[#ef4444]' : 'border-[#ef4444]/30'}`}>
                          {(selectedMembers.includes(u._id) || isAssigned) && <CheckCircle size={8} className="-rotate-45 text-[#0A0A0A]" />}
                        </div>
                        <div>
                          <div className="text-[12px] text-[#F2F0E4]">{u.username}</div>
                          <div className="text-[9px] text-[#666]">{u.email}</div>
                        </div>
                      </div>
                      {isAssigned && <span className="text-[8px] font-bold text-[#ef4444] uppercase tracking-[0.1em]">Already Assigned</span>}
                    </div>
                  )
                })}
                {(!myGroup?.teamMembers || myGroup.teamMembers.length === 0) && (
                  <p className="p-4 text-center text-[10px] text-[#555] italic">No members in your team to assign.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#ef4444]/10">
                <button onClick={() => setIsAssignRespondersModalOpen(false)} className="px-5 py-2.5 bg-transparent border border-[#ef4444]/30 text-[#ef4444] text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-[#ef4444]/10">Cancel</button>
                <button onClick={handleAssignResponders} disabled={selectedMembers.length === 0} className="px-5 py-2.5 bg-[#ef4444] border-none text-[#0A0A0A] text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer disabled:opacity-50 hover:bg-[#f87171]">
                  Assign {selectedMembers.length} Members
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TeamLeadDashboard;
