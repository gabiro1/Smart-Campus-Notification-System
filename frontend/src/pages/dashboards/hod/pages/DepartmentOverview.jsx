import {
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useHodDashboard } from "../hooks/useHodDashboard";
import PriorityAlertPanel from "../components/PriorityAlertPanel";
import KpiIntelligenceCards from "../components/KpiIntelligenceCards";
import ActivityIntelligenceChart from "../components/ActivityIntelligenceChart";
import ContextualQuickActions from "../components/ContextualQuickActions";
import LiveActivityFeed from "../components/LiveActivityFeed";

export default function DepartmentOverview() {
  const isOnline = useOnlineStatus();
  const {
    deptName,
    loading,
    isRefetching,
    refetch,
    kpis,
    alerts,
    activityFeed,
    quickActions,
    rawData,
    isApproving,
    resolveAlert,
    realTimeEvents,
  } = useHodDashboard();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Department Overview
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 uppercase tracking-wider">
              {deptName}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Academic operations at a glance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
            isOnline
              ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/5 text-rose-400 border-rose-500/20"
          }`}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? "Live" : "Offline"}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/50 border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefetching ? "animate-spin" : ""} />
            {isRefetching ? "Syncing..." : "Refresh"}
          </button>
        </div>
      </header>

      <PriorityAlertPanel
        alerts={alerts}
        onResolve={resolveAlert}
        resolving={isApproving}
        loading={loading}
      />

      <KpiIntelligenceCards kpis={kpis} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityIntelligenceChart data={rawData} loading={loading} />
        </div>
        <div>
          <ContextualQuickActions actions={quickActions} loading={loading} />
        </div>
      </div>

      <LiveActivityFeed
        entries={activityFeed}
        loading={loading}
        realTimeEvents={realTimeEvents}
      />
    </div>
  );
}
