import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  BellRing,
  Send,
  Activity,
  AlertTriangle,
  Mail,
  BarChart3,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import GreetingSection from "../../../components/dashboards/GreetingSection";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import adminService from "../../../services/adminService";

const colorMap = {
  blue: { text: "text-blue-400", iconBg: "bg-blue-500/10" },
  green: { text: "text-green-400", iconBg: "bg-green-500/10" },
  amber: { text: "text-amber-400", iconBg: "bg-amber-500/10" },
  red: { text: "text-red-400", iconBg: "bg-red-500/10" },
  purple: { text: "text-purple-400", iconBg: "bg-purple-500/10" },
};

function StatCardSkeleton({ children, className = "" }) {
  return (
    <motion.div
      className={`bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default function SystemOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    metrics: null,
    trends: null,
    usersByRole: [],
    usersBySchool: [],
    notificationStats: null,
    eventStats: [],
    recentNotifications: [],
    recentBroadcasts: [],
    dailyVolume: [],
    typeDistribution: [],
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
          trends: metricsRes.trends,
          usersByRole: metricsRes.usersByRole || [],
          usersBySchool: metricsRes.usersBySchool || [],
          notificationStats: metricsRes.notificationStats || {
            total: 0,
            read: 0,
            unread: 0,
          },
          eventStats: formattedEventStats,
          recentNotifications: metricsRes.recentNotifications || [],
          recentBroadcasts: metricsRes.recentBroadcasts || [],
          dailyVolume: metricsRes.dailyVolume || [],
          typeDistribution: metricsRes.typeDistribution || [],
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data. Please try again."
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
          <Activity size={40} className="animate-spin text-blue-400" />
          <p className="text-neutral-400 font-medium uppercase tracking-widest text-xs">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-[80vh] flex items-center justify-center p-8 w-full">
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-400 p-8 rounded-2xl text-center max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <AlertTriangle className="mx-auto mb-4" size={40} />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const t = data.trends || {};
  const formatTrend = (val) => {
    if (val === null || val === undefined) return '\u2014';
    const prefix = val >= 0 ? '+' : '';
    return `${prefix}${val}%`;
  };

  const stats = [
    {
      label: "Total Users",
      value: data.metrics?.totalUsers || 0,
      trend: formatTrend(t.users),
      trendUp: (t.users || 0) >= 0,
      icon: Users,
      color: "blue",
    },
    {
      label: "Active Events",
      value: data.metrics?.totalEvents || 0,
      trend: formatTrend(t.events),
      trendUp: (t.events || 0) >= 0,
      icon: Calendar,
      color: "green",
    },
    {
      label: "Pending Alerts",
      value: data.notificationStats?.unread || 0,
      trend: formatTrend(t.messages),
      trendUp: (t.messages || 0) >= 0,
      icon: BellRing,
      color: "amber",
    },
    {
      label: "Notifications",
      value: data.metrics?.totalNotifications || 0,
      trend: `${data.metrics?.todayNotifications || 0} today`,
      trendUp: true,
      icon: Send,
      color: "purple",
    },
  ];

  const notifications = data.recentNotifications;

  const recentSent = data.recentBroadcasts;

  const quickActions = [
    { icon: Mail, label: "New Notification", color: "text-blue-400", path: "/admin/notifications?compose=true" },
    { icon: Calendar, label: "Events", color: "text-amber-400", path: "/admin/events" },
    { icon: Users, label: "Manage Users", color: "text-green-400", path: "/admin/users" },
    { icon: BarChart3, label: "View Reports", color: "text-neutral-400", path: "/admin/analytics" },
  ];

  const categories = data.typeDistribution.length > 0
    ? data.typeDistribution
    : [
        { label: "Info", percent: 0, color: "bg-blue-500" },
        { label: "Alerts", percent: 0, color: "bg-amber-500" },
        { label: "Success", percent: 0, color: "bg-green-500" },
        { label: "Events", percent: 0, color: "bg-purple-500" },
        { label: "Actions", percent: 0, color: "bg-red-500" },
      ];

  return (
    <div className="p-8 w-full text-white space-y-6">
      {/* Greeting */}
      <GreetingSection subtitle="Manage campus notifications, users, and system settings." />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <StatCardSkeleton key={i}>
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl border border-white/5 ${colorMap[stat.color].iconBg}`}>
                <stat.icon size={20} className={colorMap[stat.color].text || "text-white"} />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 ${
                  stat.trendUp
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                <TrendingUp size={12} />
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </h3>
              <p className="text-sm text-neutral-400 font-medium mt-1">
                {stat.label}
              </p>
            </div>
          </StatCardSkeleton>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-3 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden h-[420px] flex flex-col"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="relative z-10 flex flex-col h-full p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
              <h3 className="text-lg font-semibold text-white">Notification Activity — Last 7 Days</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>Sent
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-200"></span>Read
                  </span>
                </div>
                <select className="bg-black/40 border border-white/10 text-xs text-neutral-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500/50">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Semester</option>
                </select>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyVolume.length > 0 ? data.dailyVolume : [
                  { day: 'Mon', sent: 0, read: 0 },
                  { day: 'Tue', sent: 0, read: 0 },
                  { day: 'Wed', sent: 0, read: 0 },
                  { day: 'Thu', sent: 0, read: 0 },
                  { day: 'Fri', sent: 0, read: 0 },
                  { day: 'Sat', sent: 0, read: 0 },
                  { day: 'Sun', sent: 0, read: 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    contentStyle={{
                      backgroundColor: '#171717',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="read" fill="#bfdbfe" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          className="lg:col-span-2 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden flex flex-col h-[420px] p-0"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="relative z-10 p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Recent Notifications</h3>
          </div>
          <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        notif.type === 'urgent' ? 'bg-red-500/10 text-red-400' :
                        notif.type === 'info' ? 'bg-blue-500/10 text-blue-400' :
                        notif.type === 'success' ? 'bg-green-500/10 text-green-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {notif.type}
                    </span>
                    <span className="text-[10px] text-neutral-500">{notif.time}</span>
                  </div>
                  <p className="text-sm text-neutral-300 font-medium">{notif.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">{notif.recipients} recipients</p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-neutral-500">No recent notifications</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Sent Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="lg:col-span-3 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 gap-2">
              <h3 className="text-lg font-semibold text-white">Recently Sent Notifications</h3>
              <button
                onClick={() => navigate("/admin/notifications")}
                className="text-xs text-blue-400 hover:text-blue-300 self-start sm:self-center flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-400 border-b border-white/5">
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Audience</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium hidden md:table-cell">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSent.map((item, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0">
                      <td className="px-6 py-3 font-medium text-white">{item.title}</td>
                      <td className="px-6 py-3 text-neutral-400">{item.category}</td>
                      <td className="px-6 py-3 text-neutral-400 hidden sm:table-cell">{item.audience}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' :
                          item.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          item.status === 'draft' ? 'bg-neutral-500/10 text-neutral-400' :
                          item.status === 'archived' ? 'bg-neutral-500/10 text-neutral-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-neutral-400 hidden md:table-cell">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions + Categories */}
        <div className="lg:col-span-2 space-y-5 lg:space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
            className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="relative z-10">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(action.path)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-sm"
                    >
                      <action.icon size={16} className={`${action.color} shrink-0`} />
                      <span className="text-neutral-300 truncate">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* By Category */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="relative z-10">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">By Category</h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                      <span className="flex-1 text-sm text-neutral-400">{cat.label}</span>
                      <span className="text-sm font-medium text-white">{cat.percent}%</span>
                      <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat.color}`}
                          style={{ width: `${Math.min(cat.percent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
