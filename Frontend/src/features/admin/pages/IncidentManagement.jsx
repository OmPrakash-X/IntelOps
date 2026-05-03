import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Filter, Search, ChevronRight, Clock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchIncidents } from '../../incidents/incidentSlice';

const IncidentManagement = () => {
  const dispatch = useDispatch();
  const { incidents, loading } = useSelector((state) => state.incidents);

  React.useEffect(() => {
    dispatch(fetchIncidents());
  }, [dispatch]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredIncidents = incidents.filter(i => {
    const matchesFilter = filter === 'all' ? true : i.status === filter;
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight">Incidents</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:border-indigo-500 outline-none transition-all w-64"
            />
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['all', 'active', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Incident</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Severity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Created</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-8 py-4"><div className="h-4 bg-slate-800 rounded w-full opacity-20" /></td>
                  </tr>
                ))
              ) : filteredIncidents.map((inc) => (
                <tr key={inc._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <h4 className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{inc.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{inc.project?.name || 'Global System'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${inc.severity === 'P1' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${inc.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 text-[10px] font-bold">
                        {(inc.assignedLead?.username || '?').charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-300">{inc.assignedLead?.username || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{new Date(inc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link to={`/incident/${inc._id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors inline-block">
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredIncidents.length === 0 && (
            <div className="p-20 text-center">
              <AlertTriangle className="mx-auto text-slate-700 mb-4" size={48} />
              <h3 className="text-lg font-black text-slate-500">No Incidents Found</h3>
              <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest font-bold">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default IncidentManagement;
