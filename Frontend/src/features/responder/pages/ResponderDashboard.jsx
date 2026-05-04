import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity, Clock, Shield, CheckCircle, AlertCircle,
  ChevronRight, Bell, Send, History, RefreshCw, X, Plus, AlertTriangle
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { addTimelineUpdate, getNotifications } from '../../incidents/services/incidents.api';
import { fetchProjects } from '../../project/projectSlice';

function Corners({ opacity = 'opacity-60', color = 'border-[#D4AF37]' }) {
  return (
    <>
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-l-2 ${color} top-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-r-2 ${color} top-1 right-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-l-2 ${color} bottom-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-r-2 ${color} bottom-1 right-1 pointer-events-none ${opacity}`} />
    </>
  );
}

const getTimeAgo = (date) => {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const SEV_LABEL = (sev) => sev === 'high' ? 'P1' : sev === 'medium' ? 'P2' : sev === 'low' ? 'P3' : sev;
const SEV_COLOR = (sev) => sev === 'high' ? '#ef4444' : sev === 'medium' ? '#f59e0b' : '#6366f1';
const STATUS_COLOR = (s) => s === 'resolved' ? '#10b981' : s === 'inProgress' ? '#f59e0b' : '#ef4444';

const ResponderDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector(s => s.auth);
  const { incidents, loading } = useSelector(s => s.incidents);
  const { projects } = useSelector(s => s.projects);

  const [notifications, setNotifications] = useState([]);
  const [expandingCard, setExpandingCard] = useState(null);
  const [updateForm, setUpdateForm] = useState({ message: '', type: 'update' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myUserId = user?._id || user?.id;
  const myTasks = incidents.filter(i =>
    (i.responders || []).some(r => r._id === myUserId || r === myUserId)
  );
  const openCount = myTasks.filter(i => i.status === 'open').length;
  const inProgressCount = myTasks.filter(i => i.status === 'inProgress').length;
  const resolvedCount = myTasks.filter(i => i.status === 'resolved').length;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Determine active view from route
  const path = location.pathname;
  const isNotifications = path.endsWith('/notifications');

  useEffect(() => {
    dispatch(fetchIncidents());
    dispatch(fetchProjects());
    loadNotifications();
  }, [dispatch]);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleSubmitUpdate = async (incidentId) => {
    if (!updateForm.message.trim()) return;
    setIsSubmitting(true);
    try {
      await addTimelineUpdate(incidentId, updateForm);
      setExpandingCard(null);
      setUpdateForm({ message: '', type: 'update' });
      dispatch(fetchIncidents());
    } catch (err) {
      alert('Failed to add update: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = isNotifications ? 'Notifications' : 'My Incidents';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 font-['Josefin_Sans']">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-6 bg-[#D4AF37]/40" />
          <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">{pageTitle}</h2>
        </div>
        <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">
          {isNotifications ? 'Your activity feed' : `Incidents assigned to you · ${user?.username}`}
        </p>
      </div>

      {/* Stats Row — show on dashboard & incidents view */}
      {!isNotifications && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Assigned', value: myTasks.length, icon: Activity, color: '#D4AF37' },
            { label: 'Open', value: openCount, icon: AlertCircle, color: '#ef4444' },
            { label: 'In Progress', value: inProgressCount, icon: Clock, color: '#f59e0b' },
            { label: 'Resolved', value: resolvedCount, icon: CheckCircle, color: '#10b981' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative p-5 bg-[#141414] border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-all">
              <Corners opacity="opacity-30" />
              <div className="flex items-center justify-center w-9 h-9 border rotate-45 mb-4" style={{ borderColor: `${stat.color}40`, backgroundColor: `${stat.color}10` }}>
                <stat.icon size={14} color={stat.color} className="-rotate-45" />
              </div>
              <div className="font-['Marcellus'] text-3xl text-[#F2F0E4] mb-1">{stat.value}</div>
              <div className="text-[9px] font-bold text-[#666] uppercase tracking-[0.2em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── MY INCIDENTS VIEW ── */}
      {!isNotifications && (
        <AnimatePresence mode="wait">
          <motion.div key="incidents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-32 bg-[#141414] border border-[#D4AF37]/10 animate-pulse" />)
            ) : myTasks.length === 0 ? (
              <div className="relative py-20 bg-[#141414] border border-[#D4AF37]/10 flex flex-col items-center justify-center text-center">
                <Corners opacity="opacity-20" />
                <Shield size={28} className="text-[#D4AF37]/20 mb-4" />
                <p className="font-['Marcellus'] text-lg text-[#F2F0E4] mb-1">No Assignments Yet</p>
                <p className="text-[10px] text-[#555] uppercase tracking-[0.2em]">Your team lead will assign incidents to you</p>
              </div>
            ) : (
              myTasks.map((incident) => {
                const sev = SEV_LABEL(incident.severity);
                const sevColor = SEV_COLOR(incident.severity);
                const statColor = STATUS_COLOR(incident.status);
                const isExpanded = expandingCard === incident._id;

                return (
                  <motion.div key={incident._id} layout className="relative bg-[#141414] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 transition-all overflow-hidden">
                    <Corners opacity="opacity-30" />
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-3">
                            <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em] border"
                              style={{ borderColor: `${sevColor}40`, background: `${sevColor}10`, color: sevColor }}>
                              {sev} Priority
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: statColor }}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: statColor }} />
                              {incident.status === 'inProgress' ? 'In Progress' : incident.status}
                            </span>
                            <span className="text-[9px] text-[#555] uppercase tracking-[0.1em]">{getTimeAgo(incident.createdAt)}</span>
                          </div>
                          <h3 className="font-['Marcellus'] text-xl text-[#F2F0E4] mb-2">{incident.title}</h3>
                          <p className="text-[11px] text-[#666] line-clamp-2 leading-relaxed">{incident.description}</p>
                          {incident.project?.name && (
                            <p className="text-[9px] font-bold text-[#D4AF37]/50 uppercase tracking-[0.15em] mt-2">Project: {incident.project.name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/incident/${incident._id}`}
                            className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-[#D4AF37]/10 transition-all">
                            View Detail <ChevronRight size={11} />
                          </Link>
                          {incident.status !== 'resolved' && (
                            <button onClick={() => setExpandingCard(isExpanded ? null : incident._id)}
                              className="flex items-center gap-2 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] border cursor-pointer transition-all"
                              style={{ background: isExpanded ? '#D4AF3720' : 'transparent', borderColor: '#D4AF3740', color: '#D4AF37' }}>
                              {isExpanded ? <><X size={11} /> Cancel</> : <><Send size={11} /> Post Update</>}
                            </button>
                          )}
                        </div>
                      </div>

                      {incident.timeline?.length > 0 && (
                        <div className="pt-4 border-t border-[#D4AF37]/10">
                          <p className="text-[8px] font-bold text-[#555] uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                            <History size={10} /> Last Update
                          </p>
                          <div className="flex items-start gap-3 p-3 bg-[#D4AF37]/[0.03] border border-[#D4AF37]/10">
                            <div className="w-5 h-5 flex items-center justify-center border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] shrink-0">
                              <span className="font-['Marcellus'] text-[9px]">{incident.timeline[incident.timeline.length - 1]?.author?.username?.[0]?.toUpperCase() || '?'}</span>
                            </div>
                            <p className="text-[11px] text-[#888] leading-relaxed line-clamp-2">
                              {incident.timeline[incident.timeline.length - 1]?.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[#D4AF37]/20">
                          <div className="p-6 bg-[#D4AF37]/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Post Timeline Update</p>
                              <div className="flex gap-1.5">
                                {['update', 'action', 'status'].map(t => (
                                  <button key={t} onClick={() => setUpdateForm({ ...updateForm, type: t })}
                                    className="px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] border cursor-pointer transition-all"
                                    style={{ background: updateForm.type === t ? '#D4AF37' : 'transparent', borderColor: updateForm.type === t ? '#D4AF37' : '#D4AF3740', color: updateForm.type === t ? '#0A0A0A' : '#888' }}>
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea value={updateForm.message} onChange={e => setUpdateForm({ ...updateForm, message: e.target.value })}
                              placeholder="Describe your progress, findings, or next action..."
                              className="w-full bg-[#0A0A0A] border border-[#D4AF37]/25 focus:border-[#D4AF37] outline-none p-4 text-[12px] text-[#F2F0E4] font-['Josefin_Sans'] placeholder-[#444] resize-none h-24 transition-colors" />
                            <div className="flex justify-end gap-3 mt-3">
                              <button onClick={() => setExpandingCard(null)} className="px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#666] hover:text-[#D4AF37] bg-transparent border-none cursor-pointer">Discard</button>
                              <button onClick={() => handleSubmitUpdate(incident._id)} disabled={!updateForm.message.trim() || isSubmitting}
                                className="px-5 py-2 bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-bold uppercase tracking-[0.15em] border-none cursor-pointer hover:bg-[#F2E8C4] disabled:opacity-40 flex items-center gap-2">
                                {isSubmitting ? <><RefreshCw size={10} className="animate-spin" /> Posting...</> : <><Send size={10} /> Submit Log</>}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── NOTIFICATIONS VIEW ── */}
      {isNotifications && (
        <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {notifications.length === 0 ? (
            <div className="relative py-20 bg-[#141414] border border-[#D4AF37]/10 flex flex-col items-center justify-center text-center">
              <Corners opacity="opacity-20" />
              <Bell size={28} className="text-[#D4AF37]/20 mb-4" />
              <p className="font-['Marcellus'] text-lg text-[#F2F0E4] mb-1">No Notifications</p>
              <p className="text-[10px] text-[#555] uppercase tracking-[0.2em]">You're all caught up</p>
            </div>
          ) : notifications.map((n, i) => (
            <div key={n._id || i}
              className={`relative p-5 border flex items-start gap-4 ${n.isRead ? 'bg-[#141414]/40 border-[#D4AF37]/5 opacity-60' : 'bg-[#141414] border-[#D4AF37]/20'}`}>
              {!n.isRead && <Corners opacity="opacity-30" />}
              <div className={`flex items-center justify-center w-8 h-8 border rotate-45 shrink-0 ${n.isRead ? 'border-[#D4AF37]/10 text-[#555]' : 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                <Bell size={12} className="-rotate-45" />
              </div>
              <div className="flex-1 ml-1">
                <p className="text-[12px] text-[#F2F0E4] leading-relaxed mb-1">{n.message}</p>
                <span className="text-[8px] font-bold text-[#555] uppercase tracking-[0.2em]">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

    </motion.div>
  );
};

export default ResponderDashboard;
