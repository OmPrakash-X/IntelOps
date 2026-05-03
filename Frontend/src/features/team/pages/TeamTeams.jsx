import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGroups } from "@/features/groups/groupSlice";
import { fetchUsers } from "@/features/users/userSlice";
import { addMembers } from "@/features/groups/services/group.api";
import { useState } from "react";
import { Users, UserPlus, X, RefreshCw, Shield, Check, Search } from "lucide-react";

export default function TeamTeams() {
  const dispatch  = useDispatch();
  const { groups, loading } = useSelector((s) => s.groups);
  const { users }  = useSelector((s) => s.users);
  const { user }   = useSelector((s) => s.auth);

  const [adding, setAdding] = useState(false);
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchUsers());
  }, [dispatch]);

  const myGroup = groups.find(
    (g) => g.teamLead?._id === user?._id || g.teamLead === user?._id
  );

  const assignedIds = groups.reduce((acc, g) => {
    const memberIds = (g.teamMembers || []).map((m) => m._id || m);
    const leadId = g.teamLead?._id || g.teamLead;
    return [...acc, ...memberIds, leadId].filter(Boolean);
  }, []);

  const available = users.filter(
    (u) => !assignedIds.includes(u._id) && u._id !== user?._id
  );

  const filtered = available.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAdd = async () => {
    if (!myGroup || selected.length === 0) return;
    try {
      setSubmitting(true);
      await addMembers(myGroup._id, selected);
      dispatch(fetchGroups());
      setSelected([]);
      setAdding(false);
      setSearch("");
    } catch (err) {
      alert("Failed to add members: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {myGroup?.name || "Group overview and member management."}
          </p>
        </div>
        {myGroup && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            <UserPlus size={14} /> Add Member
          </button>
        )}
      </div>

      {!myGroup ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Shield size={36} className="mb-3 opacity-40" />
          <p className="text-sm">No group assigned to you yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Contact an admin to get assigned as team lead.</p>
        </div>
      ) : (
        <>
          {/* Group card */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Group</div>
                <h2 className="text-xl font-bold">{myGroup.name}</h2>
                {myGroup.description && (
                  <p className="text-sm text-muted-foreground mt-1">{myGroup.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Team Size</div>
                <div className="text-2xl font-bold tabular-nums">{(myGroup.teamMembers || []).length}</div>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center gap-3">
              <Users size={16} className="text-muted-foreground" />
              <span className="text-sm font-semibold">Team Members</span>
            </div>

            {(myGroup.teamMembers || []).length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No members yet. Add some using the button above.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {[{ ...user, role: "teamLead" }, ...(myGroup.teamMembers || [])].map((m, i) => (
                  <div key={m._id || i} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-foreground shrink-0">
                      {m.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{m.username}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                      i === 0
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                        : "text-muted-foreground bg-muted border-border"
                    }`}>
                      {i === 0 ? "Team Lead" : m.role || "Member"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Member Modal */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            onClick={() => { setAdding(false); setSelected([]); setSearch(""); }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Add Team Members</h3>
              <button onClick={() => { setAdding(false); setSelected([]); setSearch(""); }} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No unassigned users available</div>
              ) : (
                filtered.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => toggle(u._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selected.includes(u._id)
                        ? "bg-primary/5 border-primary/30"
                        : "bg-background border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.role}</p>
                    </div>
                    {selected.includes(u._id) && <Check size={14} className="text-primary" />}
                  </div>
                ))
              )}
            </div>

            <button
              disabled={selected.length === 0 || submitting}
              onClick={handleAdd}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <RefreshCw size={12} className="animate-spin" /> : <UserPlus size={12} />}
              {submitting ? "Adding…" : `Add ${selected.length || ""} Members`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}