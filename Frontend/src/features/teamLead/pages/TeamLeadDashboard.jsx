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

const TeamLeadDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  // Role Protection
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
  const [openStatusMenu, setOpenStatusMenu] = useState(null); // incidentId with open dropdown
  const [updatingStatus, setUpdatingStatus] = useState(null); // incidentId being updated
  
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

  useEffect(() => {
    if (allUsers) {
      console.log("TeamLeadDashboard -> allUsers:", allUsers);
    }
  }, [allUsers]);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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

  // Close dropdown when clicking outside
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
    // Match by the incident's own group field (not via project)
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
    <div className="space-y-10">

        <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
          {(location.pathname === '/team-lead' || location.pathname === '/team-lead/group') && (
            <section className="p-8 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">
                    {myGroup?.name || (groupsLoading ? 'Loading Team...' : 'No Group Assigned')}
                  </h2>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Lead Responsible</span>
                      <span className="text-sm font-medium text-white">{user?.username}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-800" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Team Roster</span>
                      <div className="flex -space-x-2">
                        {myGroup?.teamMembers?.map((m, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[9px] font-bold" title={m.username}>
                            {m.username?.[0]?.toUpperCase() ?? '?'}
                          </div>
                        ))}
                        <button 
                          onClick={() => setIsAddMemberModalOpen(true)}
                          className="w-7 h-7 rounded-full border-2 border-slate-900 bg-blue-600/20 text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="px-6 py-3 bg-white text-slate-950 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  <Plus size={16} /> Manage Members
                </button>
              </div>
            </section>
          )}

          {location.pathname === '/team-lead' && (
            <>
              {/* STATS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Active Issues', value: stats.groupIncidents, icon: Activity, color: 'text-white', bg: 'bg-slate-800' },
                  { label: 'Pending Assignment', value: stats.needsResponders, icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: 'Resolved (7d)', value: stats.resolvedThisWeek, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-6 rounded-xl ${stat.bg} border border-slate-800`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* PRIORITY SECTION */}
              {priorityIncidents.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <AlertCircle className="text-amber-500" size={18} />
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Critical: Needs Assignment</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {priorityIncidents.map((incident, i) => {
                        const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : incident.severity === 'low' ? 'P3' : incident.severity;
                        return (
                          <motion.div 
                            key={incident._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 rounded-xl bg-slate-900 border-l-2 border-l-amber-500 border-y border-r border-slate-800 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <span className="px-2 py-0.5 bg-amber-500/5 text-amber-500 border border-amber-500/10 rounded text-[9px] font-bold uppercase tracking-widest">Unassigned</span>
                                <span className="text-[10px] font-mono text-slate-600">{sev}</span>
                              </div>
                              <h3 className="text-base font-bold mb-2 leading-tight">{incident.title}</h3>
                              <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6">{incident.description}</p>
                            </div>
                            <button 
                              onClick={() => { setSelectedIncident(incident); setIsAssignRespondersModalOpen(true); }}
                              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              Assign Responders <ArrowRight size={14} />
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
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Notifications</h2>
              </div>
              <div className="space-y-3">
                {notifications.map((n, i) => (
                  <div key={n._id || i} className={`p-4 rounded-xl border ${n.isRead ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800'} flex items-start gap-4`}>
                    <Bell size={16} className={n.isRead ? 'text-slate-600' : 'text-blue-400'} />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-300">{n.message}</p>
                      <span className="text-[9px] font-bold text-slate-600 uppercase mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(location.pathname === '/team-lead' || location.pathname === '/team-lead/incidents') && (
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold tracking-tight">Incident Log</h2>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                    {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-3 py-1 text-[9px] font-semibold uppercase rounded transition-all ${
                          activeFilter === f ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-500" />
                  <select 
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="All">All Projects</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Incident</th>
                      <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Team</th>
                      <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Last Activity</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredIncidents.map((incident, idx) => {
                      const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : incident.severity === 'low' ? 'P3' : incident.severity;
                      return (
                        <tr key={incident._id} className="group hover:bg-slate-800/30 transition-all">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                sev === 'P1' ? 'bg-red-500' : sev === 'P2' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              <div className="text-xs font-semibold group-hover:text-blue-400 transition-colors">{incident.title}</div>
                            </div>
                            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest ml-4.5">{incident.project?.name}</div>
                          </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-1.5">
                          {(incident.responders || []).slice(0, 3).map((r, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[7px] font-bold" title={r.username}>
                              {r.username?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          ))}
                          {(incident.responders || []).length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-[7px] font-bold">
                              +{(incident.responders || []).length - 3}
                            </div>
                          )}
                          {(incident.responders || []).length === 0 && <span className="text-[9px] text-slate-600 font-medium italic">Assignees</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setOpenStatusMenu(openStatusMenu === incident._id ? null : incident._id)}
                            disabled={updatingStatus === incident._id}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border transition-all ${
                              incident.status === 'open'       ? 'bg-red-500/5 text-red-500 border-red-500/10' :
                              incident.status === 'inProgress' ? 'bg-blue-500/5 text-blue-500 border-blue-500/10' :
                              'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'
                            }`}>
                            {updatingStatus === incident._id
                              ? <RefreshCw size={10} className="animate-spin" />
                              : <>{incident.status} <ChevronDown size={12} /></>}
                          </button>
                          {openStatusMenu === incident._id && incident.status !== 'resolved' && (
                            <div className="absolute top-full left-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                              {[
                                { label: 'Open',        val: 'open' },
                                { label: 'In Progress', val: 'inProgress' },
                                { label: 'Resolved',    val: 'resolved' },
                              ].filter(s => s.val !== incident.status).map(st => (
                                <button
                                  key={st.val}
                                  onClick={() => handleStatusUpdate(incident._id, st.val)}
                                  className="w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                  → {st.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-medium text-slate-500">
                        {new Date(incident.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {incident.status !== 'resolved' && (
                            <button 
                              onClick={() => { setSelectedIncident(incident); setIsAssignRespondersModalOpen(true); }}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-slate-700 transition-all"
                              title="Assign Responders"
                            >
                              <UserPlus size={14} />
                            </button>
                          )}
                          <Link to={`/incident/${incident._id}`} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-600 hover:text-white border border-slate-700 transition-all">
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                        );
                      })}
                  </tbody>
                </table>
                {filteredIncidents.length === 0 && !incidentsLoading && (
                  <div className="py-20 text-center text-slate-600 font-medium italic text-xs">
                    No records found.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

      {/* MODALS */}
      <AnimatePresence>
        {(isAddMemberModalOpen || isAssignRespondersModalOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setIsAddMemberModalOpen(false); setIsAssignRespondersModalOpen(false); setSelectedMembers([]); }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {isAddMemberModalOpen ? 'Manage Team Members' : 'Incident Assignment'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1">
                    {isAddMemberModalOpen ? 'Select responders to add to your team' : `Assign help to: ${selectedIncident?.title}`}
                  </p>
                </div>
                <button onClick={() => { setIsAddMemberModalOpen(false); setIsAssignRespondersModalOpen(false); setSelectedMembers([]); }} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-500">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:border-blue-500 outline-none transition-all" 
                    placeholder="Search directory..." 
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-hide">
                  {(() => {
                    if (isAddMemberModalOpen) {
                      // Correct filter: Exclude current teamLead, Exclude users already in group
                      const assignedUserIds = groups.reduce((acc, g) => {
                        const memberIds = (g.members || []).map(m => m._id || m);
                        const leadId = g.teamLead?._id || g.teamLead;
                        return [...acc, ...memberIds, leadId];
                      }, []);

                      const availableUsers = (allUsers || []).filter(u => 
                        u._id !== user?._id && 
                        !assignedUserIds.includes(u._id)
                      );

                      const filtered = availableUsers.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));

                      if (filtered.length === 0) {
                        return <div className="py-10 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">No users available to add</div>;
                      }

                      return filtered.map(u => (
                        <div 
                          key={u._id} 
                          onClick={() => {
                            if (selectedMembers.includes(u._id)) {
                              setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                            } else {
                              setSelectedMembers([...selectedMembers, u._id]);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedMembers.includes(u._id) ? 'bg-blue-600/5 border-blue-500/30' : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-[9px]">
                              {u.username?.[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-semibold">{u.username}</div>
                              <div className="text-[9px] text-slate-500 uppercase font-bold">{u.role}</div>
                            </div>
                          </div>
                          {selectedMembers.includes(u._id) ? (
                            <div className="w-5 h-5 rounded border border-blue-500 bg-blue-600 flex items-center justify-center">
                              <CheckCircle size={12} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded border border-slate-800 bg-slate-950" />
                          )}
                        </div>
                      ));
                    } else {
                      // Incident Assignment (Show my team members)
                      const myTeam = myGroup?.members || [];
                      const filtered = myTeam.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
                      
                      if (filtered.length === 0) {
                        return <div className="py-10 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">No team members available</div>;
                      }

                      return filtered.map(u => (
                        <div 
                          key={u._id} 
                          onClick={() => {
                            if (selectedMembers.includes(u._id)) {
                              setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                            } else {
                              setSelectedMembers([...selectedMembers, u._id]);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedMembers.includes(u._id) ? 'bg-blue-600/5 border-blue-500/30' : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-[9px]">
                              {u.username?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <div className="text-xs font-semibold">{u.username}</div>
                              <div className="text-[9px] text-slate-500 uppercase font-bold">{u.role}</div>
                            </div>
                          </div>
                          {selectedMembers.includes(u._id) ? (
                            <div className="w-5 h-5 rounded border border-blue-500 bg-blue-600 flex items-center justify-center">
                              <CheckCircle size={12} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded border border-slate-800 bg-slate-950" />
                          )}
                        </div>
                      ));
                    }
                  })()}
                </div>

                <button 
                  disabled={isSubmitting || (isAddMemberModalOpen && selectedMembers.length === 0)}
                  onClick={isAddMemberModalOpen ? handleAddMembers : handleAssignResponders}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : (isAddMemberModalOpen ? 'Add to Team' : 'Save Changes')}
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
