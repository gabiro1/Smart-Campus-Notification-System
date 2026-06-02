import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Building2, Layers, Users, UserCheck, UserX,
  Loader2, TrendingUp,
} from "lucide-react";
import registrarService from "../../../../services/registrarService";

const COLORS = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-purple-500 to-purple-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-violet-500 to-violet-600",
];

export default function EnrollmentStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrarService.getEnrollmentStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Enrollment Statistics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.total?.toLocaleString()} total enrolled students
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Students", value: stats.total, icon: Users, color: "from-blue-500 to-blue-600" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "from-emerald-500 to-emerald-600" },
          { label: "Suspended", value: stats.suspended, icon: UserX, color: "from-red-500 to-red-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
              <Icon className="text-white" size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-blue-500" />
            <h2 className="font-semibold text-foreground">Department Distribution</h2>
          </div>
          <div className="space-y-3">
            {stats.byDepartment?.length > 0 ? (
              stats.byDepartment.map((d, i) => {
                const pct = stats.total > 0 ? ((d.count / stats.total) * 100).toFixed(1) : 0;
                return (
                  <div key={d.code || i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{d.department}</span>
                      <span className="text-muted-foreground font-mono">{d.count} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-accent rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${COLORS[i % COLORS.length]}`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No department data</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-purple-500" />
            <h2 className="font-semibold text-foreground">Level Distribution</h2>
          </div>
          <div className="space-y-3">
            {stats.byLevel?.length > 0 ? (
              stats.byLevel.map((l, i) => {
                const pct = stats.total > 0 ? ((l.count / stats.total) * 100).toFixed(1) : 0;
                return (
                  <div key={l._id || i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground capitalize">Level {l._id}</span>
                      <span className="text-muted-foreground font-mono">{l.count} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-accent rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${COLORS[(i + 3) % COLORS.length]}`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No level data</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-emerald-500" />
          <h2 className="font-semibold text-foreground">Summary</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Departments", value: stats.byDepartment?.length || 0 },
            { label: "Levels", value: stats.byLevel?.length || 0 },
            { label: "Active Rate", value: stats.total > 0 ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : "0%" },
            { label: "Suspension Rate", value: stats.total > 0 ? `${((stats.suspended / stats.total) * 100).toFixed(1)}%` : "0%" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-accent/50 rounded-lg p-4">
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
