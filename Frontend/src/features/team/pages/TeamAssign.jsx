import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchIncidents } from "@/features/incidents/incidentSlice";
import { fetchGroups } from "@/features/groups/groupSlice";
import { assignResponders } from "@/features/incidents/services/incidents.api";
import { UserPlus, ShieldAlert, RefreshCw, Check, Search, ArrowRight } from "lucide-react";

export default function TeamAssign() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { incidents, loading } = useSelector((s) => s.incidents);
  const { groups }  = useSelector((s) => s.groups);
  const { user }    = useSelector((s) => s.auth);

  const [assigning, setAssigning] = useState(null); // incident being assigned
  const [selected, setSelected]   = useState([]);
  const [search, setSearch]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchIncidents());
    dispatch(fetchGroups());
  }, [dispatch]);

  const myGroup = groups.find(
    (g) => g.teamLead?._id === user?._id || g.teamLead === user?._id
  );

  const unassigned = incidents.filter((i) => {
    const inGroup = i.project?.group === myGroup?._id || i.project?.groupId === myGroup?._id;
    return inGroup && (i.responders || []).length === 0 && i.status !== "resolved";
  });

  const myTeam = myGroup?.teamMembers || [];
  const filtered = myTeam.filter((m) =>
    m.username?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAssign = async () => {
    if (!assigning || selected.length === 0) return;
    try {
      setSubmitting(true);
      await assignResponders(assigning._id, selected);
      dispatch(fetchIncidents());
      setAssigning(null);
      setSelected([]);
      setSearch("");
    } catch (err) {
      alert("Failed to assign: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const SEV = {
    high:   { label: "P1", dot: "bg-red-500", badge: "text-red-400 bg-red-500/10 border-red-500/20" },
    medium: { label: "P2", dot: "bg-amber-500", badge: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    low:    { label: "P3", dot: "bg-blue-400", badge: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Responder Assignment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Incidents that need responders assigned from your team.
        </p>
      </div>

      {/* Urgent count */}
      {unassigned.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <ShieldAlert size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-amber-400">
            {unassigned.length} incident{unassigned.length !== 1 ? "s" : ""} awaiting assignment
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <RefreshCw size={18} className="animate-spin mr-2" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : unassigned.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <ShieldAlert size={36} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">All incidents have responders.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Great work keeping things covered!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unassigned.map((inc) => {
            const sev = SEV[inc.severity] || SEV.low;
            return (
              <div
                key={inc._id}
                className="p-5 rounded-lg border-l-2 border-l-amber-500 border-y border-r bg-card space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${sev.badge}`}>
                        {sev.label}
                      </span>
                      <span className="text-[9px] font-semibold text-amber-500 uppercase tracking-widest">Unassigned</span>
                    </div>
                    <h3 className="text-sm font-semibold truncate">{inc.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.project?.name || "—"}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/incidents/${inc._id}`)}
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <ArrowRight size={14} className="text-muted-foreground" />
                  </button>
                </div>

                <button
                  onClick={() => { setAssigning(inc); setSelected([]); setSearch(""); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  <UserPlus size={13} /> Assign Responders
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            onClick={() => { setAssigning(null); setSelected([]); setSearch(""); }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl p-6 space-y-4">
            <div>
              <h3 className="font-semibold">Assign Responders</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{assigning.title}</p>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team members…"
                className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No team members to assign</div>
              ) : (
                filtered.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => toggle(m._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selected.includes(m._id)
                        ? "bg-primary/5 border-primary/30"
                        : "bg-background border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {m.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{m.username}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                    {selected.includes(m._id) && <Check size={14} className="text-primary" />}
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setAssigning(null); setSelected([]); setSearch(""); }}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                disabled={selected.length === 0 || submitting}
                onClick={handleAssign}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <RefreshCw size={12} className="animate-spin" /> : <UserPlus size={12} />}
                {submitting ? "Assigning…" : `Assign ${selected.length || ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}