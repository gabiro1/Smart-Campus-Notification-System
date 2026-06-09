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
  PieChart as PieIcon,
  Mail,
  AlertCircle,
  BarChart3,
  ChevronRight,
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
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  green: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
  amber: { bg: "bg-amber-500/10", textAmber: "text-amber-500", border: "border-amber-500/20" },
  red: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
};

export default function SystemOverview() {
  const navigate = useNavigate();
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
          <Activity size={40} className="animate-spin text-blue-500" />
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-[80vh] flex items-center justify-center p-8 w-full">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-8 rounded-xl text-center max-w-md">
          <AlertTriangle className="mx-auto mb-4" size={40} />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: data.metrics?.totalUsers || 0,
      trend: "+12%",
      trendUp: true,
      icon: Users,
      color: "blue",
    },
    {
      label: "Active Events",
      value: data.metrics?.totalEvents || 0,
      trend: "+5%",
      trendUp: true,
      icon: Calendar,
      color: "green",
    },
    {
      label: "Pending Alerts",
      value: data.notificationStats?.unread || 0,
      trend: "3 open",
      trendUp: false,
      icon: BellRing,
      color: "amber",
    },
    {
      label: "Notifications",
      value: data.metrics?.totalNotifications || 0,
      trend: "+8%",
      trendUp: true,
      icon: Send,
      color: "purple",
    },
  ];

  const notifications = [
    { id: 1, title: "Campus Water Outage — Block C", type: "urgent", time: "10 min ago", recipients: "1,240", dot: "bg-red-500" },
    { id: 2, title: "Final Exam Schedule Released", type: "info", time: "1 hr ago", recipients: "3,200", dot: "bg-blue-500" },
    { id: 3, title: "Library Extended Hours — Exam Week", type: "success", time: "3 hrs ago", recipients: "3,712", dot: "bg-green-500" },
    { id: 4, title: "Parking Lot A Closed for Maintenance", type: "warning", time: "5 hrs ago", recipients: "600", dot: "bg-amber-500" },
  ];

  const recentSent = [
    { title: "Campus Water Outage", category: "Facilities", audience: "All Users", status: "urgent", time: "Today 09:14" },
    { title: "Exam Schedule", category: "Academic", audience: "Students", status: "sent", time: "Today 08:30" },
    { title: "Library Hours", category: "General", audience: "All Users", status: "sent", time: "Today 06:00" },
    { title: "Sports Day Reminder", category: "Events", audience: "All Users", status: "pending", time: "Scheduled" },
    { title: "Fee Payment Deadline", category: "Finance", audience: "Students", status: "draft", time: "—" },
  ];

  const quickActions = [
    { icon: Mail, label: "New Notification", color: "text-blue-500", path: "/admin/notifications?compose=true" },
    { icon: Calendar, label: "Events", color: "text-amber-500", path: "/admin/events" },
    { icon: Users, label: "Manage Users", color: "text-green-500", path: "/admin/users" },
    { icon: BarChart3, label: "View Reports", color: "text-muted-foreground", path: "/admin/analytics" },
  ];

  const categories = [
    { label: "Academic", percent: 35, color: "bg-blue-500" },
    { label: "Facilities", percent: 25, color: "bg-green-500" },
    { label: "Events", percent: 20, color: "bg-amber-500" },
    { label: "Student Life", percent: 12, color: "bg-purple-500" },
    { label: "Finance", percent: 8, color: "bg-red-500" },
  ];

  return (
    <div className="p-4 lg:p-6 w-full text-foreground space-y-5">
      {/* Greeting */}
      <GreetingSection subtitle="Manage campus notifications, users, and system settings." />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-3 sm:p-4"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${colorMap[stat.color].bg}`}>
                <stat.icon size={16} className={colorMap[stat.color].text} />
              </div>
              <span className={`text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${
                stat.trendUp ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-foreground mb-0.5">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div className="text-[11px] sm:text-[12px] text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-border gap-2">
            <h3 className="text-[13px] font-medium">Notification Activity — Last 7 Days</h3>
            <button className="text-[12px] text-blue-500 hover:underline self-start sm:self-center">Export</button>
          </div>
          <div className="p-3 sm:p-4">
            <div className="flex gap-3 sm:gap-4 mb-3 text-[11px] sm:text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded bg-blue-500"></span>Sent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded bg-blue-200"></span>Read
              </span>
            </div>
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { day: 'Mon', sent: 38, read: 30 },
                  { day: 'Tue', sent: 62, read: 50 },
                  { day: 'Wed', sent: 45, read: 38 },
                  { day: 'Thu', sent: 78, read: 65 },
                  { day: 'Fri', sent: 55, read: 44 },
                  { day: 'Sat', sent: 90, read: 74 },
                  { day: 'Sun', sent: 68, read: 55 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="read" fill="#bfdbfe" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-3 sm:p-4 border-b-0">
            <h3 className="text-[13px] font-medium">Recent Notifications</h3>
            <button className="text-[12px] text-blue-500 hover:underline">View all</button>
          </div>
          <div>
            {notifications.map((notif) => (
              <div key={notif.id} className="flex gap-3 p-3 sm:p-4 hover:bg-accent/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${notif.dot}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground truncate">{notif.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-1 ${
                      notif.type === 'urgent' ? 'bg-red-500/10 text-red-500' :
                      notif.type === 'info' ? 'bg-blue-500/10 text-blue-500' :
                      notif.type === 'success' ? 'bg-green-500/10 text-green-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {notif.type}
                    </span>
                    {notif.time} · {notif.recipients} recipients
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Sent Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-border gap-2">
            <h3 className="text-[13px] font-medium">Recently Sent Notifications</h3>
            <button 
              onClick={() => navigate("/admin/notifications")}
              className="text-[12px] text-blue-500 hover:text-blue-400 self-start sm:self-center flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b-0">
                  <th className="px-3 sm:px-4 py-3 font-medium">Title</th>
                  <th className="px-3 sm:px-4 py-3 font-medium">Category</th>
                  <th className="px-3 sm:px-4 py-3 font-medium hidden sm:table-cell">Audience</th>
                  <th className="px-3 sm:px-4 py-3 font-medium">Status</th>
                  <th className="px-3 sm:px-4 py-3 font-medium hidden md:table-cell">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {recentSent.map((item, i) => (
                  <tr key={i} className="hover:bg-accent/50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-3 sm:px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-3 sm:px-4 py-3 text-muted-foreground hidden sm:table-cell">{item.audience}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        item.status === 'sent' ? 'bg-green-500/10 text-green-500' :
                        item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                        item.status === 'draft' ? 'bg-muted text-muted-foreground' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-muted-foreground hidden md:table-cell">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions + Categories */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-5">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="p-3 sm:p-4 border-b border-border">
              <h3 className="text-[13px] font-medium">Quick Actions</h3>
            </div>
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border border-border hover:bg-accent transition-colors text-[11px] sm:text-[12px]"
                  >
                    <action.icon size={14} className={action.color} />
                    <span className="text-foreground truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* By Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="p-3 sm:p-4 border-b border-border">
              <h3 className="text-[13px] font-medium">By Category</h3>
            </div>
            <div className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-2.5">
                {categories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${cat.color}`}></span>
                    <span className="flex-1 text-[11px] sm:text-[12px] text-muted-foreground">{cat.label}</span>
                    <span className="text-[11px] sm:text-[12px] font-medium text-foreground">{cat.percent}%</span>
                    <div className="w-16 sm:w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full`}
                        style={{ width: `${cat.percent * 2}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
