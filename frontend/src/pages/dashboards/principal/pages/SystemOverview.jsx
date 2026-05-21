import { Link, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/shared";
import {
  Users, Activity, Bell, ArrowUpRight, ArrowDownRight,
  Loader2, AlertTriangle, ShieldAlert,
  TrendingUp, ClipboardCheck, Zap, Building2,
  ExternalLink, Send, Eye, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useTheme } from "../../../../context/ThemeContext";
import WidgetErrorBoundary from "../../../../components/shared/WidgetErrorBoundary";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePrincipalOverview,
  useDepartmentAnalytics,
} from "../hooks/usePrincipalDashboard";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <GlassCard key={i} className="flex flex-col gap-3 h-[140px]">
          <Skeleton className="w-12 h-12" />
          <Skeleton className="w-2/3 h-6" />
          <Skeleton className="w-1/2 h-4" />
        </GlassCard>
      ))}
    </div>
  );
}

function SkeletonChart({ height = "h-[380px]" }) {
  return (
    <GlassCard className={`flex flex-col gap-4 ${height}`}>
      <Skeleton className="w-1/3 h-5" />
      <Skeleton className="flex-1 w-full h-full" />
    </GlassCard>
  );
}

function TrendBadge({ value, label, size = "sm" }) {
  const isUp = value > 0;
  const isDown = value < 0;
  const Icon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : () => null;
  const color = isUp ? "text-emerald-500" : isDown ? "text-red-500" : "text-muted-foreground";
  const textSize = size === "lg" ? "text-sm" : "text-xs";
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${textSize} ${color}`}>
      {value !== 0 && <Icon size={size === "lg" ? 14 : 12} />}
      {isUp ? "+" : ""}{value}% {label}
    </span>
  );
}

const severityStyles = {
  critical: "bg-red-500/10 border-red-500/20 text-red-400",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};

const typeIcons = {
  emergency: ShieldAlert,
  security: AlertTriangle,
  action: ClipboardCheck,
  system: Activity,
  trend: TrendingUp,
};

function CriticalAlertsPanel({ alerts, onDismiss }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const Icon = typeIcons[alert.type] || AlertTriangle;
        return (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${severityStyles[alert.severity] || severityStyles.info} animate-in slide-in-from-top-1`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{alert.message}</p>
            </div>
            <button
              onClick={() => onDismiss?.(i)}
              className="text-xs opacity-50 hover:opacity-100 shrink-0 mt-0.5"
            >
              dismiss
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ApprovalActionCenter({ pendingItems }) {
  const navigate = useNavigate();
  const { events, announcements, items } = pendingItems || {};
  const total = (events || 0) + (announcements || 0);

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ClipboardCheck size={16} className="text-emerald-400" />
            Action Center
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total > 0 ? `${total} item${total > 1 ? "s" : ""} requiring your decision` : "All clear"}
          </p>
        </div>
        {total > 0 && (
          <Link
            to="/principal/approvals"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Review All <ExternalLink size={12} />
          </Link>
        )}
      </div>

      {total > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{events}</p>
          </div>
          <div className="px-3 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-muted-foreground">Announcements</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{announcements}</p>
          </div>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
              onClick={() => navigate("/principal/approvals")}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.authorName} · {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                item.priority === "high" ? "bg-red-500/10 text-red-400" :
                item.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
                "bg-blue-500/10 text-blue-400"
              }`}>
                {item.priority}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={() => navigate("/principal/approvals")}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
        >
          Review Approvals
        </button>
        <button
          onClick={() => navigate("/principal/broadcast")}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
        >
          New Broadcast
        </button>
      </div>
    </GlassCard>
  );
}

function InstitutionalMetricsGrid({ metrics, trends }) {
  if (!metrics) return <SkeletonGrid />;
  const cards = [
    {
      title: "Total Users",
      val: metrics.totalUsers?.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: trends?.registrations,
      trendLabel: "vs yesterday",
      detail: `${metrics.todayNewUsers || 0} joined today`,
    },
    {
      title: "Engagement Today",
      val: metrics.todayNotifications?.toLocaleString(),
      icon: Activity,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: trends?.engagement,
      trendLabel: "vs yesterday",
      detail: `${metrics.todayNotifications || 0} messages today`,
    },
    {
      title: "Read Rate",
      val: `${metrics.readRate || 0}%`,
      icon: Eye,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      trend: null,
      trendLabel: "overall",
      detail: `${metrics.totalNotifications?.toLocaleString() || 0} total sent`,
    },
    {
      title: "Delivery Rate",
      val: `${metrics.deliveryRate || 0}%`,
      icon: Send,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      trend: null,
      trendLabel: "success rate",
      detail: `${metrics.deliveryRate >= 85 ? "Healthy" : "Degraded"} service`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((stat, i) => (
        <GlassCard key={i} delay={i * 0.08} className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-xl border border-border ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            {stat.trend !== null && stat.trend !== undefined && (
              <TrendBadge value={stat.trend} label={stat.trendLabel} />
            )}
          </div>
          <div>
            <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.val}</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">{stat.title}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.detail}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function EngagementHourlyChart({ data, peakHour, chartColors }) {
  if (!data || data.length === 0) return null;
  return (
    <GlassCard delay={0.3} className="lg:col-span-2 h-[380px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Communication Volume</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Today by hour</p>
        </div>
        {peakHour && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Zap size={12} className="text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Peak {peakHour}</span>
          </div>
        )}
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="hour" stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} interval={3} />
            <YAxis stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={chartColors.tooltipBg}
              labelStyle={{ color: chartColors.tooltipLabel }}
              itemStyle={{ color: chartColors.tooltipItem }}
            />
            <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#volFill)" name="Messages" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function RoleDistributionChart({ data, chartColors }) {
  if (!data || data.length === 0) return null;
  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
  return (
    <GlassCard delay={0.4} className="h-[380px] flex flex-col">
      <h2 className="text-lg font-semibold text-foreground mb-4">User Composition</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.map((r) => ({ name: r._id || "unknown", value: r.count }))}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={chartColors.tooltipBg}
              labelStyle={{ color: chartColors.tooltipLabel }}
              itemStyle={{ color: chartColors.tooltipItem }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(val) => <span style={{ color: chartColors.text, fontSize: 11, textTransform: "capitalize" }}>{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function DepartmentPerformanceView() {
  const { data, isLoading } = useDepartmentAnalytics();
  const { isDarkMode } = useTheme();
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
  const departments = data?.departments || [];
  const topDepts = departments.slice(0, 8);

  if (isLoading) return <SkeletonChart />;
  if (!departments.length) return null;

  return (
    <GlassCard delay={0.5} className="lg:col-span-2 h-[380px] flex flex-col">
      <h2 className="text-lg font-semibold text-foreground mb-4">Department Performance</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topDepts} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
            <XAxis type="number" stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <YAxis type="category" dataKey="name" stroke={chartColors.text} fontSize={10} tickLine={false} axisLine={false} width={90} />
            <Tooltip
              contentStyle={chartColors.tooltipBg}
              labelStyle={{ color: chartColors.tooltipLabel }}
              formatter={(val) => [`${val}%`, "Read Rate"]}
            />
            <Bar dataKey="readRate" radius={[0, 4, 4, 0]} name="Read Rate">
              {topDepts.map((d, i) => (
                <Cell key={i} fill={d.readRate >= 70 ? "#10b981" : d.readRate >= 40 ? "#f59e0b" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function SystemHealthSummary({ system }) {
  if (!system) return null;
  const indicators = [
    { label: "Database", status: system.database, color: "text-emerald-400" },
    { label: "API Service", status: system.api, color: "text-emerald-400" },
    { label: "Notifications", status: system.notifications, color: system.notifications === "operational" ? "text-emerald-400" : "text-amber-400" },
    { label: "Delivery Rate", status: `${system.deliveryRate || 0}%`, color: (system.deliveryRate || 0) >= 85 ? "text-emerald-400" : "text-amber-400" },
  ];
  return (
    <GlassCard delay={0.6}>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Activity size={14} className="text-emerald-400" />
        System Status
      </h3>
      <div className="space-y-2">
        {indicators.map((ind, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/50">
            <span className="text-xs text-muted-foreground">{ind.label}</span>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${ind.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {ind.status}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function QuickActionCards({ pendingEvents, pendingAnnouncements }) {
  const navigate = useNavigate();
  const totalPending = (pendingEvents || 0) + (pendingAnnouncements || 0);
  const cards = [
    {
      label: "Approvals",
      desc: totalPending > 0 ? `${totalPending} item${totalPending > 1 ? "s" : ""} pending` : "No pending items",
      icon: ClipboardCheck,
      hoverBorder: "hover:border-emerald-500/30",
      iconColor: "text-emerald-400",
      path: "/principal/approvals",
    },
    {
      label: "Broadcast",
      desc: "Send college-wide message",
      icon: Bell,
      hoverBorder: "hover:border-blue-500/30",
      iconColor: "text-blue-400",
      path: "/principal/broadcast",
    },
    {
      label: "Reports",
      desc: "Performance & security insights",
      icon: TrendingUp,
      hoverBorder: "hover:border-purple-500/30",
      iconColor: "text-purple-400",
      path: "/principal/reports-analytics",
    },
    {
      label: "Departments",
      desc: "View department insights",
      icon: Building2,
      hoverBorder: "hover:border-cyan-500/30",
      iconColor: "text-cyan-400",
      path: "/principal/departments",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <button
          key={i}
          onClick={() => navigate(card.path)}
          className={`p-4 rounded-xl bg-card border border-border ${card.hoverBorder} transition-all hover:shadow-lg text-left`}
        >
          <div className={`flex items-center gap-2 ${card.iconColor} mb-1.5`}>
            <card.icon size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">{card.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{card.desc}</p>
        </button>
      ))}
    </div>
  );
}

export default function PrincipalOverview() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: overviewData, isLoading, isFetching, error, refetch } = usePrincipalOverview();
  const { alerts, metrics, trends, hourlyVolume, peakHour, pendingItems, usersByRole, system } = overviewData || {};
  const pendingEvents = pendingItems?.events || 0;
  const pendingAnnouncements = pendingItems?.announcements || 0;

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

  if (error && !overviewData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Institutional oversight · Governance · Strategic analytics
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <WidgetErrorBoundary name="CriticalAlerts">
        <CriticalAlertsPanel alerts={alerts} onDismiss={(i) => {
          queryClient.setQueryData(["principal", "overview"], (old) => {
            if (!old) return old;
            const next = [...(old.alerts || [])];
            next.splice(i, 1);
            return { ...old, alerts: next };
          });
        }} />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary name="MetricsGrid">
        {isLoading ? <SkeletonGrid /> : <InstitutionalMetricsGrid metrics={metrics} trends={trends} />}
      </WidgetErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <WidgetErrorBoundary name="ApprovalCenter">
            {isLoading ? (
              <GlassCard className="h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </GlassCard>
            ) : (
              <ApprovalActionCenter pendingItems={pendingItems} />
            )}
          </WidgetErrorBoundary>
        </div>
        <WidgetErrorBoundary name="SystemHealth">
          <SystemHealthSummary system={system} />
        </WidgetErrorBoundary>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WidgetErrorBoundary name="HourlyChart">
            {isLoading ? <SkeletonChart /> : <EngagementHourlyChart data={hourlyVolume} peakHour={peakHour} chartColors={chartColors} />}
          </WidgetErrorBoundary>
        </div>
        <WidgetErrorBoundary name="RoleChart">
          {isLoading ? <SkeletonChart /> : <RoleDistributionChart data={usersByRole} chartColors={chartColors} />}
        </WidgetErrorBoundary>
      </div>

      <WidgetErrorBoundary name="DepartmentPerformance">
        <DepartmentPerformanceView />
      </WidgetErrorBoundary>

      <WidgetErrorBoundary name="QuickActions">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <QuickActionCards pendingEvents={pendingEvents} pendingAnnouncements={pendingAnnouncements} />
        )}
      </WidgetErrorBoundary>
    </div>
  );
}
