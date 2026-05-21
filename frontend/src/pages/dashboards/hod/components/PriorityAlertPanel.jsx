/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Users,
  CheckSquare,
  ChevronRight,
  Loader2,
  ShieldAlert,
  Megaphone,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/shared/cards/GlassCard";

const severityConfig = {
  critical: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    glow: "shadow-red-500/10",
    icon: ShieldAlert,
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    label: "Critical",
  },
  high: {
    border: "border-orange-500/25",
    bg: "bg-orange-500/5",
    glow: "shadow-orange-500/8",
    icon: AlertTriangle,
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    label: "High",
  },
  medium: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    glow: "shadow-amber-500/5",
    icon: Clock,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    label: "Medium",
  },
};

function AlertCard({ alert, onResolve, resolving }) {
  const navigate = useNavigate();
  const config = severityConfig[alert.severity] || severityConfig.medium;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`relative overflow-hidden rounded-xl border ${config.border} ${config.bg} ${config.glow} transition-all hover:brightness-110`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`p-2 rounded-lg ${config.iconBg} shrink-0 mt-0.5`}>
          <Icon size={16} className={config.iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${config.badge}`}>
              {config.label}
            </span>
            {alert.count > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground">
                {alert.count} item{alert.count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground">{alert.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {alert.id === "urgent-approvals" && (
            <button
              onClick={(e) => { e.stopPropagation(); onResolve?.(alert.id); }}
              disabled={resolving}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {resolving ? <Loader2 size={12} className="animate-spin" /> : <CheckSquare size={12} />}
              {resolving ? "Processing..." : "Approve All"}
            </button>
          )}
          <button
            onClick={() => navigate(alert.action?.path || "#")}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${
        alert.severity === "critical" ? "from-red-500 via-red-400 to-red-500" :
        alert.severity === "high" ? "from-orange-500 via-orange-400 to-orange-500" :
        "from-amber-500 via-amber-400 to-amber-500"
      }`} />
    </motion.div>
  );
}

export default function PriorityAlertPanel({ alerts, onResolve, resolving, loading }) {
  const allAlerts = [...(alerts?.critical || []), ...(alerts?.high || []), ...(alerts?.medium || [])];
  const totalAlerts = allAlerts.length;

  if (loading) {
    return (
      <GlassCard className="p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-accent rounded w-1/3" />
          <div className="h-16 bg-accent rounded" />
          <div className="h-16 bg-accent rounded" />
        </div>
      </GlassCard>
    );
  }

  if (!totalAlerts) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-emerald-400" />
            <h2 className="text-base font-semibold text-foreground">Priority Alerts</h2>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            All Clear
          </span>
        </div>
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <div className="text-center">
            <CheckSquare size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium text-emerald-400/70">No pending issues</p>
            <p className="text-xs mt-1">Everything is running smoothly</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className={
            alerts?.critical?.length > 0 ? "text-red-400" :
            alerts?.high?.length > 0 ? "text-orange-400" : "text-amber-400"
          } />
          <h2 className="text-base font-semibold text-foreground">Priority Alerts</h2>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
            alerts?.critical?.length > 0
              ? "bg-red-500/15 text-red-400 border-red-500/30"
              : alerts?.high?.length > 0
              ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            {totalAlerts} {totalAlerts === 1 ? "alert" : "alerts"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {allAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={onResolve}
              resolving={resolving}
            />
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
