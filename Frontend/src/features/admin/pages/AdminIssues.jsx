import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchIncidents } from "@/features/incidents/incidentSlice";
import {
  Activity, AlertCircle, Clock, CheckCircle, ArrowRight,
  Shield, ShieldAlert, Users, RefreshCw
} from "lucide-react";

const SEV = {
  high:   { label: "P1 – Critical", dot: "bg-red-500",   badge: "text-red-400 bg-red-500/10 border-red-500/20",   color: "text-red-400" },
  medium: { label: "P2 – High",     dot: "bg-amber-500",  badge: "text-amber-400 bg-amber-500/10 border-amber-500/20", color: "text-amber-400" },
  low:    { label: "P3 – Low",      dot: "bg-blue-400",   badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",  color: "text-blue-400" },
};

const ST = {
  open:       { label: "Open",       color: "text-red-400 bg-red-500/10" },
  inProgress: { label: "In Progress",color: "text-amber-400 bg-amber-500/10" },
  resolved:   { label: "Resolved",   color: "text-emerald-400 bg-emerald-500/10" },
};

export default function AdminIssues() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { incidents, loading } = useSelector((s) => s.incidents);

  useEffect(() => {
    dispatch(fetchIncidents());
  }, [dispatch]);

  const sorted = [...incidents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const stats = {
    total:    incidents.length,
    open:     incidents.filter((i) => i.status === "open").length,
    active:   incidents.filter((i) => i.status === "inProgress").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Incidents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Every incident across all teams and projects.
        </p>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total",      value: stats.total,    icon: Activity,    col: "text-foreground" },
          { label: "Open",       value: stats.open,     icon: AlertCircle, col: "text-red-400" },
          { label: "In Progress",value: stats.active,   icon: Clock,       col: "text-amber-400" },
          { label: "Resolved",   value: stats.resolved, icon: CheckCircle, col: "text-emerald-400" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <s.icon size={14} className={`${s.col} mb-2`} />
            <div className={`text-2xl font-bold tabular-nums ${s.col}`}>{s.value}</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Incidents Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-sm font-semibold">Incident Log</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <RefreshCw size={18} className="animate-spin mr-2" />
            <span className="text-sm">Fetching incidents…</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No incidents yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="text-left px-6 py-3">Incident</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Project</th>
                  <th className="text-left px-6 py-3">Severity</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Reported by</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((inc) => {
                  const sev = SEV[inc.severity] || SEV.low;
                  const st  = ST[inc.status] || ST.open;
                  return (
                    <tr
                      key={inc._id}
                      onClick={() => navigate(`/incidents/${inc._id}`)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sev.dot}`} />
                          <span className="font-medium group-hover:text-primary transition-colors truncate max-w-[180px] md:max-w-[260px]">
                            {inc.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell">
                        <span className="text-muted-foreground text-xs">{inc.project?.name || "—"}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${sev.badge}`}>
                          {sev.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {inc.createdBy?.username || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {new Date(inc.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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