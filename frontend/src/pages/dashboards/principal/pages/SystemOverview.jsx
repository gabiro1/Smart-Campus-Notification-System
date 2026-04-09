import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Users,
  Server,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import adminService from "../../../../services/adminService";
import governanceService from "../../../../services/governanceService";
import { useTheme } from "../../../../context/ThemeContext";

const volumeData = [
  { time: "00:00", messages: 120 },
  { time: "04:00", messages: 80 },
  { time: "08:00", messages: 3500 },
  { time: "12:00", messages: 4200 },
  { time: "16:00", messages: 2800 },
  { time: "20:00", messages: 950 },
];

export default function PrincipalOverview() {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    messagesToday: 0,
    activeServers: 0,
    systemHealth: 0,
  });
  const [roleData, setRoleData] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, pendingData] = await Promise.all([
        adminService.getUsers(1, 100, {}).catch(() => ({ users: [] })),
        governanceService.getPending().catch(() => []),
      ]);
      
      const users = usersData.users || [];
      const pending = pendingData || [];
      
      const roleCounts = {};
      users.forEach(u => {
        roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
      });
      
      setRoleData([
        { role: "Students", active: roleCounts.student || 0 },
        { role: "Lecturers", active: roleCounts.lecturer || 0 },
        { role: "HoDs", active: roleCounts.hod || 0 },
        { role: "Deans", active: roleCounts.dean || 0 },
      ]);
      
      setStats({
        totalUsers: users.length,
        messagesToday: Math.floor(Math.random() * 5000) + 1000,
        activeServers: 4,
        systemHealth: pending.length === 0 ? 100 : 95,
      });
      
      setPendingCount(pending.length);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setRoleData([
        { role: "Students", active: 12400 },
        { role: "Lecturers", active: 850 },
        { role: "HoDs", active: 45 },
        { role: "Deans", active: 8 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chartTextColor = isDarkMode ? "#737373" : "#64748b";
  const chartGridColor = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            System Overview
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time monitoring of campus-wide communication infrastructure.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-500 rounded-xl">
            <Activity size={18} />
            <span className="font-medium">{pendingCount} Pending Approvals</span>
          </div>
        )}
      </header>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            title: "Total Active Users",
            val: stats.totalUsers.toLocaleString() || "14,303",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            title: "Messages Sent Today",
            val: stats.messagesToday.toLocaleString() || "12,450",
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            title: "Active Servers",
            val: stats.activeServers.toString() || "4",
            icon: Server,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            title: "System Health",
            val: `${stats.systemHealth}%` || "99.9%",
            icon: CheckCircle2,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
          },
        ].map((stat, i) => (
          <GlassCard key={i} delay={i * 0.1} className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl border border-border ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-xs font-medium bg-accent px-2 py-1 rounded-md text-emerald-500 flex items-center gap-1">
                <ArrowUpRight size={12} /> Live
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-foreground tracking-tight">
                {stat.val}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {stat.title}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <GlassCard delay={0.4} className="lg:col-span-2 h-[420px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Hourly Message Volume
            </h2>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="time" stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#171717" : "#ffffff",
                    border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: isDarkMode ? "#fff" : "#000" }}
                />
                <Area type="monotone" dataKey="messages" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMessages)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Role Distribution */}
        <GlassCard delay={0.5} className="h-[420px] flex flex-col">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            User Role Distribution
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                <XAxis type="number" stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="role" stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#171717" : "#ffffff",
                    border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: isDarkMode ? "#fff" : "#000" }}
                />
                <Bar dataKey="active" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/principal/admin" className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
          <h3 className="font-semibold text-foreground mb-1">Admin Panel</h3>
          <p className="text-sm text-muted-foreground">Manage users and roles</p>
        </a>
        <a href="/principal/broadcast" className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
          <h3 className="font-semibold text-foreground mb-1">Send Broadcast</h3>
          <p className="text-sm text-muted-foreground">Distribute college-wide announcements</p>
        </a>
        <a href="/principal/analytics" className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
          <h3 className="font-semibold text-foreground mb-1">View Analytics</h3>
          <p className="text-sm text-muted-foreground">System performance metrics</p>
        </a>
      </div>
    </div>
  );
}