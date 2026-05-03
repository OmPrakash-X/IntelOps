import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, LogOut, LayoutDashboard, AlertCircle, 
  Clock, Shield, Send, Terminal, 
  MessageSquare, History, Activity, 
  CheckCircle, Zap, ArrowRight, MessageCircle, MoreVertical, Plus
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../auth/authSlice';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { 
  addTimelineUpdate, getNotifications 
} from '../../incidents/services/incidents.api';

const ResponderDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { incidents, loading } = useSelector(state => state.incidents);
  
  const myTasks = incidents.filter(i => 
    (i.responders || []).some(r => (r._id === user?._id || r === user?._id))
  );
  
  const [notifications, setNotifications] = useState([]);
  const [expandingCard, setExpandingCard] = useState(null);
  
  const [updateFormData, setUpdateFormData] = useState({
    message: '',
    type: 'update'
  });

  useEffect(() => {
    dispatch(fetchIncidents());
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSubmitUpdate = async (incidentId) => {
    if (!updateFormData.message.trim()) return;
    try {
      await addTimelineUpdate(incidentId, updateFormData);
      setExpandingCard(null);
      setUpdateFormData({ message: '', type: 'update' });
      dispatch(fetchIncidents());
      // Optional: success toast
    } catch (err) {
      alert("Failed to add update: " + err.message);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="flex h-screen font-['Inter'] bg-slate-950 text-white overflow-hidden">
      
      {/* SIDEBAR */}
      <motion.aside 
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        className="w-[260px] h-full flex flex-col border-r border-slate-800 bg-slate-900 z-50"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950">
              <Zap size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight leading-none">IntelOps</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Responder Console</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: Activity, label: 'Assigned Tasks' },
            { icon: Terminal, label: 'Timeline Feed' },
            { icon: Bell, label: 'Notifications' },
          ].map((item, idx) => (
            <button 
              key={idx}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative group ${
                idx === 0 ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon size={18} className={idx === 0 ? 'text-emerald-400' : ''} />
              {item.label}
              {idx === 0 && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-5 bg-emerald-500 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs border border-slate-600">
                {user?.username?.substring(0,2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user?.username}</span>
                <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest">{user?.role || 'Responder'}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-widest transition-all hover:bg-slate-700/50">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full relative overflow-y-auto z-10 scrollbar-hide pb-20">
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Responder Workspace</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Active Analysis</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock size={14} className="text-slate-500" />
              <span className="text-[10px] font-mono text-slate-400 tabular-nums uppercase">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all relative">
              <Bell size={18} />
              {notifications.some(n => !n.isRead) && <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
          
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Activity className="text-emerald-500" size={16} />
              Assigned Incidents
            </h2>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {myTasks.length} Tasks
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {myTasks.map((incident, i) => (
                <motion.div 
                  key={incident._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {(() => {
                          const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : incident.severity === 'low' ? 'P3' : incident.severity;
                          return (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                              sev === 'P1' ? 'bg-red-500/5 text-red-500 border-red-500/10' :
                              sev === 'P2' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' :
                              'bg-blue-500/5 text-blue-500 border-blue-500/10'
                            }`}>
                              {sev} Priority
                            </span>
                          );
                        })()}
                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} /> {getTimeAgo(incident.createdAt)} ago
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-3 leading-tight">{incident.title}</h3>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
                            <Shield size={12} />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">{incident.project?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
                            <ShieldAlert size={12} />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">{incident.assignedLead?.username || 'Lead'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end justify-between gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          incident.status === 'open' ? 'bg-red-500 animate-pulse' : 
                          incident.status === 'inProgress' ? 'bg-blue-500' : 'bg-emerald-500'
                        }`} />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{incident.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/incident/${incident._id}`}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-semibold uppercase tracking-widest transition-all"
                        >
                          View Logs
                        </Link>
                        <button 
                          onClick={() => setExpandingCard(expandingCard === incident._id ? null : incident._id)}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                          Update <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Timeline Preview */}
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <History size={12} /> Recent Activity
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                        {user?.username?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-400 font-medium">Investigation in progress. Monitoring service metrics.</div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Form */}
                  <AnimatePresence>
                    {expandingCard === incident._id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-slate-800">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[9px] font-semibold uppercase tracking-widest text-emerald-500">Post New Update</h4>
                            <div className="flex gap-1.5">
                              {['update', 'action', 'status'].map(t => (
                                <button 
                                  key={t}
                                  onClick={() => setUpdateFormData({...updateFormData, type: t})}
                                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border transition-all ${
                                    updateFormData.type === t ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-800 border-slate-700 text-slate-500'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea 
                            value={updateFormData.message}
                            onChange={e => setUpdateFormData({...updateFormData, message: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-medium focus:border-emerald-500 outline-none transition-all h-28 placeholder:text-slate-800 resize-none"
                            placeholder="Details of progress or resolution steps..."
                          />
                          <div className="flex justify-end gap-3 mt-4">
                            <button 
                              onClick={() => setExpandingCard(null)}
                              className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white px-2"
                            >
                              Discard
                            </button>
                            <button 
                              onClick={() => handleSubmitUpdate(incident._id)}
                              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95"
                            >
                              Post Log
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {myTasks.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
                <Shield size={32} className="mb-4" />
                <h3 className="text-lg font-bold mb-1">No tasks assigned</h3>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Awaiting mission dispatch...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResponderDashboard;
