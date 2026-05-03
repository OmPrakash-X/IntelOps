import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LayoutGrid, Plus, Search, Filter, Key, X, Mail, Shield, ChevronRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, createUser } from '../../users/userSlice';
import { fetchGroups, createGroup } from '../../groups/groupSlice';
import API from '../../../services/api';

const TeamManagement = () => {
  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { groups, loading: groupsLoading } = useSelector((state) => state.groups);
  const [activeTab, setActiveTab] = useState('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isAssignLeadModalOpen, setIsAssignLeadModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            <Users size={16} /> Users
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'groups' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            <LayoutGrid size={16} /> Groups
          </button>
        </div>
        
        <button 
          onClick={() => activeTab === 'users' ? setIsUserModalOpen(true) : setIsGroupModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} /> {activeTab === 'users' ? 'Create User' : 'New Group'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div 
            key="users"
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-bold focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold focus:border-indigo-500 outline-none transition-all appearance-none pr-10 text-slate-400"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teamLead">Team Lead</option>
                <option value="bugger">Bugger</option>
                <option value="teamMember">Member</option>
              </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Group</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold">{user.username}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-400">{getUserGroupName(user)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-emerald-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                          <Key size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="groups"
            initial={{ opacity: 0, x: 10 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {groups.map(group => (
              <div key={group._id} className="p-8 rounded-[32px] bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <LayoutGrid size={28} />
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedGroupId(group._id);
                      setSelectedLeadId(group.teamLead?._id || group.teamLead || '');
                      setIsAssignLeadModalOpen(true);
                    }}
                    className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                  >
                    Manage
                  </button>
                </div>
                <h3 className="text-lg font-black mb-1">{group.name}</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Project: {getGroupProjectName(group.project)}</p>
                
                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Lead</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[9px] font-black border border-indigo-500/20">
                        {(group.teamLead?.username || '?').charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-white">{group.teamLead?.username || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Members</p>
                    <span className="text-xs font-black text-white">{(group.members || []).length}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modals --- */}
      <AnimatePresence>
        {(isUserModalOpen || isGroupModalOpen || isAssignLeadModalOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsUserModalOpen(false);
                setIsGroupModalOpen(false);
                setIsAssignLeadModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black tracking-tight">
                    {isUserModalOpen ? 'Create New User' : isGroupModalOpen ? 'New System Group' : 'Assign Team Lead'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsUserModalOpen(false);
                      setIsGroupModalOpen(false);
                      setIsAssignLeadModalOpen(false);
                    }}
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {isUserModalOpen && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Username</label>
                          <input 
                            type="text" 
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Role</label>
                          <select 
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            style={{ colorScheme: 'dark' }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all appearance-none"
                          >
                            <option value="admin"   style={{background:'#020617',color:'white'}}>Admin</option>
                            <option value="teamLead" style={{background:'#020617',color:'white'}}>Team Lead</option>
                            <option value="bugger"   style={{background:'#020617',color:'white'}}>Bugger</option>
                            <option value="teamMember" style={{background:'#020617',color:'white'}}>Member</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                        <input 
                          type="email" 
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Initial Password</label>
                        <input 
                          type="password" 
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" 
                        />
                      </div>
                    </>
                  )}

                  {isGroupModalOpen && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Group Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SRE Platform Team"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" 
                      />
                    </div>
                  )}

                  {isAssignLeadModalOpen && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Select Team Lead</label>
                      <select 
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all appearance-none"
                        value={selectedLeadId}
                        onChange={(e) => setSelectedLeadId(e.target.value)}
                      >
                        <option value="">Select a lead...</option>
                        {users.filter(u => u.role === 'teamLead').map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                      </select>
                    </div>
                  )}

                  <button 
                    disabled={isSubmitting}
                    onClick={() => {
                      if (isUserModalOpen) handleCreateUser();
                      else if (isGroupModalOpen) handleCreateGroup();
                      else handleAssignLead();
                    }}
                    className={`w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[13px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : 'Confirm Action'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeamManagement;
