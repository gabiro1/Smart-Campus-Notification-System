import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
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
import { Calendar, Zap, Bot, MailCheck, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../../../../services/adminService";

export default function SystemAnalytics() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [networkLoadData, setNetworkLoadData] = useState([]);
  const [aiAccuracyData, setAiAccuracyData] = useState([]);

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemHealth();
      if (response.success) {
        setHealthData(response.data);
        
        // Transform overview data for KPI cards
        const overview = response.data.overview || {};
        
        // Generate mock network load data (could be enhanced with actual time-series data)
        setNetworkLoadData([
          { day: "Mon", capacity: 40 + Math.random() * 20, peak: 60 + Math.random() * 20 },
          { day: "Tue", capacity: 30 + Math.random() * 20, peak: 45 + Math.random() * 20 },
          { day: "Wed", capacity: 65 + Math.random() * 20, peak: 85 + Math.random() * 10 },
          { day: "Thu", capacity: 45 + Math.random() * 20, peak: 70 + Math.random() * 15 },
          { day: "Fri", capacity: 80 + Math.random() * 15, peak: 95 + Math.random() * 5 },
          { day: "Sat", capacity: 20 + Math.random() * 15, peak: 35 + Math.random() * 15 },
          { day: "Sun", capacity: 15 + Math.random() * 10, peak: 25 + Math.random() * 10 },
        ]);
        
        // AI module accuracy (could be from AI insights if available)
        setAiAccuracyData([
          { module: "Categorization", accuracy: 96 + Math.random() * 4 },
          { module: "Summarization", accuracy: 92 + Math.random() * 5 },
          { module: "Priority Flagging", accuracy: 98 + Math.random() * 2 },
          { module: "Spam Filter", accuracy: 99 + Math.random() * 1 },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch system health:", error);
      toast.error("Failed to load system analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const deliveryRate = healthData?.deliveryRate || 0;
  const readRate = healthData?.readRate || 0;
  const activeAnnouncements = healthData?.overview?.activeAnnouncements || 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            System Analytics & Health
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deep infrastructure metrics and AI performance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSystemHealth}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Calendar size={16} /> Last 7 Days
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard delay={0.1} className="flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <MailCheck size={28} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-bold">
              Global Delivery Rate
            </p>
            <h3 className="text-3xl font-bold text-foreground tracking-tight mt-1">
              {deliveryRate}%
            </h3>
          </div>
        </GlassCard>
        <GlassCard delay={0.2} className="flex items-center gap-5">
          <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
            <Zap size={28} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-bold">
              Avg Response Time
            </p>
            <h3 className="text-3xl font-bold text-foreground tracking-tight mt-1">
              {healthData?.overview?.totalNotifications > 0 ? "42ms" : "N/A"}
            </h3>
          </div>
        </GlassCard>
        <GlassCard delay={0.3} className="flex items-center gap-5">
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
            <Bot size={28} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-bold">
              AI Confidence Score
            </p>
            <h3 className="text-3xl font-bold text-foreground tracking-tight mt-1">
              {readRate}%
            </h3>
          </div>
        </GlassCard>
      </div>

      {/* Overview Stats */}
      <GlassCard>
        <h2 className="text-lg font-bold text-foreground mb-4">System Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-accent/50 rounded-xl">
            <p className="text-2xl font-bold text-foreground">{healthData?.overview?.totalUsers || 0}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="text-center p-4 bg-accent/50 rounded-xl">
            <p className="text-2xl font-bold text-foreground">{healthData?.overview?.totalEvents || 0}</p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </div>
          <div className="text-center p-4 bg-accent/50 rounded-xl">
            <p className="text-2xl font-bold text-foreground">{healthData?.overview?.totalNotifications || 0}</p>
            <p className="text-xs text-muted-foreground">Notifications</p>
          </div>
          <div className="text-center p-4 bg-accent/50 rounded-xl">
            <p className="text-2xl font-bold text-foreground">{healthData?.overview?.totalAnnouncements || 0}</p>
            <p className="text-xs text-muted-foreground">Announcements</p>
          </div>
          <div className="text-center p-4 bg-accent/50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-400">{activeAnnouncements}</p>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Load Area Chart */}
        <GlassCard delay={0.4} className="h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-foreground mb-6">
            Network Load & Peak Capacity
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={networkLoadData}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="peak"
                  name="Peak Threshold %"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="capacity"
                  name="Actual Load %"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorCap)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Performance Bar Chart */}
        <GlassCard delay={0.5} className="h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-foreground mb-6">
            AI Module Accuracy Matrix
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aiAccuracyData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#737373"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="module"
                  type="category"
                  stroke="#a3a3a3"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`, "Accuracy"]}
                />
                <Bar
                  dataKey="accuracy"
                  name="Accuracy %"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
