/* eslint-disable-next-line no-unused-vars */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Bell,
  Megaphone,
  AlertTriangle,
  ChevronRight,
  Zap,
} from "lucide-react";
import GlassCard from "@/components/shared/cards/GlassCard";

const iconMap = {
  CheckSquare,
  Bell,
  Megaphone,
  AlertTriangle,
};

const colorMap = {
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    hover: "hover:bg-amber-500/15",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: "text-purple-400",
    hover: "hover:bg-purple-500/15",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    hover: "hover:bg-blue-500/15",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "text-red-400",
    hover: "hover:bg-red-500/15",
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
  },
};

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ContextualQuickActions({ actions, loading, onAction }) {
  const navigate = useNavigate();

  const sorted = [...(actions || [])].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  if (loading) {
    return (
      <GlassCard className="p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-accent rounded w-1/3" />
          <div className="h-12 bg-accent rounded" />
          <div className="h-12 bg-accent rounded" />
          <div className="h-12 bg-accent rounded" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-blue-400" />
        <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
      </div>

      <div className="space-y-2">
        {sorted.map((action, i) => {
          const Icon = iconMap[action.icon] || Zap;
          const colors = colorMap[action.color] || colorMap.blue;

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                if (onAction?.(action.id)) return;
                navigate(action.path || "#");
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border ${colors.border} ${colors.bg} ${colors.hover} transition-all group text-left`}
            >
              <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                <Icon size={14} className={colors.icon} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
              </div>

              {action.priority && action.priority !== "low" && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${colors.badge} shrink-0`}>
                  {action.priority}
                </span>
              )}

              <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
            </motion.button>
          );
        })}

        {sorted.length === 0 && (
          <div className="py-6 text-center">
            <Zap size={24} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No actions available</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
