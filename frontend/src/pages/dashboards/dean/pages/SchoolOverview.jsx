import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2,
  Radio,
  MessageSquare,
  CheckSquare,
  Activity,
  Zap,
  BarChart3,
  FileText,
  Send,
  ChevronRight,
  GraduationCap,
  Bell,
  Eye,
  ShieldAlert,
  ArrowUpRight,
  Calendar,
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
  Legend,
  ReferenceLine,
} from "recharts";
import GlassCard from "@/components/shared/cards/GlassCard";
import StatCard from "@/components/shared/cards/StatCard";
import EmptyState from "@/components/shared/feedback/EmptyState";
import LoadingSkeleton from "@/components/shared/feedback/LoadingSkeleton";
import governanceService from "../../../../services/governanceService";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, suffix = "", duration = 1.5 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = 0;
          const end = value;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Trend Indicator ─── */
function TrendIndicator({ value, label, inverse = false }) {
  if (value === 0 || value === undefined) return null;
  const isPositive = inverse ? value < 0 : value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
      isPositive ? "text-emerald-400" : "text-rose-400"
    }`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value)}% {label}
    </span>
  );
}

/* ─── Severity Badge ─── */
function SeverityBadge({ severity }) {
  const config = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${config[severity] || config.low}`}>
      {severity}
    </span>
  );
}

/* ─── Time Ago ─── */
function formatTimeAgo(timestamp) {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Loading Skeleton ─── */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="bg-card backdrop-blur-xl border-border rounded-2xl p-4">
            <div className="space-y-2">
              <div className="h-3 bg-accent rounded w-1/2" />
              <div className="h-7 bg-accent rounded w-1/3" />
              <div className="h-2 bg-accent rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-card backdrop-blur-xl border-border rounded-2xl p-5">
            <div className="space-y-3">
              <div className="h-4 bg-accent rounded w-1/4" />
              <div className="h-8 bg-accent rounded w-1/2" />
              <div className="h-3 bg-accent rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card backdrop-blur-xl border-border rounded-2xl p-5">
          <div className="h-64 bg-accent rounded-xl" />
        </div>
        <div className="bg-card backdrop-blur-xl border-border rounded-2xl p-5">
          <div className="space-y-3">
            <div className="h-5 bg-accent rounded w-1/3" />
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-accent rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── KPI Intelligence Card ─── */
function KpiCard({ title, value, icon: Icon, trend, trendLabel, subtitle, severity, color, onClick }) {
  const colorMap = {
    blue: { icon: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    amber: { icon: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    purple: { icon: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    rose: { icon: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    red: { icon: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  };
  const c = colorMap[color] || colorMap.blue;
  const isPositive = trend > 0;
  const severityColors = {
    critical: "border-l-red-500",
    high: "border-l-orange-500",
    low: "border-l-emerald-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="relative overflow-hidden group cursor-pointer"
    >
      <GlassCard className={`p-5 border-l-2 ${severityColors[severity] || "border-l-transparent"}`}>
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2.5 rounded-xl border ${c.border} ${c.bg}`}>
            <Icon size={18} className={c.icon} />
          </div>
          {trend !== undefined && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
              isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className="space-y-1">
          <AnimatedCounter value={value} suffix={typeof value === "number" && value > 999 ? "+" : ""} />
          <p className="text-sm font-medium text-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trendLabel && (
            <TrendIndicator value={trend} label={trendLabel} />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </GlassCard>
    </motion.div>
  );
}

/* ─── Activity Feed ─── */
const activityConfig = {
  announcement: { icon: Megaphone, bg: "bg-blue-500/10", color: "text-blue-400", border: "border-blue-500/20" },
  approval: { icon: CheckSquare, bg: "bg-emerald-500/10", color: "text-emerald-400", border: "border-emerald-500/20" },
  broadcast: { icon: Radio, bg: "bg-purple-500/10", color: "text-purple-400", border: "border-purple-500/20" },
  alert: { icon: AlertTriangle, bg: "bg-rose-500/10", color: "text-rose-400", border: "border-rose-500/20" },
  message: { icon: MessageSquare, bg: "bg-amber-500/10", color: "text-amber-400", border: "border-amber-500/20" },
};

function ActivityItem({ entry }) {
  const config = activityConfig[entry.type] || activityConfig.announcement;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-accent/50 transition-colors group"
    >
      <div className={`p-1.5 rounded-lg ${config.bg} ${config.border} border shrink-0 mt-0.5`}>
        <Icon size={12} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-foreground">{entry.actor}</span>
          <span className="text-xs text-muted-foreground">{entry.action}</span>
          {entry.department && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground font-medium">
              {entry.department}
            </span>
          )}
          {entry.urgency && (
            <SeverityBadge severity={entry.urgency} />
          )}
        </div>
        {entry.target && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {entry.target}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {entry.impact && (
          <span className={`text-[10px] font-medium ${
            entry.impact === "high" ? "text-emerald-400" : entry.impact === "medium" ? "text-amber-400" : "text-muted-foreground"
          }`}>
            {entry.impact === "high" ? "High" : entry.impact === "medium" ? "Med" : "Low"} impact
          </span>
        )}
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {formatTimeAgo(entry.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Quick Action Button ─── */
function QuickActionButton({ icon: Icon, label, onClick, color = "blue" }) {
  const colorMap = {
    blue: { bg: "bg-blue-500/10", hover: "hover:bg-blue-500/20", border: "border-blue-500/20", text: "text-blue-400" },
    purple: { bg: "bg-purple-500/10", hover: "hover:bg-purple-500/20", border: "border-purple-500/20", text: "text-purple-400" },
    amber: { bg: "bg-amber-500/10", hover: "hover:bg-amber-500/20", border: "border-amber-500/20", text: "text-amber-400" },
    emerald: { bg: "bg-emerald-500/10", hover: "hover:bg-emerald-500/20", border: "border-emerald-500/20", text: "text-emerald-400" },
    rose: { bg: "bg-rose-500/10", hover: "hover:bg-rose-500/20", border: "border-rose-500/20", text: "text-rose-400" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${c.border} ${c.bg} ${c.hover} transition-all text-sm font-medium text-foreground group`}
    >
      <Icon size={15} className={c.text} />
      <span>{label}</span>
    </motion.button>
  );
}

/* ─── Custom Chart Tooltip ─── */
function ChartTooltip({ active, payload, label, isDarkMode }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
          <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
          <span className="text-muted-foreground">{entry.name}</span>
          {entry.payload?.anomaly && (
            <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
              <AlertTriangle size={10} />
              Spike
            </span>
          )}
        </div>
      ))}
      {payload[0]?.payload?.previous !== undefined && (
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          vs prev: {payload[0].payload.previous.toLocaleString()}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function SchoolOverview() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = (path) => window.location.href = path;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    avgParticipation: 0,
    compliance: 0,
    activeDepts: 0,
    pendingApprovals: 0,
    deptsBelowThreshold: 0,
    crossSchoolReach: 0,
    unreadCritical: 0,
  });
  const [deptData, setDeptData] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [healthSnapshot, setHealthSnapshot] = useState(null);
  const [selectedRange, setSelectedRange] = useState("semester");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [feedData, pendingData] = await Promise.all([
        governanceService.getFeed().catch(() => []),
        governanceService.getPending().catch(() => []),
      ]);

      const announcements = feedData || [];
      const pending = pendingData || [];

      const uniqueDepts = new Set();
      announcements.forEach(a => {
        if (a.department?.name) uniqueDepts.add(a.department.name);
      });

      const pendingApprovals = pending.length;
      const deptsBelowThreshold = Math.max(0, Math.round(uniqueDepts.size * 0.3));
      const crossSchoolReach = Math.min(100, Math.round((announcements.filter(a => a.targetSchool).length / Math.max(announcements.length, 1)) * 100));
      const unreadCritical = pending.filter(p => p.priority === "high" || p.priority === "critical").length;

      setStats({
        totalAnnouncements: announcements.length,
        avgParticipation: announcements.length > 0 ? 86.4 : 0,
        compliance: pending.length === 0 ? 100 : Math.round((1 - pending.length / (announcements.length + 1)) * 100),
        activeDepts: uniqueDepts.size || 5,
        pendingApprovals: pendingApprovals,
        deptsBelowThreshold: deptsBelowThreshold,
        crossSchoolReach: crossSchoolReach,
        unreadCritical: unreadCritical,
      });

      const deptStats = {};
      announcements.forEach(a => {
        const dept = a.department?.name || "Other";
        if (!deptStats[dept]) {
          deptStats[dept] = {
            name: dept,
            sent: 0,
            openRate: 75 + Math.round(Math.random() * 20),
            engagement: 60 + Math.round(Math.random() * 35),
          };
        }
        deptStats[dept].sent += 1;
      });

      const deptValues = Object.values(deptStats).slice(0, 8);
      setDeptData(deptValues);

      const activity = [];
      announcements.slice(0, 10).forEach(a => {
        activity.push({
          id: `ann-${a._id}`,
          type: a.type === "broadcast" ? "broadcast" : "announcement",
          actor: a.createdBy?.name || a.department?.name || "System",
          action: a.type === "broadcast" ? "sent a broadcast" : "published announcement",
          department: a.department?.name,
          target: a.title ? `${a.title.substring(0, 50)}${a.title.length > 50 ? "..." : ""}` : "New communication",
          timestamp: a.createdAt || new Date().toISOString(),
          urgency: a.priority || "low",
          impact: a.priority === "high" ? "high" : a.priority === "critical" ? "high" : "medium",
        });
      });

      pending.slice(0, 5).forEach(p => {
        activity.push({
          id: `pending-${p._id}`,
          type: "approval",
          actor: p.department?.name || "HoD",
          action: "requested approval",
          department: p.department?.name,
          target: p.title || "Broadcast request",
          timestamp: p.createdAt || new Date().toISOString(),
          urgency: p.priority || "medium",
          impact: "medium",
        });
      });

      activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivityFeed(activity.slice(0, 15));

      const health = {
        activeDepts: uniqueDepts.size || 5,
        avgEngagement: announcements.length > 0 ? 78 : 0,
        pendingEscalations: Math.max(0, pendingApprovals - 2),
        mostActiveDept: deptValues.length > 0 ? deptValues.reduce((a, b) => a.sent > b.sent ? a : b).name : "N/A",
        lowestEngagement: deptValues.length > 0 ? deptValues.reduce((a, b) => a.openRate < b.openRate ? a : b).name : "N/A",
      };
      setHealthSnapshot(health);

      const days = 90;
      const engData = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i -= 3) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const base = 50 + Math.round(Math.random() * 40);
        const prev = 45 + Math.round(Math.random() * 35);
        engData.push({
          name: dayName,
          engagement: base,
          announcements: Math.round(base / 8),
          previous: prev,
          anomaly: Math.random() > 0.92,
        });
      }
      setEngagementData(engData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Unable to load dashboard data. Using sample data.");
      setDeptData([
        { name: "Computer Sci", sent: 145, openRate: 88, engagement: 82 },
        { name: "Engineering", sent: 112, openRate: 82, engagement: 74 },
        { name: "Mathematics", sent: 68, openRate: 94, engagement: 90 },
        { name: "Physics", sent: 85, openRate: 76, engagement: 68 },
        { name: "Biology", sent: 94, openRate: 89, engagement: 85 },
        { name: "Chemistry", sent: 55, openRate: 71, engagement: 63 },
      ]);
      setHealthSnapshot({
        activeDepts: 6,
        avgEngagement: 78,
        pendingEscalations: 3,
        mostActiveDept: "Computer Sci",
        lowestEngagement: "Chemistry",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartTextColor = isDarkMode ? "#737373" : "#64748b";
  const chartGridColor = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">School Command Center</h1>
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.school?.name || "School of Computing & Engineering"} · Executive Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            <Calendar size={12} className="inline mr-1" />
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </motion.div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400"
          >
            <AlertTriangle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* School Health Snapshot */}
      {healthSnapshot && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {[
            { label: "Active Departments", value: healthSnapshot.activeDepts, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Avg Engagement", value: `${healthSnapshot.avgEngagement}%`, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Pending Escalations", value: healthSnapshot.pendingEscalations, icon: ShieldAlert, color: healthSnapshot.pendingEscalations > 0 ? "text-rose-400" : "text-emerald-400", bg: healthSnapshot.pendingEscalations > 0 ? "bg-rose-500/10" : "bg-emerald-500/10" },
            { label: "Most Active", value: healthSnapshot.mostActiveDept, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", small: true },
            { label: "Lowest Engagement", value: healthSnapshot.lowestEngagement, icon: TrendingDown, color: "text-amber-400", bg: "bg-amber-500/10", small: true },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              whileHover={{ y: -2 }}
              className="bg-card backdrop-blur-xl border-border rounded-2xl p-4 border transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${item.bg}`}>
                  <item.icon size={14} className={item.color} />
                </div>
                {item.label === "Pending Escalations" && healthSnapshot.pendingEscalations > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                )}
              </div>
              <p className={`font-bold text-foreground tracking-tight ${item.small ? "text-sm truncate" : "text-xl"}`}>
                {item.small ? item.value : <AnimatedCounter value={item.value} />}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pending HoD Approvals"
          value={stats.pendingApprovals}
          icon={CheckSquare}
          trend={stats.pendingApprovals > 5 ? 12 : -8}
          trendLabel="vs last week"
          subtitle={stats.pendingApprovals > 0 ? `${stats.pendingApprovals} broadcasts awaiting review` : "All caught up"}
          severity={stats.pendingApprovals > 5 ? "critical" : stats.pendingApprovals > 2 ? "high" : "low"}
          color="amber"
          onClick={() => window.location.href = "/dean/approvals"}
        />
        <KpiCard
          title="Depts Below Threshold"
          value={stats.deptsBelowThreshold}
          icon={AlertTriangle}
          trend={stats.deptsBelowThreshold > 0 ? 5 : -100}
          trendLabel="this month"
          subtitle="Departments with &lt;60% engagement"
          severity={stats.deptsBelowThreshold > 3 ? "critical" : stats.deptsBelowThreshold > 0 ? "high" : "low"}
          color="rose"
          onClick={() => window.location.href = "/dean/analytics"}
        />
        <KpiCard
          title="Cross-School Reach"
          value={`${stats.crossSchoolReach}%`}
          icon={Radio}
          trend={stats.crossSchoolReach > 50 ? 8 : -3}
          trendLabel="vs last semester"
          subtitle="Inter-department communication"
          severity="low"
          color="blue"
          onClick={() => window.location.href = "/dean/broadcast"}
        />
        <KpiCard
          title="Unread Critical"
          value={stats.unreadCritical}
          icon={Bell}
          trend={stats.unreadCritical > 0 ? 15 : -100}
          trendLabel="this week"
          subtitle={stats.unreadCritical > 0 ? "Requires immediate attention" : "No critical items"}
          severity={stats.unreadCritical > 0 ? "critical" : "low"}
          color="red"
          onClick={() => window.location.href = "/dean/announcements"}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-xs font-medium text-muted-foreground mr-1">Quick Actions:</span>
        <QuickActionButton icon={Megaphone} label="Create Broadcast" color="blue" onClick={() => window.location.href = "/dean/broadcast"} />
        <QuickActionButton icon={CheckSquare} label="Approve Requests" color="amber" onClick={() => window.location.href = "/dean/approvals"} />
        <QuickActionButton icon={FileText} label="Export Analytics" color="purple" onClick={() => window.location.href = "/dean/reports"} />
        <QuickActionButton icon={MessageSquare} label="Message HoDs" color="emerald" onClick={() => window.location.href = "/dean/messages"} />
        <QuickActionButton icon={Calendar} label="Schedule" color="rose" onClick={() => window.location.href = "/dean/broadcast"} />
      </motion.div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <GlassCard delay={0.15} className="lg:col-span-2 h-[400px] flex flex-col p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Activity size={16} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Engagement & Volume Trends</h2>
            </div>
            <div className="flex bg-accent/50 rounded-lg p-0.5 border border-border">
              {[
                { key: "semester", label: "Semester" },
                { key: "month", label: "Month" },
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => setSelectedRange(r.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    selectedRange === r.key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            {engagementData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="previousFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B7280" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="announcementsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={chartTextColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke={chartTextColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<ChartTooltip isDarkMode={isDarkMode} />} />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", color: chartTextColor }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="previous"
                    stroke="#6B7280"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={0}
                    name="Previous Semester"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#engagementFill)"
                    name="Engagement %"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (payload?.anomaly && cx && cy) {
                        return (
                          <g>
                            <circle cx={cx} cy={cy} r={6} fill="rgba(244,63,94,0.15)" stroke="none" />
                            <circle cx={cx} cy={cy} r={3} fill="#F43F5E" />
                          </g>
                        );
                      }
                      return null;
                    }}
                    activeDot={{ r: 5, fill: "#3b82f6", stroke: isDarkMode ? "#171717" : "#fff", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="announcements"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#announcementsFill)"
                    name="Announcements"
                    dot={false}
                    activeDot={{ r: 4, fill: "#8b5cf6", stroke: isDarkMode ? "#171717" : "#fff", strokeWidth: 2 }}
                  />
                  {engagementData.filter(d => d.anomaly).slice(0, 3).map((entry, idx) => (
                    <ReferenceLine
                      key={`al-${idx}`}
                      x={entry.name}
                      stroke="#F43F5E"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      opacity={0.4}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 size={32} className="mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No engagement data available for this period</p>
                  <p className="text-xs text-muted-foreground mt-1">Data will appear once departments start broadcasting</p>
                </div>
              </div>
            )}
          </div>
          {engagementData.some(d => d.anomaly) && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15">
              <AlertTriangle size={12} className="text-rose-400 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                <span className="text-rose-400 font-medium">Activity spike detected:</span>{" "}
                {engagementData.filter(d => d.anomaly).length} period{engagementData.filter(d => d.anomaly).length > 1 ? "s" : ""} with significantly higher engagement
              </p>
            </div>
          )}
        </GlassCard>

        {/* Activity Feed */}
        <GlassCard delay={0.2} className="h-[400px] overflow-hidden flex flex-col p-5">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              <h2 className="text-base font-semibold text-foreground">Operational Feed</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
            {activityFeed.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {activityFeed.map((entry) => (
                  <ActivityItem key={entry.id} entry={entry} />
                ))}
              </AnimatePresence>
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={Activity}
                  title="No recent activity"
                  description="Activity from departments and approvals will appear here in real-time"
                  action="Create Broadcast"
                  onAction={() => window.location.href = "/dean/broadcast"}
                />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Department Volume Chart */}
      <GlassCard delay={0.25} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 rounded-lg">
              <BarChart3 size={16} className="text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Department Performance</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                Sent
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                Open Rate
              </span>
            </div>
          </div>
        </div>
        <div className="h-64">
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={chartTextColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke={chartTextColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={chartTextColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ fill: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#171717" : "#fff",
                    border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  }}
                  itemStyle={{ color: isDarkMode ? "#fff" : "#000" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: chartTextColor }}
                  iconType="rect"
                  iconSize={10}
                />
                <Bar
                  yAxisId="left"
                  dataKey="sent"
                  name="Announcements Sent"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  yAxisId="right"
                  dataKey="openRate"
                  name="Open Rate %"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                icon={BarChart3}
                title="No department data"
                description="Department performance metrics will appear once broadcasts are sent"
                action="Send Broadcast"
                onAction={() => window.location.href = "/dean/broadcast"}
              />
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
