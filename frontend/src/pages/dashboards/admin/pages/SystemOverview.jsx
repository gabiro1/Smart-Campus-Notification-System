import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  BellRing,
  Send,
  Activity,
  AlertTriangle,
  PieChart as PieIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import adminService from "../../../../services/adminService";
// Removed NotificationCenter and Search import from here

export default function SystemOverview() {
  const [data, setData] = useState({
    metrics: null,
    usersByRole: [],
    usersBySchool: [],
    notificationStats: null,
    eventStats: [],
  });
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsRes, analyticsRes, emergenciesRes] = await Promise.all([
          adminService.getDashboardMetrics(),
          adminService.getAnalytics(),
          adminService.getActiveEmergencies(),
        ]);

        const formattedEventStats =
          analyticsRes.eventStats?.map((item) => ({
            date: item._id,
            events: item.count,
          })) || [];

        setData({
          metrics: metricsRes.metrics,
          usersByRole: metricsRes.usersByRole || [],
          usersBySchool: metricsRes.usersBySchool || [],
          notificationStats: metricsRes.notificationStats || {
            total: 0,
            read: 0,
            unread: 0,
          },
          eventStats: formattedEventStats,
        });

        setActiveEmergencies(emergenciesRes.activeEmergencies || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full min-h-[80vh] flex items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4">
          <Activity size={40} className="animate-spin text-blue-500" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Syncing Data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-[80vh] flex items-center justify-center p-8 w-full">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-8 rounded-2xl max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4" size={40} />
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const readRate =
    data.notificationStats.total > 0
      ? (
          (data.notificationStats.read / data.notificationStats.total) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="p-8 lg:p-12 w-full">
      {/* REMOVED THE TOPBAR FROM HERE */}

      {/* Main Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-black tracking-tight">System Overview</h1>
        <p className="text-muted-foreground mt-1">
          Real-time pulse of the Smart Campus Notification System.
        </p>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Users"
          value={data.metrics?.totalUsers}
          icon={<Users size={20} />}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <KPICard
          title="Active Events"
          value={data.metrics?.totalEvents}
          icon={<Calendar size={20} />}
          color="text-green-500"
          bg="bg-green-500/10"
        />
        <KPICard
          title="Reminders Set"
          value={data.metrics?.totalReminders}
          icon={<BellRing size={20} />}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <KPICard
          title="Notifications Sent"
          value={data.metrics?.totalNotifications}
          icon={<Send size={20} />}
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
      </div>

      {/* Active Emergency Alerts Section */}
      {activeEmergencies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" />
              <span className="text-red-500">Active Emergency Alerts</span>
            </h2>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Live acknowledgment status
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEmergencies.map((emergency) => (
              <div
                key={emergency._id}
                className="bg-gradient-to-br from-red-900/20 to-orange-900/10 border border-red-500/20 p-6 rounded-2xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-foreground mb-1 line-clamp-2">
                      {emergency.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      By {emergency.lecturer} • {new Date(emergency.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-red-400">
                      {emergency.stats.acknowledgedRate}%
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Acknowledged
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">
                      {emergency.stats.acknowledged} of {emergency.stats.totalSent} users
                    </span>
                    <span className={emergency.stats.pending > 0 ? "text-amber-400" : "text-green-500"}>
                      {emergency.stats.pending > 0 ? `${emergency.stats.pending} pending` : "Complete"}
                    </span>
                  </div>
                  <div className="h-3 bg-accent rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${emergency.stats.acknowledgedRate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        emergency.stats.acknowledgedRate >= 80
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : emergency.stats.acknowledgedRate >= 50
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                          : "bg-gradient-to-r from-red-500 to-rose-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-card border border-border p-6 rounded-[24px] shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Event Creation
              Trends
            </h3>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.eventStats}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff05"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    padding: "12px",
                  }}
                  itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEvents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Side Panels */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border p-6 rounded-[24px] shadow-xl"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieIcon size={18} className="text-purple-500" /> Read Engagement
            </h3>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black text-purple-400 tracking-tighter">
                {readRate}%
              </span>
              <span className="text-sm text-muted-foreground mb-2 font-bold uppercase tracking-widest">
                Rate
              </span>
            </div>
            <div className="space-y-3">
              <StatRow
                label="Read Notifications"
                value={data.notificationStats.read}
                color="text-green-500"
              />
              <StatRow
                label="Unread Notifications"
                value={data.notificationStats.unread}
                color="text-muted-foreground"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border p-6 rounded-[24px] shadow-xl"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-green-500" /> User Roles
            </h3>
            <div className="space-y-2">
              {data.usersByRole.map((roleObj, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors rounded-xl border border-border"
                >
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground text-[11px]">
                    {roleObj._id}
                  </span>
                  <span className="text-sm font-bold text-foreground bg-accent px-3 py-1 rounded-lg">
                    {roleObj.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value = 0, icon, color, bg }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card border border-border p-6 rounded-[24px] shadow-xl cursor-pointer transition-colors hover:border-border flex flex-col justify-between min-h-[140px]"
    >
      <div className="flex justify-between items-start mb-4 gap-2">
        <h4 className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold leading-snug w-2/3">
          {title}
        </h4>
        <div
          className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-black tracking-tighter text-foreground">
          {value ? value.toLocaleString() : 0}
        </p>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value = 0, color }) {
  return (
    <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-border">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={`text-sm font-black ${color}`}>
        {value ? value.toLocaleString() : 0}
      </span>
    </div>
  );
}
