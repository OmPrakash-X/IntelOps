import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Activity, ShieldAlert, AlertTriangle, 
  Terminal, LineChart, CheckCircle, Users, Zap, 
  Sparkles, ShieldCheck, MessageSquare, Plus, FileText,
  Shield,
  ChevronRight, ArrowUpRight, Share2, MoreHorizontal, Send, RefreshCw
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import API from '../../../services/api';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector(state => state.auth);
  const userRole = user?.role?.toLowerCase();
  
  // Check if current user is the TL of the group this incident belongs to
  const isOurGroup = userRole === 'teamlead' && (
    incident?.project?.group === user?.groupId || 
    incident?.project?.groupId === user?.groupId ||
    incident?.project?.group?._id === user?.groupId
  );
  
  const [incident, setIncident] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyingSolution, setIsApplyingSolution] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ message: '', type: 'update' });
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const fetchIncidentDetails = async () => {
    try {
      setLoading(true);
      const [incRes, timeRes] = await Promise.all([
        API.get(`/incidents/${id}`),
        API.get(`/timelines/${id}/timeline`)
      ]);
      setIncident(incRes.data.data);
      setTimeline(timeRes.data.data);
    } catch (err) {
      console.error("Failed to fetch incident:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.message.trim()) return;
    try {
      setSubmittingUpdate(true);
      await API.post(`/timelines/${id}/timeline`, newUpdate);
      setNewUpdate({ message: '', type: 'update' });
      setIsTimelineModalOpen(false);
      fetchIncidentDetails();
    } catch (err) {
      alert("Failed to add update: " + err.message);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleResolve = async () => {
    if (!window.confirm("Are you sure you want to resolve this incident?")) return;
    try {
      await API.patch(`/incidents/${id}/status`, { status: 'resolved' });
      fetchIncidentDetails();
    } catch (err) {
      alert("Failed to resolve incident: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-['Inter']">
        <RefreshCw size={32} className="text-indigo-500 animate-spin mb-4" />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Retrieving Intel...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-['Inter'] p-10 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Incident Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-sm">We couldn't locate the specified record in our system.</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const severityConfig = {
    P1: { label: 'P1 - Critical', badge: 'bg-red-500/10 text-red-500 border-red-500/20', color: 'text-red-500' },
    P2: { label: 'P2 - High', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', color: 'text-amber-500' },
    P3: { label: 'P3 - Low', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20', color: 'text-blue-500' },
  };
  const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : incident.severity === 'low' ? 'P3' : incident.severity;
  const conf = severityConfig[sev] || severityConfig['P3'];

  return (
    <div className="min-h-screen bg-slate-950 font-['Inter'] text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border ${conf.badge}`}>
                  {sev}
                </span>
                <span className="text-[10px] font-mono text-slate-500">#{incident._id?.slice(-8)}</span>
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={12} /> Detected {new Date(incident.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {incident.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* RESOLVE BUTTON: Only Admin or TeamLead of the incident's group */}
            {((userRole === 'admin') || (userRole === 'teamlead' && isOurGroup)) && incident.status !== 'resolved' && (
              <button 
                onClick={handleResolve}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                Resolve
              </button>
            )}
            <button className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Status', value: incident.status, icon: Activity, color: incident.status === 'resolved' ? 'text-emerald-500' : 'text-amber-500', bg: 'bg-slate-900' },
            { label: 'Project', value: incident.project?.name || 'System', icon: Shield, color: 'text-indigo-400', bg: 'bg-slate-900' },
            { label: 'Created By', value: incident.createdBy?.username || 'System', icon: Users, color: 'text-slate-400', bg: 'bg-slate-900' },
            { label: 'Duration', value: getTimeElapsed(incident.createdAt, incident.resolvedAt), icon: Clock, color: 'text-slate-400', bg: 'bg-slate-900' },
          ].map((stat, i) => (
            <div key={i} className={`flex items-center gap-4 p-5 rounded-xl border border-slate-800 ${stat.bg}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-950 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className={`text-sm font-bold uppercase tracking-tight ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Timeline */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-3">
                <Terminal size={20} className="text-slate-500" />
                Investigation Timeline
              </h2>
              {/* ADD LOG: Only Admin or TeamLead of the incident's group */}
              {((userRole === 'admin') || (userRole === 'teamlead' && isOurGroup)) && incident.status !== 'resolved' && (
                <button 
                  onClick={() => setIsTimelineModalOpen(true)}
                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 hover:text-indigo-300 transition-all"
                >
                  <Plus size={14} /> Add Log
                </button>
              )}
            </div>

            <div className="relative pl-6 border-l border-slate-800 space-y-10 ml-3">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[33px] top-0 w-4 h-4 rounded-full border-4 border-slate-950 flex items-center justify-center ${
                    event.type === 'status' ? 'bg-emerald-500' : event.type === 'action' ? 'bg-indigo-500' : 'bg-slate-700'
                  }`} />
                  
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 tabular-nums mb-1 block">
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </span>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800 inline-block max-w-full">
                      {event.message}
                    </p>
                  </div>
                </div>
              ))}
              
              {incident.status !== 'resolved' && (
                <div className="relative pt-4 opacity-30">
                  <div className="absolute -left-[29px] top-4 w-2 h-2 rounded-full bg-slate-700" />
                  <div className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest italic ml-2">Awaiting next update...</div>
                </div>
              )}
            </div>
          </div>

          {/* AI / Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-indigo-600/10 border border-indigo-500/20 p-6">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Sparkles size={16} /> AI Diagnostic Insight
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-indigo-300/50 uppercase tracking-widest">Root Cause Hypothesis</h4>
                  <p className="text-sm font-medium text-indigo-100/90 leading-snug">
                    {incident.aiInsights?.rootCause || "Analyzing logs for potential root cause patterns..."}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-indigo-300/50 uppercase tracking-widest">Remediation Steps</h4>
                  <p className="text-sm font-medium text-indigo-100/90 leading-snug">
                    {incident.aiInsights?.solution || "Calculating optimal recovery sequence based on historical resolution data."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Operational Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all text-xs font-semibold text-slate-300">
                  <span>Export Report</span>
                  <FileText size={14} className="text-slate-500" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all text-xs font-semibold text-slate-300">
                  <span>Notify Stakeholders</span>
                  <Send size={14} className="text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Timeline Modal */}
      <AnimatePresence>
        {isTimelineModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTimelineModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold tracking-tight">Add Timeline Update</h3>
                <button onClick={() => setIsTimelineModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-500">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddUpdate} className="space-y-6">
                <div className="flex gap-2">
                  {['update', 'action', 'status'].map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setNewUpdate({...newUpdate, type: t})}
                      className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                        newUpdate.type === t ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <textarea 
                  required
                  value={newUpdate.message}
                  onChange={e => setNewUpdate({...newUpdate, message: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all h-40 placeholder:text-slate-800 resize-none"
                  placeholder="Provide detailed context on investigation progress..."
                />

                <button 
                  type="submit"
                  disabled={submittingUpdate}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {submittingUpdate ? 'Syncing...' : 'Post Update'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getTimeElapsed(start, end) {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const diff = Math.abs(e - s);
  
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
