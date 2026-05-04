import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LayoutGrid, Plus, Search, Key, X, Shield, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, createUser } from '../../users/userSlice';
import { fetchGroups, createGroup, updateGroup, deleteGroup } from '../../groups/groupSlice';
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

const TeamManagement = () => {
  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { groups, loading: groupsLoading } = useSelector((state) => state.groups);
  const [activeTab, setActiveTab] = useState('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [isUserModalOpen,       setIsUserModalOpen]       = useState(false);
  const [isGroupModalOpen,      setIsGroupModalOpen]      = useState(false);
  const [isAssignLeadModalOpen, setIsAssignLeadModalOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [isRenameModalOpen,     setIsRenameModalOpen]     = useState(false);
  const [isDeleteGroupModal,    setIsDeleteGroupModal]    = useState(false);
  const [targetGroup,           setTargetGroup]           = useState(null);
  const [renameValue,           setRenameValue]           = useState('');
  const [selectedGroupId,       setSelectedGroupId]       = useState(null);
  const [selectedLeadId,        setSelectedLeadId]        = useState('');
  const [selectedMembers,       setSelectedMembers]       = useState([]);
  const [isAssignUserSquadOpen, setIsAssignUserSquadOpen] = useState(false);
  const [targetUser,            setTargetUser]            = useState(null);
  const [assignSquadId,         setAssignSquadId]         = useState('');
  const [isSubmitting,          setIsSubmitting]          = useState(false);

  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'teamMember', groupId: '' });
  const [newGroup, setNewGroup] = useState({ name: '' });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchGroups());
  }, [dispatch]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getUserGroupName = (u) => {
    if (u.group?.name) return u.group.name;
    const userId = u._id;
    const group = groups.find(g => 
      (g.teamLead?._id === userId || g.teamLead === userId) || 
      (g.members || []).some(m => (m._id === userId || m === userId))
    );
    return group ? group.name : 'Unassigned';
  };

  const getGroupProjectName = (projectData) => {
    if (!projectData) return 'Unassigned';
    if (projectData.name) return projectData.name;
    return 'Assigned';
  };

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    try {
      const res = await dispatch(createUser(newUser));
      if (res.error) alert(res.payload || "Failed to create user");
      else {
        setIsUserModalOpen(false);
        setNewUser({ username: '', email: '', password: '', role: 'teamMember', groupId: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGroup = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(createGroup(newGroup));
      setIsGroupModalOpen(false);
      setNewGroup({ name: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignLead = async () => {
    setIsSubmitting(true);
    try {
      await API.patch(`/groups/${selectedGroupId}/assign-lead`, { teamLeadId: selectedLeadId });
      setIsAssignLeadModalOpen(false);
      dispatch(fetchGroups());
      dispatch(fetchUsers());
    } catch (err) {
      alert("Failed to assign lead: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageMembers = async () => {
    setIsSubmitting(true);
    try {
      await API.patch(`/groups/${targetGroup._id}/members`, { members: selectedMembers });
      setIsManageMembersModalOpen(false);
      setTargetGroup(null);
      setSelectedMembers([]);
      dispatch(fetchGroups());
      dispatch(fetchUsers());
    } catch (err) {
      alert("Failed to assign members: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignUserToSquad = async () => {
    if (!targetUser || !assignSquadId) return;
    setIsSubmitting(true);
    try {
      await API.patch(`/groups/${assignSquadId}/members`, { members: [targetUser._id] });
      setIsAssignUserSquadOpen(false);
      setTargetUser(null);
      setAssignSquadId('');
      dispatch(fetchGroups());
      dispatch(fetchUsers());
    } catch (err) {
      alert('Failed to assign to squad: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenameGroup = async () => {
    if (!renameValue.trim()) return;
    setIsSubmitting(true);
    try {
      await dispatch(updateGroup({ id: targetGroup._id, data: { name: renameValue.trim() } }));
      setIsRenameModalOpen(false);
      setTargetGroup(null);
      setRenameValue('');
    } catch (err) {
      alert("Failed to rename: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteGroup(targetGroup._id));
      setIsDeleteGroupModal(false);
      setTargetGroup(null);
      dispatch(fetchUsers()); // refresh users since they get unlinked
    } catch (err) {
      alert("Failed to delete: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 font-['Josefin_Sans']">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-6 bg-[#D4AF37]/40" />
            <h2 className="font-['Marcellus'] text-2xl text-[#F2F0E4] uppercase tracking-[0.1em]">Organization</h2>
          </div>
          <p className="text-[#888] text-[10px] font-bold uppercase tracking-[0.2em]">User & Team Administration</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#141414] border border-[#D4AF37]/25 p-0.5">
            <button onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer border-none ${activeTab === 'users' ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-transparent text-[#666] hover:text-[#D4AF37]'}`}>
              <Users size={12} /> Personnel
            </button>
            <button onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] transition-all cursor-pointer border-none ${activeTab === 'groups' ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-transparent text-[#666] hover:text-[#D4AF37]'}`}>
              <LayoutGrid size={12} /> Squads
            </button>
          </div>
          
          <button onClick={() => activeTab === 'users' ? setIsUserModalOpen(true) : setIsGroupModalOpen(true)}
            className="px-5 py-2.5 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#F2E8C4] transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Plus size={12} /> {activeTab === 'users' ? 'New User' : 'New Squad'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div key="users" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
            
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={14} />
                <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[#141414] border border-[#D4AF37]/25 pl-9 pr-4 py-2 text-[11px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors font-['Josefin_Sans'] placeholder-[#444]" />
              </div>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#141414] border border-[#D4AF37]/25 px-4 py-2 text-[10px] uppercase tracking-[0.1em] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors appearance-none font-['Josefin_Sans']">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teamLead">Team Lead</option>
                <option value="bugger">Bugger</option>
                <option value="teamMember">Member</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="relative bg-[#141414] border border-[#D4AF37]/15 overflow-visible min-h-[400px]">
              <Corners opacity="opacity-40" />
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-[#D4AF37]/[0.03] border-b border-[#D4AF37]/15">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Profile</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Role</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Squad</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Status</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] text-right">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/[0.06]">
                    {filteredUsers.map(user => (
                      <tr key={user._id} className="transition-colors group hover:bg-[#D4AF37]/[0.04]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 border border-[#D4AF37]/30 text-[#D4AF37] rotate-45 shrink-0 bg-[#D4AF37]/10">
                              <span className="-rotate-45 font-['Marcellus'] text-sm">{user.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <h4 className="font-['Marcellus'] text-sm text-[#F2F0E4] mb-0.5 group-hover:text-[#D4AF37] transition-colors">{user.username}</h4>
                              <p className="text-[9px] text-[#666] font-bold tracking-[0.1em]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] border"
                            style={{ 
                              borderColor: user.role === 'admin' ? '#ef444440' : user.role === 'teamLead' ? '#f59e0b40' : '#D4AF3740', 
                              backgroundColor: user.role === 'admin' ? '#ef444410' : user.role === 'teamLead' ? '#f59e0b10' : '#D4AF3710',
                              color: user.role === 'admin' ? '#ef4444' : user.role === 'teamLead' ? '#f59e0b' : '#D4AF37'
                            }}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getUserGroupName(user) !== 'Unassigned' ? (
                            <span className="text-[10px] font-bold text-[#888] uppercase tracking-[0.1em]">{getUserGroupName(user)}</span>
                          ) : (
                            <button
                              onClick={() => { setTargetUser(user); setAssignSquadId(''); setIsAssignUserSquadOpen(true); }}
                              className="px-2 py-1 bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-bold uppercase tracking-[0.1em] hover:bg-[#D4AF37]/20 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Plus size={9} /> Assign Squad
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#10b981]">Active</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 bg-transparent border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all cursor-pointer">
                            <Key size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-[10px] text-[#555] uppercase tracking-[0.2em]">No personnel found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="groups" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div key={group._id} className="relative p-8 bg-[#141414] border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-all group hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <Corners opacity="opacity-30" />
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center justify-center w-10 h-10 border border-[#D4AF37]/30 text-[#D4AF37] rotate-45 bg-[#D4AF37]/10 group-hover:bg-[#D4AF37] group-hover:text-[#0A0A0A] transition-colors">
                    <LayoutGrid size={16} className="-rotate-45" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setTargetGroup(group); setRenameValue(group.name); setIsRenameModalOpen(true); }} title="Rename"
                      className="p-1.5 bg-transparent border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all cursor-pointer">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => { setSelectedGroupId(group._id); setSelectedLeadId(group.teamLead?._id || group.teamLead || ''); setIsAssignLeadModalOpen(true); }}
                      className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] hover:text-[#F2F0E4] bg-transparent border border-[#D4AF37]/20 px-2 py-1.5 cursor-pointer transition-colors">
                      Lead
                    </button>
                    <button onClick={() => { setTargetGroup(group); setIsDeleteGroupModal(true); }} title="Delete"
                      className="p-1.5 bg-transparent border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444] hover:text-[#0A0A0A] transition-all cursor-pointer">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <h3 className="font-['Marcellus'] text-xl text-[#F2F0E4] mb-1 truncate">{group.name}</h3>
                <p className="text-[#666] text-[9px] font-bold uppercase tracking-[0.15em] mb-6 truncate">Project: {getGroupProjectName(group.project)}</p>
                
                <div className="space-y-4 pt-6 border-t border-[#D4AF37]/10">
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] font-bold text-[#888] uppercase tracking-[0.2em]">Squad Lead</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5 border border-[#D4AF37]/30 text-[#D4AF37] rotate-45 bg-[#D4AF37]/5">
                        <span className="-rotate-45 font-['Marcellus'] text-[9px]">{(group.teamLead?.username || '?').charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#F2F0E4] uppercase tracking-[0.1em]">{group.teamLead?.username || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] font-bold text-[#888] uppercase tracking-[0.2em]">Active Members</p>
                    <div className="flex items-center gap-2">
                      <span className="font-['Marcellus'] text-sm text-[#D4AF37]">{(group.members || []).length}</span>
                      <button onClick={() => { setTargetGroup(group); setSelectedMembers((group.members || []).map(m => m._id || m)); setIsManageMembersModalOpen(true); }} title="Manage Members"
                        className="w-5 h-5 flex items-center justify-center border border-[#D4AF37]/40 bg-[#D4AF37]/5 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all cursor-pointer">
                        <Users size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {groups.length === 0 && (
              <div className="col-span-full py-12 text-center text-[10px] text-[#555] uppercase tracking-[0.2em]">No squads available</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modals --- */}
      <AnimatePresence>
        {(isUserModalOpen || isGroupModalOpen || isAssignLeadModalOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2)] p-10">
              <Corners opacity="opacity-100" />
              
              <div className="flex items-center justify-between mb-8 border-b border-[#D4AF37]/20 pb-6">
                <h3 className="font-['Marcellus'] text-2xl text-[#D4AF37] uppercase tracking-[0.1em]">
                  {isUserModalOpen ? 'Create Personnel' : isGroupModalOpen ? 'Establish Squad' : 'Appoint Lead'}
                </h3>
                <button onClick={() => { setIsUserModalOpen(false); setIsGroupModalOpen(false); setIsAssignLeadModalOpen(false); }}
                  className="bg-transparent border-none text-[#666] hover:text-[#D4AF37] cursor-pointer"><X size={16} /></button>
              </div>

              <div className="space-y-6">
                {isUserModalOpen && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Username</label>
                        <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[12px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors font-['Josefin_Sans']" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Clearance Level</label>
                        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-[#D4AF37]/30 px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors appearance-none font-['Josefin_Sans']">
                          <option value="admin">Admin</option>
                          <option value="teamLead">Team Lead</option>
                          <option value="bugger">Bugger</option>
                          <option value="teamMember">Member</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Email Directive</label>
                      <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[12px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors font-['Josefin_Sans']" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Initial Passkey</label>
                      <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[12px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors font-['Josefin_Sans']" />
                    </div>
                  </>
                )}

                {isGroupModalOpen && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Squad Designation</label>
                    <input type="text" placeholder="e.g. Core Infrastructure" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[12px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors font-['Josefin_Sans'] placeholder-[#444]" />
                  </div>
                )}

                {isAssignLeadModalOpen && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Select Squad Lead</label>
                    <select className="w-full bg-[#0A0A0A] border border-[#D4AF37]/30 px-4 py-3 text-[11px] text-[#F2F0E4] uppercase tracking-[0.1em] focus:border-[#D4AF37] outline-none transition-colors appearance-none font-['Josefin_Sans']"
                      value={selectedLeadId} onChange={(e) => setSelectedLeadId(e.target.value)}>
                      <option value="">Awaiting Appointment...</option>
                      {users.filter(u => u.role === 'teamLead').map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t border-[#D4AF37]/20">
                  <button disabled={isSubmitting} onClick={() => { if (isUserModalOpen) handleCreateUser(); else if (isGroupModalOpen) handleCreateGroup(); else handleAssignLead(); }}
                    className={`w-full py-4 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer ${isSubmitting ? 'opacity-50' : 'hover:bg-[#F2E8C4]'}`}>
                    {isSubmitting ? 'Processing...' : 'Authorize Action'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Group Modal */}
      <AnimatePresence>
        {isRenameModalOpen && targetGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2)] p-10">
              <Corners opacity="opacity-100" />
              <div className="flex items-center justify-between mb-6 border-b border-[#D4AF37]/20 pb-4">
                <h3 className="font-['Marcellus'] text-2xl text-[#D4AF37] uppercase">Rename Squad</h3>
                <button onClick={() => setIsRenameModalOpen(false)} className="bg-transparent border-none text-[#666] hover:text-[#D4AF37] cursor-pointer"><X size={16} /></button>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">New Squad Name</label>
                  <input type="text" value={renameValue} onChange={e => setRenameValue(e.target.value)}
                    className="w-full bg-transparent border border-[#D4AF37]/30 px-4 py-3 text-[13px] text-[#F2F0E4] focus:border-[#D4AF37] outline-none transition-colors font-['Josefin_Sans']" />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#D4AF37]/10">
                  <button onClick={() => setIsRenameModalOpen(false)}
                    className="flex-1 py-3 bg-transparent border border-[#D4AF37]/30 text-[#888] hover:text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer">Cancel</button>
                  <button onClick={handleRenameGroup} disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#F2E8C4] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                    {isSubmitting ? <><RefreshCw size={11} className="animate-spin" /> Saving…</> : 'Save Name'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Group Modal */}
      <AnimatePresence>
        {isDeleteGroupModal && targetGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#ef4444] shadow-[0_0_40px_rgba(239,68,68,0.2)] p-10 text-center">
              <Corners opacity="opacity-100" color="border-[#ef4444]" />
              <div className="flex items-center justify-center w-12 h-12 border border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444] rotate-45 mx-auto mb-6">
                <Trash2 size={18} className="-rotate-45" />
              </div>
              <h3 className="font-['Marcellus'] text-2xl text-[#ef4444] uppercase mb-2">Disband Squad</h3>
              <p className="text-[#888] text-[12px] mb-1">Disbanding squad</p>
              <p className="font-['Marcellus'] text-lg text-[#F2F0E4] mb-3">"{targetGroup.name}"</p>
              <p className="text-[#666] text-[10px] uppercase tracking-[0.1em] mb-8">All members will be unlinked. Incidents remain intact.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsDeleteGroupModal(false)}
                  className="flex-1 py-3 bg-transparent border border-[#D4AF37]/30 text-[#888] hover:text-[#D4AF37] hover:border-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer">Cancel</button>
                <button onClick={handleDeleteGroup} disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#ef4444] text-[#0A0A0A] border-none font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#f87171] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                  {isSubmitting ? <><RefreshCw size={11} className="animate-spin" /> Disbanding…</> : 'Confirm Disband'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Members Modal */}
      <AnimatePresence>
        {isManageMembersModalOpen && targetGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2)] p-10">
              <Corners opacity="opacity-100" />
              <div className="flex items-center justify-between mb-6 border-b border-[#D4AF37]/20 pb-4">
                <h3 className="font-['Marcellus'] text-2xl text-[#D4AF37] uppercase">Manage Members</h3>
                <button onClick={() => setIsManageMembersModalOpen(false)} className="bg-transparent border-none text-[#666] hover:text-[#D4AF37] cursor-pointer"><X size={16} /></button>
              </div>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={14} />
                <input type="text" placeholder="Search available users..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  className="w-full bg-transparent border border-[#D4AF37]/30 text-[#F2F0E4] text-[12px] pl-9 pr-4 py-2.5 outline-none focus:border-[#D4AF37] font-['Josefin_Sans']" />
              </div>
              <div className="max-h-60 overflow-y-auto border border-[#D4AF37]/15 bg-[#D4AF37]/[0.02] mb-6 p-2">
                {users.filter(u => u.role === 'teamMember' || u.role === 'bugger')
                  .filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                  .map(u => {
                    const isMember = selectedMembers.includes(u._id);
                    const otherGroup = groups.find(g => g._id !== targetGroup._id && (g.members || []).some(m => m._id === u._id || m === u._id));
                    
                    return (
                      <div key={u._id} onClick={() => { if(!otherGroup) setSelectedMembers(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]); }}
                        className={`flex items-center justify-between p-3 border-b border-[#D4AF37]/5 last:border-0 ${otherGroup ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#D4AF37]/5'} ${isMember ? 'bg-[#D4AF37]/10' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3.5 h-3.5 border flex items-center justify-center rotate-45 ${isMember ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#D4AF37]/30'}`}>
                            {isMember && <span className="block w-1.5 h-1.5 bg-[#0A0A0A] rounded-full" />}
                          </div>
                          <div>
                            <div className="text-[12px] text-[#F2F0E4]">{u.username}</div>
                            <div className="text-[9px] text-[#666]">{u.email}</div>
                          </div>
                        </div>
                        {otherGroup && <span className="text-[8px] font-bold text-[#ef4444] uppercase tracking-[0.1em]">In {otherGroup.name}</span>}
                      </div>
                    );
                })}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-[#D4AF37]/10">
                <button onClick={() => setIsManageMembersModalOpen(false)}
                  className="flex-1 py-3 bg-transparent border border-[#D4AF37]/30 text-[#888] hover:text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer">Cancel</button>
                <button onClick={handleManageMembers} disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#F2E8C4] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                  {isSubmitting ? 'Saving...' : `Save ${selectedMembers.length} Members`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign User to Squad Modal */}
      <AnimatePresence>
        {isAssignUserSquadOpen && targetUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2)] p-10">
              <Corners opacity="opacity-100" />
              <div className="flex items-center justify-between mb-6 border-b border-[#D4AF37]/20 pb-4">
                <div>
                  <h3 className="font-['Marcellus'] text-2xl text-[#D4AF37] uppercase">Assign to Squad</h3>
                  <p className="text-[9px] font-bold text-[#888] uppercase tracking-[0.15em] mt-1">{targetUser.username} · {targetUser.role}</p>
                </div>
                <button onClick={() => setIsAssignUserSquadOpen(false)} className="bg-transparent border-none text-[#666] hover:text-[#D4AF37] cursor-pointer"><X size={16} /></button>
              </div>
              <div className="space-y-2 mb-6">
                <label className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Select Squad</label>
                <select value={assignSquadId} onChange={e => setAssignSquadId(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#D4AF37]/30 px-4 py-3 text-[11px] text-[#F2F0E4] uppercase tracking-[0.1em] focus:border-[#D4AF37] outline-none transition-colors appearance-none font-['Josefin_Sans']">
                  <option value="">— Choose a squad —</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.name} ({(g.members || []).length} members)</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-[#D4AF37]/10">
                <button onClick={() => setIsAssignUserSquadOpen(false)}
                  className="flex-1 py-3 bg-transparent border border-[#D4AF37]/30 text-[#888] hover:text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer">Cancel</button>
                <button onClick={handleAssignUserToSquad} disabled={!assignSquadId || isSubmitting}
                  className="flex-1 py-3 bg-[#D4AF37] text-[#0A0A0A] border-none font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#F2E8C4] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2">
                  {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeamManagement;
