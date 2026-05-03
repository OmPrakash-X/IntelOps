import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchIncidents } from "@/features/incidents/incidentSlice";
import { fetchGroups } from "@/features/groups/groupSlice";
import { updateIncidentStatus, assignResponders } from "@/features/incidents/services/incidents.api";
import { useState } from "react";
import {
  AlertCircle, Clock, CheckCircle, ArrowRight, Activity,
  RefreshCw, UserPlus, ChevronDown
} from "lucide-react";

const SEV = {
  high:   { label: "P1", dot: "bg-red-500",   badge: "text-red-400 bg-red-500/10" },
  medium: { label: "P2", dot: "bg-amber-500",  badge: "text-amber-400 bg-amber-500/10" },
  low:    { label: "P3", dot: "bg-blue-400",   badge: "text-blue-400 bg-blue-500/10" },
};

export default function TeamIssues() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { incidents, loading } = useSelector((s) => s.incidents);
  const { groups }  = useSelector((s) => s.groups);
  const { user }    = useSelector((s) => s.auth);

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchIncidents());
    dispatch(fetchGroups());
  }, [dispatch]);

  const myGroup = groups.find(
    (g) => g.teamLead?._id === user?._id || g.teamLead === user?._id
  );

  const groupIncidents = incidents.filter((i) => {
    const inGroup = i.project?.group === myGroup?._id || i.project?.groupId === myGroup?._id;
    if (!inGroup) return false;
    if (filter === "unassigned") return (i.responders || []).length === 0 && i.status !== "resolved";
    if (filter === "open")      return i.status === "open";
    if (filter === "active")    return i.status === "inProgress";
    if (filter === "resolved")  return i.status === "resolved";
    return true;
  });

  const handleStatusChange = async (id, status) => {
    try {
      await updateIncidentStatus(id, status);
      dispatch(fetchIncidents());
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incident Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All incidents assigned to your group.
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-lg border">
          {["all", "unassigned", "open", "active", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest transition-all ${
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",    value: incidents.filter(i => i.project?.group === myGroup?._id || i.project?.groupId === myGroup?._id).length, icon: Activity,    col: "text-foreground" },
          { label: "Open",     value: incidents.filter(i => (i.project?.group === myGroup?._id || i.project?.groupId === myGroup?._id) && i.status === "open").length,       icon: AlertCircle, col: "text-red-400" },
          { label: "Active",   value: incidents.filter(i => (i.project?.group === myGroup?._id || i.project?.groupId === myGroup?._id) && i.status === "inProgress").length,  icon: Clock,       col: "text-amber-400" },
          { label: "Resolved", value: incidents.filter(i => (i.project?.group === myGroup?._id || i.project?.groupId === myGroup?._id) && i.status === "resolved").length,   icon: CheckCircle, col: "text-emerald-400" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <s.icon size={14} className={`${s.col} mb-2`} />
            <div className={`text-2xl font-bold tabular-nums ${s.col}`}>{s.value}</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b">
          <span className="text-sm font-semibold">{groupIncidents.length} incidents</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <RefreshCw size={18} className="animate-spin mr-2" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : groupIncidents.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {myGroup ? "No incidents match this filter." : "No group assigned to you yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="text-left px-6 py-3">Incident</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Project</th>
                  <th className="text-left px-6 py-3">Severity</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Responders</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {groupIncidents.map((inc) => {
                  const sev = SEV[inc.severity] || SEV.low;
                  return (
                    <tr key={inc._id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sev.dot}`} />
                          <span className="font-medium truncate max-w-[200px]">{inc.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell text-muted-foreground text-xs">{inc.project?.name || "—"}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${sev.badge}`}>{sev.label}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="relative group/status inline-block">
                          <button className={`flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded border transition-all ${
                            inc.status === "open"       ? "text-red-400 bg-red-500/10 border-red-500/20" :
                            inc.status === "inProgress" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                                          "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          }`}>
                            {inc.status} <ChevronDown size={10} />
                          </button>
                          <div className="absolute top-full left-0 mt-1 w-36 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all z-50 overflow-hidden">
                            {[
                              { label: "In Progress", val: "inProgress" },
                              { label: "Resolved", val: "resolved" },
                            ].map((st) => (
                              <button
                                key={st.val}
                                onClick={() => handleStatusChange(inc._id, st.val)}
                                className="w-full text-left px-4 py-2 text-[10px] font-semibold hover:bg-muted transition-colors"
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell">
                        <div className="flex -space-x-1.5">
                          {(inc.responders || []).slice(0, 3).map((r, i) => (
                            <div key={i} title={r.username} className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold">
                              {r.username?.[0]?.toUpperCase()}
                            </div>
                          ))}
                          {(inc.responders || []).length === 0 && (
                            <span className="text-[10px] text-muted-foreground italic">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => navigate(`/incidents/${inc._id}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight size={14} className="text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}