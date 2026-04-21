import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  Trophy,
  Building2,
  Users,
  Bell,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import adminService from "../../../../services/adminService";
import toast from "react-hot-toast";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];

export default function PrincipalReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalAnnouncements: 0,
    engagement: 0,
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, deptRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getEngagementByDepartment(),
      ]);

      const formattedTrends = (analyticsRes.eventStats || []).slice(-7).map((stat) => ({
        name: stat._id?.slice(5) || "N/A",
        events: stat.count || 0,
      }));

      const formattedDepts = (deptRes.departments || []).map((dept, idx) => ({
        name: dept.department?.slice(0, 8) || `Dept ${idx + 1}`,
        users: dept.totalUsers || 0,
        readRate: parseFloat(dept.readRate) || 0,
      }));

      setTrends(formattedTrends);
      setDepartmentData(formattedDepts);
      setStats({
        totalUsers: analyticsRes.totalUsers || 0,
        totalEvents: analyticsRes.eventStats?.reduce((s, e) => s + e.count, 0) || 0,
        totalAnnouncements: analyticsRes.totalAnnouncements || 0,
        engagement: analyticsRes.userEngagement?.totalSent > 0
          ? Math.round((analyticsRes.userEngagement.totalRead / analyticsRes.userEngagement.totalSent) * 100)
          : 0,
      });
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            College Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive college-wide analytics and performance metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-accent hover:bg-white/10 border border-border text-neutral-300 hover:text-foreground px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
            <FileSpreadsheet size={14} /> <span className="hidden sm:inline">CSV</span>
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
            <Download size={14} /> <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </header>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard delay={0.1} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Total Users</p>
              <p className="text-xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Total Events</p>
              <p className="text-xl font-bold text-foreground">{stats.totalEvents.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Announcements</p>
              <p className="text-xl font-bold text-foreground">{stats.totalAnnouncements.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.25} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Engagement</p>
              <p className="text-xl font-bold text-foreground">{stats.engagement}%</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Department Engagement Chart */}
        <GlassCard delay={0.3} className="h-[300px] sm:h-[400px] flex flex-col p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Building2 size={18} className="text-emerald-400" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Department Performance
            </h3>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" stroke="#666" tick={{ fontSize: 11 }} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#666" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }}
                  formatter={(value) => [`${value} users`]}
                />
                <Bar dataKey="users" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Event Trends Chart */}
        <GlassCard delay={0.35} className="h-[300px] sm:h-[400px] flex flex-col p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <TrendingUp size={18} className="text-blue-400" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Event Trends (Last 7 Days)
            </h3>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorEvent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 11 }} axisLine={false} />
                <YAxis stroke="#666" tick={{ fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }}
                  formatter={(value) => [`${value} events`]}
                />
                <Area type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} fill="url(#colorEvent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <GlassCard delay={0.4} className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Trophy size={18} className="text-amber-400" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Top Departments</h3>
          </div>
          <div className="space-y-3">
            {departmentData.slice(0, 5).map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                    {idx + 1}
                  </div>
                  <span className="font-medium text-foreground">{dept.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{dept.users} users</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.45} className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <FileText size={18} className="text-emerald-400" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Quick Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-400">{departmentData.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Departments</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.engagement}%</p>
              <p className="text-xs text-muted-foreground mt-1">Read Rate</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}