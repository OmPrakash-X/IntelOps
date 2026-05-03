import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Bell, AlertCircle, Plus, ArrowRight, Activity, 
  Clock, CheckCircle, ShieldAlert, Layers, Send, RefreshCw, Info, X
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { fetchProjects } from '../../project/projectSlice';
import { createIncident, getNotifications } from '../../incidents/services/incidents.api';

const BuggerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const { incidents, loading: incidentsLoading } = useSelector(state => state.incidents);
  const { projects, loading: projectsLoading } = useSelector(state => state.projects);
  
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'P3',
    projectId: ''
  });

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
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const severityMap = { 'P1': 'high', 'P2': 'medium', 'P3': 'low' };
      const res = await createIncident({
        ...formData,
        project: formData.projectId,
        severity: severityMap[formData.severity] || 'low'
      });
      setSuccessData(res.data);
      setFormData({ title: '', description: '', severity: 'P3', projectId: '' });
      dispatch(fetchIncidents());
    } catch (err) {
      alert("Failed to report incident: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSuccessData(null);
  };

  const openReportModal = (projId = '') => {
    setFormData(prev => ({ ...prev, projectId: projId }));
    setSuccessData(null);
    setIsModalOpen(true);
  };

  const severityConfig = {
    P1: { label: 'P1 - Critical', badge: 'bg-red-500/10 text-red-500 border-red-500/20', desc: 'Production down' },
    P2: { label: 'P2 - High', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', desc: 'Major issue affecting users' },
    P3: { label: 'P3 - Low', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20', desc: 'Minor issue or degraded performance' },
  };

  const myIncidents = incidents.filter(i => (i.createdBy?._id === user?._id || i.createdBy === user?._id));

  const stats = {
    reportedByMe: myIncidents.length,
    underInvestigation: myIncidents.filter(i => i.status === 'inProgress').length,
    resolved: myIncidents.filter(i => i.status === 'resolved').length,
    thisWeek: myIncidents.filter(i => {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return new Date(i.createdAt) > lastWeek;
    }).length
  };

  const renderDashboard = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Submissions', value: stats.reportedByMe, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'In Progress', value: stats.underInvestigation, icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Last 7 Days', value: stats.thisWeek, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Layers className="text-indigo-500" size={16} />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Available Projects</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((proj, i) => (
            <motion.div key={proj._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <h3 className="text-sm font-semibold mb-1 truncate">{proj.name}</h3>
              <p className="text-slate-500 text-[9px] font-semibold uppercase tracking-widest mb-4">Uptime: 99.9%</p>
              <button onClick={() => openReportModal(proj._id)} className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                Report <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-500" size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Recent History</h2>
          </div>
          <Link to="/bugger/incidents" className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:underline">View All</Link>
        </div>
        {renderIncidentsTable(myIncidents.slice(0, 5))}
      </div>
    </div>
  );

  const renderIncidentsTable = (data) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-800/50">
          <tr>
            <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Severity</th>
            <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Incident</th>
            <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Lead</th>
            <th className="px-6 py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((incident, idx) => {
            const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : incident.severity === 'low' ? 'P3' : incident.severity;
            const conf = severityConfig[sev] || severityConfig.P3;
            return (
              <motion.tr key={incident._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} onClick={() => navigate(`/incident/${incident._id}`)} className="group hover:bg-slate-800/30 transition-all cursor-pointer">
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${conf.badge}`}>{sev}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-semibold text-white mb-0.5">{incident.title}</div>
                  <div className="text-[9px] text-slate-500 font-mono tracking-tighter">#{incident._id?.slice(-8)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1 h-1 rounded-full ${incident.status === 'open' ? 'bg-red-500' : incident.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">{incident.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[9px] font-bold border border-slate-700">
                      {incident.assignedLead?.username?.[0].toUpperCase() || 'U'}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">{incident.assignedLead?.username || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[10px] font-medium text-slate-500">{new Date(incident.createdAt).toLocaleDateString()}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && !incidentsLoading && (
        <div className="py-20 text-center text-slate-500 font-medium italic text-xs">No incidents found.</div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Notifications</h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{notifications.length} Total</span>
      </div>
      <div className="space-y-3">
        {notifications.map((notif, i) => (
          <motion.div key={notif._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`p-5 rounded-xl border ${notif.isRead ? 'bg-slate-900/40 border-slate-800/50 opacity-60' : 'bg-slate-900 border-slate-800 hover:border-slate-700'} transition-all flex items-start gap-4`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.isRead ? 'bg-slate-800 text-slate-600' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
              <Bell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 leading-relaxed mb-2">{notif.message}</p>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleString()}</span>
                {!notif.isRead && <span className="w-1 h-1 rounded-full bg-amber-500"></span>}
              </div>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="py-20 text-center text-slate-500 font-medium italic text-xs">No notifications yet.</div>
        )}
      </div>
    </div>
  );

  const renderReportForm = () => (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20"><Send size={20} /></div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Report Incident</h3>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5 italic text-emerald-500/80">SRE team will be notified instantly and investigation will begin.</p>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Incident Title</label>
          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all placeholder:text-slate-800" placeholder="e.g. Latency spike in payment-gateway" />
          <p className="text-[9px] text-slate-600 font-medium ml-1 flex items-center gap-1"><Info size={10} /> Be specific. Example: Payment API returning 500 errors on checkout</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Severity</label>
            <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all appearance-none">
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Low</option>
            </select>
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.05em] ml-1 leading-relaxed">{severityConfig[formData.severity].desc}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Select affected project</label>
            <select required value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all appearance-none">
              <option value="">Select affected project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-0.5">Description</label>
          <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all h-32 placeholder:text-slate-800 resize-none" placeholder={"What happened?\nWhat is the impact?\nSteps to reproduce?"} />
        </div>
        <div className="space-y-3">
          <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ? <><RefreshCw size={16} className="animate-spin" /> Reporting...</> : 'Submit Incident Report'}
          </button>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">Incident will be routed to the responsible team automatically</p>
        </div>
      </div>
    </form>
  );

  return (
    <div className="space-y-10">
      {location.pathname === '/bugger' && renderDashboard()}
      {location.pathname === '/bugger/report' && (
        <div className="max-w-2xl mx-auto py-10">
          {renderReportForm()}
        </div>
      )}
      {location.pathname === '/bugger/incidents' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <AlertCircle className="text-red-500" size={16} />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">My Incident History</h2>
          </div>
          {renderIncidentsTable(myIncidents)}
        </div>
      )}
      {location.pathname === '/bugger/notifications' && renderNotifications()}
      
      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {successData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20"><CheckCircle size={32} /></div>
                <h3 className="text-xl font-bold text-white mb-2">Incident reported successfully</h3>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 mt-2 mb-8">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mr-2">Tracking ID:</span>
                  <span className="text-sm font-mono text-emerald-400">INC-{successData._id?.slice(-6).toUpperCase()}</span>
                </div>
                <button onClick={closeModal} className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Return to Dashboard</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK REPORT MODAL (if triggered from elsewhere) */}
      <AnimatePresence>
        {isModalOpen && !successData && !location.pathname.includes('/report') && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-lg">
                <div className="absolute right-4 top-4 z-10">
                  <button onClick={closeModal} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                {renderReportForm()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuggerDashboard;
