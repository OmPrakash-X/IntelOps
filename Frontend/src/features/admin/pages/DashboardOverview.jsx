import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, Users, FolderOpen, Shield, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncidents } from '../../incidents/incidentSlice';
import { fetchGroups } from '../../groups/groupSlice';
import { fetchUsers } from '../../users/userSlice';
import { fetchProjects } from '../../project/projectSlice';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
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
    { label: 'Total Incidents', value: incidents.length, icon: Activity,    color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Open',            value: open,             icon: AlertTriangle, color: 'text-red-400',   bg: 'bg-red-400/10' },
    { label: 'In Progress',     value: active,           icon: Clock,        color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Resolved',        value: resolved,         icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Teams',           value: groups.length,   icon: Shield,       color: 'text-blue-400',  bg: 'bg-blue-400/10' },
    { label: 'Members',         value: users.length,    icon: Users,        color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Projects',        value: projects.length, icon: FolderOpen,   color: 'text-cyan-400',  bg: 'bg-cyan-400/10' },
    { label: 'AI Analyses',     value: withAI,          icon: Activity,     color: 'text-pink-400',  bg: 'bg-pink-400/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Command Overview</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Live platform-wide intelligence</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <s.icon className={s.color} size={22} />
            </div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-3xl font-black text-white">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent incidents */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle size={15} className="text-amber-400" /> Recent Incidents
            </h3>
            <Link to="/admin/incidents" className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-slate-800/50">
            {incidents.slice(0, 6).map(inc => (
              <Link key={inc._id} to={`/incident/${inc._id}`}
                className="flex items-center gap-4 px-8 py-4 hover:bg-white/5 transition-colors group">
                <div className={`w-2 h-2 rounded-full shrink-0 ${inc.severity === 'high' ? 'bg-red-500' : inc.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors truncate">{inc.title}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{inc.project?.name || '—'} · {new Date(inc.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase border ${inc.status === 'resolved' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-amber-400 border-amber-500/20 bg-amber-500/5'}`}>
                  {inc.status}
                </span>
              </Link>
            ))}
            {incidents.length === 0 && (
              <p className="px-8 py-12 text-center text-xs text-slate-600">No incidents yet.</p>
            )}
          </div>
        </div>

        {/* Teams overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
              <Shield size={15} className="text-blue-400" /> Teams
            </h3>
            <Link to="/admin/team" className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">Manage</Link>
          </div>
          <div className="divide-y divide-slate-800/50">
            {groups.slice(0, 6).map(g => (
              <div key={g._id} className="flex items-center gap-4 px-8 py-4 hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-sm shrink-0">
                  {g.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{g.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    {g.teamMembers?.length ?? 0} members · Lead: {g.teamLead?.username || 'Unassigned'}
                  </p>
                </div>
              </div>
            ))}
            {groups.length === 0 && (
              <p className="px-8 py-12 text-center text-xs text-slate-600">No teams yet.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
