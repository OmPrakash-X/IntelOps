import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Users, Shield, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects } from '../../project/projectSlice';
import { fetchGroups } from '../../groups/groupSlice';

const InfrastructureManagement = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector(s => s.projects);
  const { groups } = useSelector(s => s.groups);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchGroups());
  }, [dispatch]);

  // For each project, find its group
  const enriched = projects.map(p => ({
    ...p,
    group: groups.find(g => g._id === p.group || g._id === p.group?._id),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Projects & Infrastructure</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            All registered projects and their assigned teams
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{projects.length} Active</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse space-y-4">
              <div className="h-5 bg-slate-800 rounded w-1/2" />
              <div className="h-3 bg-slate-800 rounded w-3/4 opacity-50" />
            </div>
          ))}
        </div>
      ) : enriched.length === 0 ? (
        <div className="p-20 text-center bg-slate-900 rounded-3xl border border-slate-800">
          <FolderOpen size={48} className="mx-auto text-slate-700 mb-4" />
          <h3 className="text-lg font-black text-slate-500">No Projects Yet</h3>
          <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest font-bold">Create a project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enriched.map((p, i) => (
            <motion.div key={p._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all group relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[50px] group-hover:bg-indigo-500/10 transition-colors" />

              <div className="flex items-center justify-between mb-6 relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <FolderOpen size={22} />
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle size={13} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                </div>
              </div>

              <h3 className="text-lg font-black mb-1 relative">{p.name}</h3>
              {p.description && (
                <p className="text-xs text-slate-500 font-medium leading-snug mb-5 line-clamp-2">{p.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 relative mt-4">
                <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Shield size={9} /> Team
                  </p>
                  <p className="text-xs font-bold text-white truncate">{p.group?.name || 'Unassigned'}</p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Users size={9} /> Lead
                  </p>
                  <p className="text-xs font-bold text-white truncate">{p.group?.teamLead?.username || '—'}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Created {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default InfrastructureManagement;
