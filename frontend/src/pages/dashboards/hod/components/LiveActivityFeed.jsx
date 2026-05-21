import { useRef, useEffect } from "react";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  MessageSquare,
  CheckSquare,
  Clock,
  AlertCircle,
  UserPlus,
  Radio,
} from "lucide-react";
import GlassCard from "@/components/shared/cards/GlassCard";

const typeConfig = {
  announcement: {
    icon: MessageSquare,
    bg: "bg-blue-500/10",
    color: "text-blue-400",
    border: "border-blue-500/20",
  },
  approval: {
    icon: CheckSquare,
    bg: "bg-emerald-500/10",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  system: {
    icon: Radio,
    bg: "bg-purple-500/10",
    color: "text-purple-400",
    border: "border-purple-500/20",
  },
  user: {
    icon: UserPlus,
    bg: "bg-amber-500/10",
    color: "text-amber-400",
    border: "border-amber-500/20",
  },
  alert: {
    icon: AlertCircle,
    bg: "bg-rose-500/10",
    color: "text-rose-400",
    border: "border-rose-500/20",
  },
};

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActivityItem({ entry, isNew }) {
  const config = typeConfig[entry.type] || typeConfig.system;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors relative ${
        isNew ? "bg-blue-500/5" : "hover:bg-accent/50"
      }`}
    >
      {isNew && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400"
        />
      )}

      <div className={`p-1.5 rounded-lg ${config.bg} ${config.border} border shrink-0 mt-0.5`}>
        <Icon size={12} className={config.color} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground">
          <span className="font-medium">{entry.actor}</span>{" "}
          <span className="text-muted-foreground">{entry.action}</span>
          {entry.target && (
            <>
              {" "}
              <span className="text-muted-foreground">—</span>{" "}
              <span className="text-foreground/80 font-medium">{entry.target}</span>
            </>
          )}
        </p>
      </div>

      <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
        {formatTimeAgo(entry.timestamp)}
      </span>
    </motion.div>
  );
}

export default function LiveActivityFeed({ entries, loading, realTimeEvents }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [entries?.length]);

  if (loading) {
    return (
      <GlassCard className="p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-accent rounded w-1/3" />
          <div className="h-10 bg-accent rounded" />
          <div className="h-10 bg-accent rounded" />
          <div className="h-10 bg-accent rounded" />
        </div>
      </GlassCard>
    );
  }

  const realTimeIds = new Set((realTimeEvents || []).map(e => e.id));

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-emerald-400" />
          <h3 className="text-base font-semibold text-foreground">Live Activity</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
        </div>
      </div>

      <div ref={scrollRef} className="space-y-0.5 max-h-[320px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {entries && entries.length > 0 ? (
            entries.map((entry) => (
              <ActivityItem
                key={entry.id}
                entry={entry}
                isNew={realTimeIds.has(entry.id)}
              />
            ))
          ) : (
            <div className="py-6 text-center">
              <Activity size={24} className="mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
