import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchIncidents } from "@/features/incidents/incidentSlice";
import { Activity, AlertCircle, Clock, CheckCircle, ArrowRight, RefreshCw, Shield } from "lucide-react";

const SEV = {
  high:   { label: "P1", dot: "bg-red-500",   badge: "text-red-400 bg-red-500/10" },
  medium: { label: "P2", dot: "bg-amber-500",  badge: "text-amber-400 bg-amber-500/10" },
  low:    { label: "P3", dot: "bg-blue-400",   badge: "text-blue-400 bg-blue-500/10" },
};

const ST = {
  open:       { label: "Open",        color: "text-red-400 bg-red-500/10" },
  inProgress: { label: "In Progress", color: "text-amber-400 bg-amber-500/10" },
  resolved:   { label: "Resolved",    color: "text-emerald-400 bg-emerald-500/10" },
};

export default function BuggerIssues() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const { incidents, loading } = useSelector((s) => s.incidents);

  useEffect(() => { dispatch(fetchIncidents()); }, [dispatch]);

  const mine = [...incidents]
    .filter((i) => i.createdBy?._id === user?._id || i.createdBy === user?._id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const stats = {
    total:    mine.length,
    open:     mine.filter((i) => i.status === "open").length,
    active:   mine.filter((i) => i.status === "inProgress").length,
    resolved: mine.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Issues</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All incidents you've reported.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: stats.total,    icon: Activity,    col: "text-foreground" },
          { label: "Open",      value: stats.open,     icon: AlertCircle, col: "text-red-400" },
          { label: "Active",    value: stats.active,   icon: Clock,       col: "text-amber-400" },
          { label: "Resolved",  value: stats.resolved, icon: CheckCircle, col: "text-emerald-400" },
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
          <span className="text-sm font-semibold">{mine.length} issues reported</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <RefreshCw size={18} className="animate-spin mr-2" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : mine.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Shield size={32} className="mb-3 opacity-40" />
            <p className="text-sm">No issues reported yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <th className="text-left px-6 py-3">Title</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Project</th>
                  <th className="text-left px-6 py-3">Severity</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3 hidden lg:table-cell">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mine.map((inc) => {
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
                          <span className="font-medium truncate max-w-[200px] group-hover:text-primary transition-colors">
                            {inc.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell text-muted-foreground text-xs">{inc.project?.name || "—"}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${sev.badge}`}>{sev.label}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell text-xs text-muted-foreground tabular-nums">
                        {new Date(inc.createdAt).toLocaleDateString()}
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