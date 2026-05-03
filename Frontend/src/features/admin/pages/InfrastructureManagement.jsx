import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Users, Shield, CheckCircle, Plus, X, RefreshCw, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, createProject } from '../../project/projectSlice';
import { fetchGroups } from '../../groups/groupSlice';
import API from '../../../services/api';

function Corners({ opacity = "opacity-60", color = "border-[#D4AF37]" }) {
  return (
    <>
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-l-2 ${color} top-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-t-2 border-r-2 ${color} top-1 right-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-l-2 ${color} bottom-1 left-1 pointer-events-none ${opacity}`} />
      <span aria-hidden className={`absolute w-2 h-2 border-b-2 border-r-2 ${color} bottom-1 right-1 pointer-events-none ${opacity}`} />
    </>
  );
}

const InfrastructureManagement = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector(s => s.projects);
  const { groups } = useSelector(s => s.groups);

  const [modal, setModal]       = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null); // the project being edited/deleted
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm] = useState({ name: '', description: '', groupId: '' });

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchGroups());
  }, [dispatch]);

  const enriched = projects.map(p => ({
    ...p,
    group: groups.find(g => g._id === (p.group?._id || p.group)),
  }));

  const openCreate = () => {
    setSelected(null); setError(''); setForm({ name: '', description: '', groupId: '' }); setModal('create');
  };

  const openEdit = (p) => {
    setSelected(p); setError('');
    setForm({ name: p.name, description: p.description || '', groupId: p.group?._id || p.group || '' });
    setModal('edit');
  };

  const openDelete = (p) => { setSelected(p); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setError('');
    try {
      setSubmitting(true);
      const payload = { name: form.name.trim(), description: form.description.trim() };
      if (form.groupId) payload.groupId = form.groupId;
      const res = await dispatch(createProject(payload));
      if (res.error) { setError(res.payload || 'Failed to create project.'); return; }
      closeModal(); dispatch(fetchProjects());
    } catch (err) { setError(err.message || 'Failed.'); } finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setError('');
    try {
      setSubmitting(true);
      const payload = { name: form.name.trim(), description: form.description.trim() };
      if (form.groupId) payload.groupId = form.groupId;
      await API.patch(`/projects/${selected._id}`, payload);
      closeModal(); dispatch(fetchProjects());
    } catch (err) { setError(err.response?.data?.message || err.message || 'Failed.'); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await API.delete(`/projects/${selected._id}`);
      closeModal(); dispatch(fetchProjects());
    } catch (err) { setError(err.response?.data?.message || err.message || 'Failed.'); } finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 font-['Josefin_Sans']">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-6 bg-[#D4AF37]/40" />
            <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">Projects & Infrastructure</h2>
          </div>
          <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">{projects.length} project{projects.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 border border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{projects.length} Active</span>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#F2E8C4] transition-all cursor-pointer">
            <Plus size={13} /> New Project
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="relative p-8 bg-[#141414] border border-[#D4AF37]/15 animate-pulse space-y-4">
              <div className="h-5 bg-[#D4AF37]/10 w-1/2" />
              <div className="h-3 bg-[#D4AF37]/10 w-3/4 opacity-50" />
            </div>
          ))}
        </div>
      ) : enriched.length === 0 ? (
        <div className="relative p-20 text-center bg-[#141414] border border-[#D4AF37]/15">
          <Corners opacity="opacity-30" />
          <FolderOpen size={40} className="mx-auto text-[#333] mb-4" />
          <h3 className="font-['Marcellus'] text-xl text-[#555] uppercase tracking-[0.1em] mb-2">No Projects Yet</h3>
          <p className="text-[#444] text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Create your first project to get started</p>
          <button onClick={openCreate} className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[10px] uppercase tracking-[0.2em] cursor-pointer hover:bg-[#F2E8C4]">+ New Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enriched.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative p-8 bg-[#141414] border border-[#D4AF37]/15 hover:border-[#D4AF37]/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
              <Corners opacity="opacity-30" />
              
              {/* No-group warning */}
              {!p.group && (
                <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-[8px] font-bold uppercase tracking-[0.1em]">
                  <AlertTriangle size={10} /> No squad assigned — incidents cannot be reported
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-10 h-10 border border-[#D4AF37]/30 text-[#D4AF37] rotate-45 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0A] transition-colors">
                  <FolderOpen size={16} className="-rotate-45" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(p)} title="Edit"
                    className="p-1.5 bg-transparent border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all cursor-pointer">
                    <Pencil size={11} />
                  </button>
                  <button onClick={() => openDelete(p)} title="Delete"
                    className="p-1.5 bg-transparent border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444] hover:text-[#0A0A0A] transition-all cursor-pointer">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <h3 className="font-['Marcellus'] text-xl text-[#F2F0E4] mb-1 group-hover:text-[#D4AF37] transition-colors">{p.name}</h3>
              {p.description && <p className="text-[11px] text-[#888] leading-snug mb-6 line-clamp-2">{p.description}</p>}

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="p-3 bg-[#D4AF37]/[0.04] border border-[#D4AF37]/12">
                  <p className="text-[8px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1 flex items-center gap-1"><Shield size={9} /> Team</p>
                  <p className="text-[11px] font-bold text-[#F2F0E4] truncate">{p.group?.name || 'Unassigned'}</p>
                </div>
                <div className="p-3 bg-[#D4AF37]/[0.04] border border-[#D4AF37]/12">
                  <p className="text-[8px] font-bold text-[#666] uppercase tracking-[0.2em] mb-1 flex items-center gap-1"><Users size={9} /> Lead</p>
                  <p className="text-[11px] font-bold text-[#F2F0E4] truncate">{p.group?.teamLead?.username || '—'}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#D4AF37]/10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <p className="text-[8px] font-bold text-[#666] uppercase tracking-[0.2em]">Created {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2)] p-10">
              <Corners opacity="opacity-100" />
              <div className="flex items-center justify-between mb-8 border-b border-[#D4AF37]/20 pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-9 h-9 border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] rotate-45">
                    <FolderOpen size={14} className="-rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-['Marcellus'] text-2xl text-[#D4AF37] uppercase">{modal === 'create' ? 'New Project' : 'Edit Project'}</h3>
                    <p className="text-[9px] text-[#888] uppercase tracking-[0.15em] mt-0.5">{modal === 'create' ? 'Register a new infrastructure project' : `Editing: ${selected?.name}`}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="bg-transparent border-none text-[#666] hover:text-[#D4AF37] cursor-pointer"><X size={16} /></button>
              </div>

              <form onSubmit={modal === 'create' ? handleCreate : handleEdit} className="space-y-5">
                {error && <div className="px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-[11px] font-bold">{error}</div>}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Project Name *</label>
                  <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Payment Gateway, Auth Service…"
                    className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[13px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors font-['Josefin_Sans'] placeholder-[#444]" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description…"
                    className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[13px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors resize-none font-['Josefin_Sans'] placeholder-[#444]" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Assign to Squad</label>
                  <select value={form.groupId} onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}
                    className="w-full bg-[#0A0A0A] border border-[#D4AF37]/30 px-4 py-3 text-[12px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors appearance-none font-['Josefin_Sans']">
                    <option value="">No squad assigned</option>
                    {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#D4AF37]/10">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-3 bg-transparent border border-[#D4AF37]/30 text-[#888] hover:text-[#D4AF37] hover:border-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#F2E8C4] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><RefreshCw size={12} className="animate-spin" /> Saving…</> : modal === 'create' ? '+ Create Project' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal === 'delete' && selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#ef4444] shadow-[0_0_40px_rgba(239,68,68,0.2)] p-10 text-center">
              <Corners opacity="opacity-100" color="border-[#ef4444]" />
              <div className="flex items-center justify-center w-12 h-12 border border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444] rotate-45 mx-auto mb-6">
                <Trash2 size={18} className="-rotate-45" />
              </div>
              <h3 className="font-['Marcellus'] text-2xl text-[#ef4444] uppercase mb-2">Delete Project</h3>
              <p className="text-[#888] text-[12px] mb-1">Are you sure you want to delete</p>
              <p className="font-['Marcellus'] text-lg text-[#F2F0E4] mb-6">"{selected.name}"?</p>
              <p className="text-[#666] text-[10px] uppercase tracking-[0.1em] mb-8">This action cannot be undone. Existing incidents will remain.</p>
              {error && <div className="mb-4 px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-[11px] font-bold">{error}</div>}
              <div className="flex items-center gap-3">
                <button onClick={closeModal}
                  className="flex-1 py-3 bg-transparent border border-[#D4AF37]/30 text-[#888] hover:text-[#D4AF37] hover:border-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer">Cancel</button>
                <button onClick={handleDelete} disabled={submitting}
                  className="flex-1 py-3 bg-[#ef4444] text-[#0A0A0A] border-none font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#f87171] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><RefreshCw size={12} className="animate-spin" /> Deleting…</> : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InfrastructureManagement;
