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
      alert("Failed to report incident: " + (err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || err.message));
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
    P1: { label: 'P1 - Critical', badge: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40', desc: 'Production down' },
    P2: { label: 'P2 - High', badge: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40', desc: 'Major issue affecting users' },
    P3: { label: 'P3 - Low', badge: 'bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/40', desc: 'Minor issue or degraded performance' },
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
    <div className="space-y-10 font-['Josefin_Sans']">
      
      {/* Header Area */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-6 bg-[#D4AF37]/40" />
          <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">Reporter Dashboard</h2>
        </div>
        <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">Incident Reporting & Tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Submissions', value: stats.reportedByMe, icon: Activity, color: '#D4AF37' },
          { label: 'In Progress', value: stats.underInvestigation, icon: ShieldAlert, color: '#f59e0b' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: '#10b981' },
          { label: 'Last 7 Days', value: stats.thisWeek, icon: Clock, color: '#D4AF37' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} 
            className="relative p-6 bg-[#141414] border border-[#D4AF37]/15 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] group">
            <Corners opacity="opacity-30" />
            <div className="flex items-center justify-center w-9 h-9 mb-4 border bg-opacity-10 rotate-45" style={{ borderColor: `${stat.color}40`, backgroundColor: `${stat.color}10` }}>
              <stat.icon size={16} color={stat.color} className="-rotate-45" />
            </div>
            <div className="text-[9px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1">{stat.label}</div>
            <div className={`font-['Marcellus'] text-3xl ${stat.color === '#D4AF37' ? 'text-[#F2F0E4]' : `text-[${stat.color}]`}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1 border-b border-[#D4AF37]/10 pb-4 mb-4">
          <Layers className="text-[#D4AF37]" size={14} />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Available Projects</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((proj, i) => (
            <motion.div key={proj._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} 
              className="relative p-5 bg-[#141414] border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-all hover:bg-[#D4AF37]/[0.02]">
              <Corners opacity="opacity-20" />
              <h3 className="font-['Marcellus'] text-sm text-[#F2F0E4] mb-1 truncate">{proj.name}</h3>
              <p className="text-[#666] text-[9px] font-bold uppercase tracking-[0.15em] mb-5">
                {!proj.group ? (
                  <span className="text-[#ef4444]">No Squad Assigned</span>
                ) : (
                  'Uptime: 99.9%'
                )}
              </p>
              <button onClick={() => openReportModal(proj._id)} disabled={!proj.group}
                className="w-full py-2.5 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed">
                Report Issue <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-[#D4AF37]/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-[#D4AF37]" size={14} />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Recent History</h2>
          </div>
          <Link to="/bugger/incidents" className="text-[9px] font-bold text-[#888] hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-colors">View All</Link>
        </div>
        {renderIncidentsTable(myIncidents.slice(0, 5))}
      </div>
    </div>
  );

  const renderIncidentsTable = (data) => (
    <div className="relative bg-[#141414] border border-[#D4AF37]/15 overflow-hidden">
      <Corners opacity="opacity-30" />
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="bg-[#D4AF37]/[0.03] border-b border-[#D4AF37]/15">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Severity</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Incident</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Lead</th>
            <th className="px-6 py-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D4AF37]/[0.06]">
          {data.map((incident, idx) => {
            const sev = incident.severity === 'high' ? 'P1' : incident.severity === 'medium' ? 'P2' : incident.severity === 'low' ? 'P3' : incident.severity;
            const conf = severityConfig[sev] || severityConfig.P3;
            const statColor = incident.status === 'resolved' ? '#10b981' : incident.status === 'inProgress' ? '#f59e0b' : '#ef4444';
            
            return (
              <motion.tr key={incident._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} 
                onClick={() => navigate(`/incident/${incident._id}`)} 
                className="group hover:bg-[#D4AF37]/[0.04] transition-all cursor-pointer">
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-none text-[9px] font-bold uppercase tracking-[0.1em] border ${conf.badge}`}>{sev}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-['Marcellus'] text-[15px] text-[#F2F0E4] mb-1 group-hover:text-[#D4AF37] transition-colors">{incident.title}</div>
                  <div className="text-[9px] text-[#666] font-bold uppercase tracking-[0.15em]">#{incident._id?.slice(-8)}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em]" 
                    style={{ border: `1px solid ${statColor}40`, background: `${statColor}15`, color: statColor }}>
                    {incident.status === 'inProgress' ? 'In Progress' : incident.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] rotate-45">
                      <span className="-rotate-45 font-['Marcellus'] text-[11px]">{incident.assignedLead?.username?.[0].toUpperCase() || 'U'}</span>
                    </div>
                    <span className="text-[11px] text-[#F2F0E4] ml-1">{incident.assignedLead?.username || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[10px] text-[#888] tracking-[0.05em]">{new Date(incident.createdAt).toLocaleString()}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && !incidentsLoading && (
        <div className="py-10 text-center text-[#555] text-[10px] uppercase tracking-[0.2em]">No incidents match your criteria</div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6 font-['Josefin_Sans']">
      <div className="flex items-center justify-between px-1 border-b border-[#D4AF37]/10 pb-4 mb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Notifications</h2>
        <span className="text-[9px] font-bold text-[#888] uppercase tracking-[0.2em]">{notifications.length} Total</span>
      </div>
      <div className="space-y-3">
        {notifications.map((notif, i) => (
          <motion.div key={notif._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} 
            className={`p-5 relative border ${notif.isRead ? 'bg-[#141414]/40 border-[#D4AF37]/5 opacity-60' : 'bg-[#141414] border-[#D4AF37]/15 hover:border-[#D4AF37]/30'} transition-all flex items-start gap-4`}>
            {!notif.isRead && <Corners opacity="opacity-40" />}
            <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 border rotate-45 ${notif.isRead ? 'bg-[#0A0A0A] border-[#D4AF37]/10 text-[#666]' : 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'}`}>
              <Bell size={12} className="-rotate-45" />
            </div>
            <div className="flex-1 min-w-0 ml-1">
              <p className="text-xs text-[#F2F0E4] leading-relaxed mb-2">{notif.message}</p>
              <div className="flex items-center gap-3">
                <span className="text-[8px] font-bold text-[#666] uppercase tracking-[0.15em]">{new Date(notif.createdAt).toLocaleString()}</span>
                {!notif.isRead && <span className="w-1.5 h-1.5 bg-[#D4AF37]"></span>}
              </div>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="py-10 text-center text-[#555] text-[10px] uppercase tracking-[0.2em]">No notifications yet.</div>
        )}
      </div>
    </div>
  );

  const renderReportForm = () => (
    <form onSubmit={handleSubmit} className="relative bg-[#141414] border border-[#D4AF37]/30 p-8 shadow-[0_0_40px_rgba(212,175,55,0.1)] font-['Josefin_Sans']">
      <Corners opacity="opacity-100" />
      <div className="flex items-center justify-between mb-8 border-b border-[#D4AF37]/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30 rotate-45"><Send size={16} className="-rotate-45" /></div>
          <div className="ml-2">
            <h3 className="font-['Marcellus'] text-2xl text-[#D4AF37] uppercase tracking-[0.1em]">Report Incident</h3>
            <p className="text-[9px] font-bold text-[#888] uppercase tracking-[0.15em] mt-1">SRE team will be notified instantly.</p>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Incident Title *</label>
          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
            className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[13px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-all placeholder:text-[#444] font-['Josefin_Sans']" 
            placeholder="e.g. Latency spike in payment-gateway" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Severity *</label>
            <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} 
              className="w-full bg-[#0A0A0A] border border-[#D4AF37]/30 px-4 py-3 text-[12px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-all font-['Josefin_Sans']">
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Low</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Affected Project *</label>
            <select required value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} 
              className="w-full bg-[#0A0A0A] border border-[#D4AF37]/30 px-4 py-3 text-[12px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-all font-['Josefin_Sans']">
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p._id} value={p._id} disabled={!p.group}>
                  {p.name} {!p.group ? '(No Squad Assigned)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Description *</label>
          <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
            className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[13px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-all h-32 placeholder:text-[#444] resize-none font-['Josefin_Sans']" 
            placeholder={"What happened?\nWhat is the impact?\nSteps to reproduce?"} />
        </div>
        <div className="space-y-3 pt-4 border-t border-[#D4AF37]/10">
          <button type="submit" disabled={isSubmitting} 
            className="w-full py-4 bg-[#D4AF37] hover:bg-[#F2E8C4] text-[#0A0A0A] font-bold text-[10px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-50">
            {isSubmitting ? <><RefreshCw size={14} className="animate-spin" /> Reporting...</> : 'Submit Incident Report'}
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="space-y-10 font-['Josefin_Sans']">
      {location.pathname === '/bugger' && renderDashboard()}
      {location.pathname === '/bugger/report' && (
        <div className="max-w-2xl mx-auto py-10">
          {renderReportForm()}
        </div>
      )}
      {location.pathname === '/bugger/incidents' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1 border-b border-[#D4AF37]/10 pb-4 mb-4">
            <AlertCircle className="text-[#D4AF37]" size={14} />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">My Incident History</h2>
          </div>
          {renderIncidentsTable(myIncidents)}
        </div>
      )}
      {location.pathname === '/bugger/notifications' && renderNotifications()}
      
      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {successData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="relative w-full max-w-lg bg-[#141414] border border-[#10b981] p-10 text-center flex flex-col items-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <Corners opacity="opacity-100" />
                <div className="w-16 h-16 bg-[#10b981]/10 flex items-center justify-center text-[#10b981] mb-6 border border-[#10b981]/30 rotate-45"><CheckCircle size={24} className="-rotate-45" /></div>
                <h3 className="font-['Marcellus'] text-2xl text-[#10b981] uppercase tracking-[0.1em] mb-2">Report Successful</h3>
                <div className="border border-[#10b981]/30 px-6 py-3 mt-4 mb-8 bg-[#10b981]/5">
                  <span className="text-[9px] font-bold text-[#888] uppercase tracking-[0.2em] mr-3">Tracking ID:</span>
                  <span className="text-sm font-mono text-[#10b981]">INC-{successData._id?.slice(-6).toUpperCase()}</span>
                </div>
                <button onClick={closeModal} className="w-full py-3.5 bg-transparent border border-[#10b981]/50 hover:bg-[#10b981]/10 text-[#10b981] font-bold text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer">Return to Dashboard</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK REPORT MODAL */}
      <AnimatePresence>
        {isModalOpen && !successData && !location.pathname.includes('/report') && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="relative w-full max-w-xl">
                <div className="absolute right-4 top-4 z-10">
                  <button onClick={closeModal} className="p-2 text-[#666] hover:text-[#D4AF37] transition-colors"><X size={16} /></button>
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
