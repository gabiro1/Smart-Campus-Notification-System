import { GlassCard } from "@/components/shared";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp, Users, Bell, Calendar,
  Building2, RefreshCw, Loader2,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import {
  useDepartmentAnalytics,
  useCommunicationTrends,
} from "../hooks/usePrincipalDashboard";

function SkeletonChart({ height = "h-[380px]" }) {
  return (
    <GlassCard className={`flex flex-col gap-4 ${height} p-6`}>
      <div className="animate-pulse rounded-lg bg-accent/50 w-1/3 h-5" />
      <div className="animate-pulse flex-1 rounded-lg bg-accent/50" />
    </GlassCard>
  );
}

export default function ReportsAnalytics() {
  const { isDarkMode } = useTheme();
  const { data: deptData, isLoading: deptLoading } = useDepartmentAnalytics();
  const { data: trendData, isLoading: trendLoading } = useCommunicationTrends(7);

  const chartColors = {
    text: isDarkMode ? "#737373" : "#64748b",
    grid: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    tooltipBg: {
      backgroundColor: isDarkMode ? "#171717" : "#ffffff",
      border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      borderRadius: "12px",
    },
    tooltipLabel: isDarkMode ? "#fff" : "#000",
    tooltipItem: isDarkMode ? "#fff" : "#000",
  };

  const departments = deptData?.departments || [];
  const deptChart = departments.map((d) => ({
    name: d.name?.slice(0, 8) || "N/A",
    readRate: d.readRate || 0,
  })).sort((a, b) => b.readRate - a.readRate);

  const dailyVolume = trendData?.dailyVolume || [];
  const summary = trendData?.summary || {};

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Institutional performance metrics and trends
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Departments</p>
              <p className="text-xl font-bold text-foreground">{deptData?.totalDepartments || departments.length}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Avg Read Rate</p>
              <p className="text-xl font-bold text-foreground">{deptData?.avgReadRate || 0}%</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Total Sent (7d)</p>
              <p className="text-xl font-bold text-foreground">{summary.totalNotifications?.toLocaleString() || 0}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Daily Avg</p>
              <p className="text-xl font-bold text-foreground">{summary.avgDaily || 0}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deptLoading ? <SkeletonChart /> : (
          <GlassCard className="h-[380px] flex flex-col p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 size={18} className="text-emerald-400" />
              <h3 className="text-lg font-semibold text-foreground">Department Read Rates</h3>
            </div>
            <div className="flex-1 min-h-0">
              {deptChart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No department data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChart} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke={chartColors.text} fontSize={10} tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={chartColors.tooltipBg} labelStyle={{ color: chartColors.tooltipLabel }}
                      formatter={(val) => [`${val}%`, "Read Rate"]} />
                    <Bar dataKey="readRate" radius={[0, 4, 4, 0]} barSize={20}>
                      {deptChart.map((d, i) => (
                        <Cell key={i} fill={d.readRate >= 70 ? "#10b981" : d.readRate >= 40 ? "#f59e0b" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        )}

        {trendLoading ? <SkeletonChart /> : (
          <GlassCard className="h-[380px] flex flex-col p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={18} className="text-blue-400" />
              <h3 className="text-lg font-semibold text-foreground">Notification Volume (7 Days)</h3>
            </div>
            <div className="flex-1 min-h-0">
              {dailyVolume.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No notification data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyVolume}>
                    <defs>
                      <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="date" stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartColors.tooltipBg} labelStyle={{ color: chartColors.tooltipLabel }}
                      formatter={(val) => [`${val} notifications`]} />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#volFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {!deptLoading && departments.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 size={14} className="text-emerald-400" />
            Top Departments by Read Rate
          </h3>
          <div className="space-y-2">
            {[...departments].sort((a, b) => b.readRate - a.readRate).slice(0, 5).map((dept, i) => (
              <div key={dept.id || i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/50">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444"][i] }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{dept.name}</span>
                </div>
                <span className="text-xs font-medium text-foreground">{dept.readRate}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
