/**
 * Professional Data Visualization Components
 * Enhanced chart wrappers and data display components
 */

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export function DataPoint({ label, value, trend, color = "blue" }) {
  const isTrendUp = trend > 0;
  const colorClass = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    red: "text-red-400",
  }[color];

  return (
    <motion.div
      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
      whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <p className="text-xs text-neutral-500 uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {isTrendUp ? (
          <TrendingUp size={20} className="text-green-400" />
        ) : (
          <TrendingDown size={20} className="text-red-400" />
        )}
        <span
          className={
            isTrendUp ? "text-green-400 text-xs" : "text-red-400 text-xs"
          }
        >
          {Math.abs(trend)}%
        </span>
      </div>
    </motion.div>
  );
}

export function ProgressBar({ label, value, max = 100, color = "blue" }) {
  const percentage = (value / max) * 100;

  const colorClass = {
    blue: "from-blue-600 to-blue-400",
    green: "from-green-600 to-green-400",
    purple: "from-purple-600 to-purple-400",
    amber: "from-amber-600 to-amber-400",
    red: "from-red-600 to-red-400",
  }[color];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-white">{label}</label>
        <span className="text-xs text-neutral-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function ActivityIndicator({ items = [], max = 5 }) {
  return (
    <div className="space-y-3">
      {items.slice(0, max).map((item, idx) => (
        <motion.div
          key={idx}
          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-blue-500"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{item.title}</p>
            <p className="text-xs text-neutral-500">{item.time}</p>
          </div>
          {item.badge && (
            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
              {item.badge}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function MetricCard({
  title,
  metric,
  description,
  icon: Icon,
  gradient = "from-blue-600 to-blue-400",
}) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${gradient} border border-white/10`}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/70 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{metric}</p>
          <p className="text-white/60 text-xs">{description}</p>
        </div>
        {Icon && (
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Icon size={32} className="text-white/40" />
          </motion.div>
        )}
      </div>

      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.div>
  );
}

export default {
  DataPoint,
  ProgressBar,
  ActivityIndicator,
  MetricCard,
};
