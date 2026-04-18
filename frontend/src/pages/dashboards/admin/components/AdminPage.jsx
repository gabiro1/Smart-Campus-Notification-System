import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Bell,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Mail,
  Settings,
  Activity,
} from "lucide-react";

export default function AdminPage({ title, children, stats = [] }) {
  return (
    <div className="p-4 lg:p-6 w-full text-foreground space-y-5">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
      </motion.div>

      {/* Stats Row */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                {stat.trend && (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    stat.trendUp ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="text-2xl font-semibold text-foreground mb-0.5">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-[12px] text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Page Content */}
      {children}
    </div>
  );
}
