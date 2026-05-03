import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups } from "@/features/groups/groupSlice";
import { fetchUsers } from "@/features/users/userSlice";
import { createGroup } from "@/features/groups/services/group.api";
import { assignGroupLead } from "@/features/incidents/services/incidents.api";
import { Shield, Users, Plus, RefreshCw, UserCog } from "lucide-react";

export default function AdminTeams() {
  const dispatch = useDispatch();
  const { groups, loading } = useSelector((s) => s.groups);
  const { users } = useSelector((s) => s.users);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [assigningLead, setAssigningLead] = useState(null); // groupId
  const [selectedLead, setSelectedLead] = useState("");

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchUsers());
  }, [dispatch]);

  const teamLeads = users.filter((u) => u.role === "teamLead");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setCreating(true);
      await createGroup(form);
      dispatch(fetchGroups());
      setForm({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      alert("Failed to create group: " + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleAssignLead = async (groupId) => {
    if (!selectedLead) return;
    try {
      await assignGroupLead(groupId, selectedLead);
      dispatch(fetchGroups());
      setAssigningLead(null);
      setSelectedLead("");
    } catch (err) {
      alert("Failed to assign lead: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams & Groups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all operational groups and their team leads.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> New Group
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Create New Group</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Group Name *</label>
              <input
                required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Platform SRE"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description…"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                type="submit" disabled={creating}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                {creating ? "Creating…" : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw size={18} className="animate-spin mr-2" />
          <span className="text-sm">Loading groups…</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Shield size={32} className="mb-3 opacity-40" />
          <p className="text-sm">No groups created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <div key={g._id} className="rounded-lg border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-sm">{g.name}</h3>
                  {g.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{g.description}</p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield size={14} className="text-primary" />
                </div>
              </div>

              {/* Lead */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Team Lead</p>
                {g.teamLead ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold">
                      {g.teamLead.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-xs font-medium">{g.teamLead.username || g.teamLead}</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {assigningLead === g._id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedLead}
                          onChange={(e) => setSelectedLead(e.target.value)}
                          className="flex-1 bg-background border border-input rounded px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="">Select lead…</option>
                          {teamLeads.map((u) => (
                            <option key={u._id} value={u._id}>{u.username}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignLead(g._id)}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-[10px] font-bold uppercase tracking-widest hover:opacity-90"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => { setAssigningLead(null); setSelectedLead(""); }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAssigningLead(g._id)}
                        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <UserCog size={12} /> Assign Lead
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Members */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                  {(g.teamMembers || []).length} Members
                </p>
                <div className="flex -space-x-2">
                  {(g.teamMembers || []).slice(0, 5).map((m, i) => (
                    <div
                      key={i}
                      title={m.username}
                      className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-bold"
                    >
                      {m.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  ))}
                  {(g.teamMembers || []).length > 5 && (
                    <div className="w-6 h-6 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                      +{(g.teamMembers || []).length - 5}
                    </div>
                  )}
                  {(g.teamMembers || []).length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">No members yet</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}