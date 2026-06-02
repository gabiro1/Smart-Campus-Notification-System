import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared";
import WidgetErrorBoundary from "../../../../components/shared/WidgetErrorBoundary";
import {
  Users, UserCheck, UserX, GraduationCap, Building2, Layers,
  Loader2, AlertTriangle, ExternalLink, RefreshCw, UserPlus,
  ClipboardList, BarChart3, TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import registrarService from "../../../../services/registrarService";

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

function StatCard({ icon: Icon, value, label, sublabel, color, trend, delay = 0 }) {
  return (
    <GlassCard delay={delay} className="flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl border border-border ${color.bg}`}>
          <Icon size={20} className={color.text} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-foreground tracking-tight">
          {value?.toLocaleString() ?? 0}
        </h3>
        <p className="text-sm text-muted-foreground font-medium mt-1">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground/60 mt-0.5">{sublabel}</p>}
      </div>
    </GlassCard>
  );
}

function DepartmentBarChart({ data, chartColors }) {
  if (!data || data.length === 0) return null;
  const sorted = [...data].sort((a, b) => b.count - a.count);
  return (
    <GlassCard delay={0.3} className="lg:col-span-2 h-[380px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Enrollment by Department</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Student distribution across departments</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
            <XAxis type="number" stroke={chartColors.text} fontSize={11} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="department" stroke={chartColors.text} fontSize={10} tickLine={false} axisLine={false} width={110} />
            <Tooltip
              contentStyle={chartColors.tooltipBg}
              labelStyle={{ color: chartColors.tooltipLabel }}
              formatter={(val) => [val.toLocaleString(), "Students"]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Students">
              {sorted.map((_, i) => (
                <Cell key={i} fill={i < 2 ? "#10b981" : i < 5 ? "#3b82f6" : "#8b5cf6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

const LEVEL_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

function LevelPieChart({ data, chartColors }) {
  if (!data || data.length === 0) return null;
  return (
    <GlassCard delay={0.4} className="h-[380px] flex flex-col">
      <h2 className="text-lg font-semibold text-foreground mb-4">Students by Level</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.map((l) => ({ name: l._id || "unknown", value: l.count }))}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={LEVEL_COLORS[i % LEVEL_COLORS.length]} />
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
              formatter={(val) => (
                <span style={{ color: chartColors.text, fontSize: 11, textTransform: "capitalize" }}>
                  {val}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function QuickActionCards() {
  const navigate = useNavigate();
  const cards = [
    {
      label: "New Student",
      desc: "Register a new student",
      icon: UserPlus,
      hoverBorder: "hover:border-emerald-500/30",
      iconColor: "text-emerald-400",
      path: "/registrar/new-student",
    },
    {
      label: "Student Records",
      desc: "View & manage records",
      icon: ClipboardList,
      hoverBorder: "hover:border-blue-500/30",
      iconColor: "text-blue-400",
      path: "/registrar/students",
    },
    {
      label: "Enrollment Stats",
      desc: "Detailed analytics",
      icon: BarChart3,
      hoverBorder: "hover:border-purple-500/30",
      iconColor: "text-purple-400",
      path: "/registrar/stats",
    },
    {
      label: "Events",
      desc: "Manage campus events",
      icon: TrendingUp,
      hoverBorder: "hover:border-cyan-500/30",
      iconColor: "text-cyan-400",
      path: "/registrar/events",
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

export default function RegistrarDashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); setError(null); }
    else { setFetching(true); }
    try {
      const res = await registrarService.getEnrollmentStats();
      setStats(res.data);
    } catch (err) {
      console.error('Enrollment stats error:', err.response?.data || err.message);
      if (!silent) setError(err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

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

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">Failed to load enrollment data</p>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { value: stats.total, icon: Users, label: "Total Students", sublabel: "All enrolled students", color: { text: "text-blue-500", bg: "bg-blue-500/10" } },
    { value: stats.active, icon: UserCheck, label: "Active", sublabel: "Currently enrolled", color: { text: "text-emerald-500", bg: "bg-emerald-500/10" } },
    { value: stats.suspended, icon: UserX, label: "Suspended", sublabel: "Inactive accounts", color: { text: "text-red-500", bg: "bg-red-500/10" } },
    { value: stats.byDepartment?.length || 0, icon: GraduationCap, label: "Departments", sublabel: `${stats.byDepartment?.length || 0} departments`, color: { text: "text-purple-500", bg: "bg-purple-500/10" } },
  ];

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Registrar Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Student enrollment · Records overview · Academic identity
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={fetching}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
          {fetching ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <WidgetErrorBoundary name="StatCards">
        {loading ? <SkeletonGrid /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((card, i) => (
              <StatCard key={i} {...card} delay={i * 0.08} />
            ))}
          </div>
        )}
      </WidgetErrorBoundary>

      <WidgetErrorBoundary name="Charts">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DepartmentBarChart data={stats?.byDepartment} chartColors={chartColors} />
            <LevelPieChart data={stats?.byLevel} chartColors={chartColors} />
          </div>
        )}
      </WidgetErrorBoundary>

      <WidgetErrorBoundary name="QuickActions">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <QuickActionCards />
        )}
      </WidgetErrorBoundary>
    </div>
  );
}
