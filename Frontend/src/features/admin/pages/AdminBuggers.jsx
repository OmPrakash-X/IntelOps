import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "@/features/users/userSlice";
import { createUser } from "@/features/users/services/user.api";
import { Users, UserPlus, Shield, RefreshCw } from "lucide-react";
import { useState } from "react";

const ROLE_STYLES = {
  admin:      "bg-purple-500/10 text-purple-400 border-purple-500/20",
  teamLead:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  teamMember: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  bugger:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function AdminBuggers() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((s) => s.users);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "bugger" });
  const [search, setSearch] = useState("");

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return;
    try {
      setCreating(true);
      await createUser(form);
      dispatch(fetchUsers());
      setForm({ username: "", email: "", password: "", role: "bugger" });
      setShowForm(false);
    } catch (err) {
      alert("Failed to create user: " + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All registered users across every role.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          <UserPlus size={14} /> Add User
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Username *</label>
              <input
                required value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Email *</label>
              <input
                required type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Password *</label>
              <input
                required type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="bugger">Bug Reporter</option>
                <option value="teamMember">Team Member</option>
                <option value="teamLead">Team Lead</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
              <button
                type="submit" disabled={creating}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creating ? <RefreshCw size={12} className="animate-spin" /> : <UserPlus size={12} />}
                {creating ? "Creating…" : "Create User"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <input
        type="text" value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full max-w-sm bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />

      {/* Users Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-3">
          <Users size={16} className="text-muted-foreground" />
          <span className="text-sm font-semibold">
            {filtered.length} {search ? "matching" : "total"} users
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <RefreshCw size={18} className="animate-spin mr-2" />
            <span className="text-sm">Loading users…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No users found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((u) => (
              <div key={u._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-foreground shrink-0">
                  {u.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{u.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${ROLE_STYLES[u.role] || "bg-muted text-muted-foreground border-border"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}