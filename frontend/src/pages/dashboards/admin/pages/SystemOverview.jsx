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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsRes, analyticsRes] = await Promise.all([
          adminService.getDashboardMetrics(),
          adminService.getAnalytics(),
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
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">
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
        <p className="text-neutral-500 mt-1">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 p-6 rounded-[24px] shadow-2xl"
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
            className="bg-[#0D0D0D] border border-white/5 p-6 rounded-[24px] shadow-xl"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieIcon size={18} className="text-purple-500" /> Read Engagement
            </h3>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black text-purple-400 tracking-tighter">
                {readRate}%
              </span>
              <span className="text-sm text-neutral-500 mb-2 font-bold uppercase tracking-widest">
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
                color="text-neutral-500"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0D0D0D] border border-white/5 p-6 rounded-[24px] shadow-xl"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-green-500" /> User Roles
            </h3>
            <div className="space-y-2">
              {data.usersByRole.map((roleObj, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors rounded-xl border border-white/5"
                >
                  <span className="text-sm font-medium uppercase tracking-wider text-neutral-400 text-[11px]">
                    {roleObj._id}
                  </span>
                  <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
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
      className="bg-[#0D0D0D] border border-white/5 p-6 rounded-[24px] shadow-xl cursor-pointer transition-colors hover:border-white/10 flex flex-col justify-between min-h-[140px]"
    >
      <div className="flex justify-between items-start mb-4 gap-2">
        <h4 className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold leading-snug w-2/3">
          {title}
        </h4>
        <div
          className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-black tracking-tighter text-white">
          {value ? value.toLocaleString() : 0}
        </p>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value = 0, color }) {
  return (
    <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
      <span className="text-sm text-neutral-400 font-medium">{label}</span>
      <span className={`text-sm font-black ${color}`}>
        {value ? value.toLocaleString() : 0}
      </span>
    </div>
  );
}
