import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchIncidents } from "@/features/incidents/incidentSlice";
import { fetchUsers } from "@/features/users/userSlice";
import { fetchGroups } from "@/features/groups/groupSlice";
import { fetchProjects } from "@/features/project/projectSlice";
import {
  Activity, Users, Shield, ShieldAlert, CheckCircle,
  Clock, AlertCircle, ArrowRight, TrendingUp, Layers
} from "lucide-react";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { incidents, loading: incLoading } = useSelector((s) => s.incidents);
  const { users }   = useSelector((s) => s.users);
  const { groups }  = useSelector((s) => s.groups);
  const { projects } = useSelector((s) => s.projects);

  useEffect(() => {
    dispatch(fetchIncidents());
    dispatch(fetchUsers());
    dispatch(fetchGroups());
    dispatch(fetchProjects());
  }, [dispatch]);

  const stats = {
    total:     incidents.length,
    open:      incidents.filter((i) => i.status === "open").length,
    active:    incidents.filter((i) => i.status === "inProgress").length,
    resolved:  incidents.filter((i) => i.status === "resolved").length,
    users:     users.length,
    groups:    groups.length,
    projects:  projects.length,
    critical:  incidents.filter((i) => i.severity === "high" && i.status !== "resolved").length,
  };

  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const SEV = {
    high:   { label: "P1", dot: "bg-red-500",   badge: "text-red-400 bg-red-500/10" },
    medium: { label: "P2", dot: "bg-amber-500",  badge: "text-amber-400 bg-amber-500/10" },
    low:    { label: "P3", dot: "bg-blue-400",   badge: "text-blue-400 bg-blue-500/10" },
  };

  const STATUS = {
    open:       { label: "Open",       color: "text-red-400" },
    inProgress: { label: "Active",     color: "text-amber-400" },
    resolved:   { label: "Resolved",   color: "text-emerald-400" },
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Centre</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live view of all incidents, teams, and system health.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Incidents",  value: stats.total,   icon: Activity,     color: "text-foreground",    bg: "bg-muted" },
          { label: "Open",             value: stats.open,    icon: AlertCircle,  color: "text-red-400",        bg: "bg-red-500/5" },
          { label: "In Progress",      value: stats.active,  icon: Clock,        color: "text-amber-400",      bg: "bg-amber-500/5" },
          { label: "Resolved",         value: stats.resolved,icon: CheckCircle,  color: "text-emerald-400",    bg: "bg-emerald-500/5" },
          { label: "Team Members",     value: stats.users,   icon: Users,        color: "text-blue-400",       bg: "bg-blue-500/5" },
          { label: "Groups",           value: stats.groups,  icon: Shield,       color: "text-purple-400",     bg: "bg-purple-500/5" },
          { label: "Projects",         value: stats.projects,icon: Layers,       color: "text-cyan-400",       bg: "bg-cyan-500/5" },
          { label: "Critical Open",    value: stats.critical,icon: ShieldAlert,  color: "text-red-500",        bg: "bg-red-600/10", urgent: stats.critical > 0 },
        ].map((s, i) => (
          <div
            key={i}
            className={`relative rounded-lg border p-5 transition-all ${s.bg} ${s.urgent ? "border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.1)]" : "border-border"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon size={16} className={s.color} />
              {s.urgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <div className={`text-3xl font-bold tabular-nums mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Incidents Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <TrendingUp size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold">Recent Incidents</h2>
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            {incidents.length} total
          </span>
        </div>

        {incLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Activity size={20} className="animate-pulse mr-2" />
            <span className="text-sm">Loading incidents…</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentIncidents.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No incidents recorded yet.</div>
            ) : (
              recentIncidents.map((inc) => {
                const sev = SEV[inc.severity] || SEV.low;
                const st  = STATUS[inc.status] || STATUS.open;
                return (
                  <div
                    key={inc._id}
                    onClick={() => navigate(`/incidents/${inc._id}`)}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/50 cursor-pointer transition-colors group"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${sev.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {inc.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        {inc.project?.name || "—"} · {new Date(inc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${sev.badge}`}>
                        {sev.label}
                      </span>
                      <span className={`text-[10px] font-semibold ${st.color} hidden sm:block`}>
                        {st.label}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}