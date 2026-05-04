import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, Users, FolderOpen, Shield, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { fetchGroups } from '../../groups/groupSlice';
import { fetchUsers } from '../../users/userSlice';
import { fetchProjects } from '../../project/projectSlice';
import { Link } from 'react-router-dom';

/* ── Corner bracket decoration ── */
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

export default function DashboardOverview() {
  const dispatch = useDispatch();
  const { incidents } = useSelector(s => s.incidents);
  const { groups }    = useSelector(s => s.groups);
  const { users }     = useSelector(s => s.users);
  const { projects }  = useSelector(s => s.projects);

  useEffect(() => {
    dispatch(fetchIncidents());
    dispatch(fetchGroups());
    dispatch(fetchUsers());
    dispatch(fetchProjects());
  }, [dispatch]);

  const open     = incidents.filter(i => i.status === 'open').length;
  const active   = incidents.filter(i => i.status === 'inProgress').length;
  const resolved = incidents.filter(i => i.status === 'resolved').length;
  const withAI   = incidents.filter(i => i.aiSuggestions?.nextAction).length;

  const stats = [
    { label: 'Total Incidents', value: incidents.length, icon: Activity,    color: '#D4AF37' },
    { label: 'Open',            value: open,             icon: AlertTriangle, color: '#ef4444' },
    { label: 'In Progress',     value: active,           icon: Clock,         color: '#f59e0b' },
    { label: 'Resolved',        value: resolved,         icon: CheckCircle,   color: '#10b981' },
    { label: 'Teams',           value: groups.length,    icon: Shield,        color: '#D4AF37' },
    { label: 'Members',         value: users.length,     icon: Users,         color: '#D4AF37' },
    { label: 'Projects',        value: projects.length,  icon: FolderOpen,    color: '#D4AF37' },
    { label: 'AI Analyses',     value: withAI,           icon: Activity,      color: '#D4AF37' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 font-['Josefin_Sans']">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-6 bg-[#D4AF37]/40" />
          <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">Command Overview</h2>
        </div>
        <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">Live platform-wide intelligence</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="relative p-6 bg-[#141414] border border-[#D4AF37]/15 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] group">
            <Corners opacity="opacity-30" />
            <div className="flex items-center justify-center w-9 h-9 mb-4 border bg-opacity-10 rotate-45" style={{ borderColor: `${s.color}40`, backgroundColor: `${s.color}10` }}>
              <s.icon color={s.color} size={16} className="-rotate-45" />
            </div>
            <p className="text-[#666] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <h3 className={`font-['Marcellus'] text-3xl ${s.color === '#D4AF37' ? 'text-[#F2F0E4]' : `text-[${s.color}]`}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent incidents */}
        <div className="relative bg-[#141414] border border-[#D4AF37]/15">
          <Corners opacity="opacity-30" />
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/10">
            <h3 className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              <AlertTriangle size={14} color="#D4AF37" /> Recent Incidents
            </h3>
            <Link to="/admin/incidents" className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888] hover:text-[#D4AF37] transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-[#D4AF37]/[0.06]">
            {incidents.slice(0, 6).map(inc => {
              const sev = inc.severity === 'high' ? 'P1' : inc.severity === 'medium' ? 'P2' : 'P3';
              const sevColor = sev==='P1' ? '#ef4444' : sev==='P2' ? '#f59e0b' : '#6366f1';
              return (
                <Link key={inc._id} to={`/incident/${inc._id}`} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#D4AF37]/[0.04] group">
                  <div className={`shrink-0 w-2 h-2 rounded-full`} style={{ background: sevColor, boxShadow: sev === 'P1' ? `0 0 8px ${sevColor}` : '' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-['Marcellus'] text-sm text-[#F2F0E4] mb-0.5 truncate group-hover:text-[#D4AF37] transition-colors">{inc.title}</p>
                    <p className="text-[9px] text-[#666] font-bold uppercase tracking-[0.15em]">{inc.project?.name || '—'} · {new Date(inc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-[0.1em] border"
                    style={{
                      color: inc.status === 'resolved' ? '#10b981' : '#f59e0b',
                      borderColor: inc.status === 'resolved' ? '#10b98140' : '#f59e0b40',
                      backgroundColor: inc.status === 'resolved' ? '#10b98110' : '#f59e0b10'
                    }}>
                    {inc.status}
                  </span>
                </Link>
              );
            })}
            {incidents.length === 0 && <p className="px-6 py-10 text-center text-[10px] text-[#555] uppercase tracking-[0.2em]">No incidents yet.</p>}
          </div>
        </div>

        {/* Teams overview */}
        <div className="relative bg-[#141414] border border-[#D4AF37]/15">
          <Corners opacity="opacity-30" />
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/10">
            <h3 className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              <Shield size={14} color="#D4AF37" /> Teams
            </h3>
            <Link to="/admin/team" className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888] hover:text-[#D4AF37] transition-colors">Manage</Link>
          </div>
          <div className="divide-y divide-[#D4AF37]/[0.06]">
            {groups.slice(0, 6).map(g => (
              <div key={g._id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#D4AF37]/[0.04]">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 border border-[#D4AF37]/30 text-[#D4AF37] rotate-45">
                  <span className="-rotate-45 font-['Marcellus'] text-sm">{g.name?.[0]?.toUpperCase() ?? '?'}</span>
                </div>
                <div className="flex-1 min-w-0 pl-2">
                  <p className="font-['Marcellus'] text-sm text-[#F2F0E4] mb-0.5 truncate">{g.name}</p>
                  <p className="text-[9px] text-[#666] font-bold uppercase tracking-[0.15em]">
                    {g.members?.length ?? 0} members · Lead: {g.teamLead?.username || 'Unassigned'}
                  </p>
                </div>
              </div>
            ))}
            {groups.length === 0 && <p className="px-6 py-10 text-center text-[10px] text-[#555] uppercase tracking-[0.2em]">No teams yet.</p>}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
