import { Link } from "react-router-dom";
import { Users, FileText, ArrowUpRight } from "lucide-react";
import GlassCard from "@/components/shared/cards/GlassCard";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import { useHrOverview } from "../hooks/useHrDashboard";
import { HR_STATUS, HR_STATUS_LABELS, HR_STATUS_FLOW } from "../constants/hrStatus";
import { HR_STATUS_CONFIG } from "../constants/hrStatusConfig";

const KPI_DEFS = [
  { label: "Total Staff", key: "totalStaff", icon: Users, href: "#", color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Pending Drafts", key: "pendingDrafts", icon: FileText, href: "/hr/drafts", color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Active Assignments", key: "activeAssignments", icon: FileText, href: "/hr/assignments", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Total Drafts", key: "totalDrafts", icon: FileText, href: "/hr/drafts", color: "text-violet-500", bg: "bg-violet-500/10" },
];

function computeKpis(overview) {
  if (!overview) return KPI_DEFS.map((d) => ({ ...d, value: 0 }));
  return KPI_DEFS.map((d) => ({
    ...d,
    value: d.key === "pendingDrafts" ? (overview.drafts?.[HR_STATUS.PENDING] ?? 0)
      : d.key === "activeAssignments" ? (overview.assignments?.[HR_STATUS.ACTIVATED] ?? 0)
      : d.key === "totalDrafts" ? (overview.totalDrafts ?? 0)
      : (overview.totalStaff ?? 0),
  }));
}

function StatusBreakdownPanel({ title, data }) {
  return (
    <GlassCard className="p-5">
      <h2 className="font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-3">
        {HR_STATUS_FLOW.map((status) => {
          const config = HR_STATUS_CONFIG[status];
          return (
            <div key={status} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-accent/50">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                <span className="text-sm text-foreground font-medium">{HR_STATUS_LABELS[status]}</span>
              </div>
              <span className={`text-sm font-bold ${config.color}`}>
                {data?.[status] ?? 0}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default function HrDashboard() {
  const { data: overview, isLoading, error, refetch } = useHrOverview();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message="Failed to load HR dashboard" onRetry={refetch} />
      </div>
    );
  }

  const kpis = computeKpis(overview);
  const activity = overview?.recentActivity ?? [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Human resources overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <GlassCard key={kpi.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <Link to={kpi.href} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{kpi.value}</p>
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusBreakdownPanel title="Draft Status" data={overview?.drafts} />
        <StatusBreakdownPanel title="Assignment Status" data={overview?.assignments} />
      </div>

      {activity.length > 0 && (
        <GlassCard className="p-5">
          <h2 className="font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {activity.map((item) => (
              <div key={item._id} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-accent/50">
                <div className={`w-2 h-2 rounded-full ${(HR_STATUS_CONFIG[item.status] || HR_STATUS_CONFIG.DRAFT).dotColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
