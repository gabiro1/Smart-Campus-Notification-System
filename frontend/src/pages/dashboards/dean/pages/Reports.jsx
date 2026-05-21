import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Activity,
  Eye,
  MessageSquare,
  Send,
  ChevronRight,
  Calendar,
  Building2,
  BarChart3,
  FileSpreadsheet,
  Loader2,
  X,
  Bell,
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
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import { GlassCard } from "@/components/shared";
import EmptyState from "@/components/shared/feedback/EmptyState";

/* ─── Constants ─── */
const SEMESTERS = [
  { value: "q1-2026", label: "Q1 2026 (Jan–Mar)" },
  { value: "q4-2025", label: "Q4 2025 (Oct–Dec)" },
  { value: "q3-2025", label: "Q3 2025 (Jul–Sep)" },
  { value: "q2-2025", label: "Q2 2025 (Apr–Jun)" },
];

const DEPARTMENTS = [
  "All Departments",
  "Computer Science",
  "Engineering",
  "Mathematics",
  "Physics",
  "Biology",
  "Chemistry",
];

const COMM_TYPES = [
  "All Types",
  "Announcement",
  "Broadcast",
  "Governance",
  "Emergency",
];

const URGENCY_LEVELS = ["All Urgencies", "Low", "Medium", "High", "Critical"];

/* ─── Mock Data ─── */
const DEPT_METRICS = [
  {
    id: "cs", name: "Computer Science", faculty: 24, students: 580,
    engagement: 76, prevEngagement: 79,
    readRate: 82, prevReadRate: 84,
    responseRate: 64, prevResponseRate: 61,
    approvalEfficiency: 88, prevApprovalEfficiency: 85,
    unreadNotices: 3, approvalDelays: 1, avgDelayHours: 26,
    trend: -3, risk: "warning",
    outliers: { engagementDip: "Week 6: dropped to 54%" },
  },
  {
    id: "eng", name: "Engineering", faculty: 31, students: 720,
    engagement: 68, prevEngagement: 76,
    readRate: 71, prevReadRate: 78,
    responseRate: 55, prevResponseRate: 62,
    approvalEfficiency: 72, prevApprovalEfficiency: 80,
    unreadNotices: 7, approvalDelays: 4, avgDelayHours: 52,
    trend: -8, risk: "critical",
    outliers: { engagementDip: "Week 4: dropped to 41%", approvalBacklog: "3 requests stalled >48h" },
  },
  {
    id: "math", name: "Mathematics", faculty: 18, students: 340,
    engagement: 91, prevEngagement: 88,
    readRate: 94, prevReadRate: 91,
    responseRate: 82, prevResponseRate: 79,
    approvalEfficiency: 95, prevApprovalEfficiency: 93,
    unreadNotices: 0, approvalDelays: 0, avgDelayHours: 8,
    trend: 3, risk: "healthy",
    outliers: {},
  },
  {
    id: "phys", name: "Physics", faculty: 22, students: 410,
    engagement: 73, prevEngagement: 71,
    readRate: 76, prevReadRate: 74,
    responseRate: 68, prevResponseRate: 66,
    approvalEfficiency: 81, prevApprovalEfficiency: 83,
    unreadNotices: 2, approvalDelays: 1, avgDelayHours: 31,
    trend: 2, risk: "warning",
    outliers: {},
  },
  {
    id: "bio", name: "Biology", faculty: 27, students: 490,
    engagement: 84, prevEngagement: 86,
    readRate: 87, prevReadRate: 89,
    responseRate: 76, prevResponseRate: 78,
    approvalEfficiency: 90, prevApprovalEfficiency: 91,
    unreadNotices: 1, approvalDelays: 0, avgDelayHours: 14,
    trend: -2, risk: "monitor",
    outliers: {},
  },
  {
    id: "chem", name: "Chemistry", faculty: 20, students: 370,
    engagement: 58, prevEngagement: 65,
    readRate: 62, prevReadRate: 70,
    responseRate: 47, prevResponseRate: 54,
    approvalEfficiency: 65, prevApprovalEfficiency: 73,
    unreadNotices: 9, approvalDelays: 5, avgDelayHours: 68,
    trend: -7, risk: "critical",
    outliers: { engagementDip: "Sustained decline over 8 weeks", unreadSpike: "9 notices unread >72h" },
  },
];

const ENGAGEMENT_TRENDS = [
  { week: "Wk 1", cs: 82, eng: 78, math: 89, phys: 71, bio: 86, chem: 66, baseline: 75 },
  { week: "Wk 2", cs: 79, eng: 74, math: 91, phys: 73, bio: 85, chem: 62, baseline: 75 },
  { week: "Wk 3", cs: 77, eng: 70, math: 90, phys: 74, bio: 83, chem: 60, baseline: 75 },
  { week: "Wk 4", cs: 74, eng: 55, math: 92, phys: 72, bio: 84, chem: 57, baseline: 75 },
  { week: "Wk 5", cs: 73, eng: 61, math: 89, phys: 70, bio: 82, chem: 55, baseline: 75 },
  { week: "Wk 6", cs: 68, eng: 58, math: 93, phys: 76, bio: 81, chem: 52, baseline: 75 },
  { week: "Wk 7", cs: 71, eng: 64, math: 91, phys: 75, bio: 83, chem: 54, baseline: 75 },
  { week: "Wk 8", cs: 76, eng: 62, math: 92, phys: 74, bio: 84, chem: 53, baseline: 75 },
];

const APPROVAL_PIPELINE = [
  { stage: "Submitted", count: 18, avgHours: 0 },
  { stage: "Dean Review", count: 7, avgHours: 14 },
  { stage: "Pending HoD", count: 5, avgHours: 36 },
  { stage: "Escalated", count: 3, avgHours: 72 },
  { stage: "Approved", count: 42, avgHours: 28 },
  { stage: "Rejected", count: 4, avgHours: 18 },
];

const ESCALATION_HISTORY = [
  { month: "Oct", frequency: 12 },
  { month: "Nov", frequency: 18 },
  { month: "Dec", frequency: 8 },
  { month: "Jan", frequency: 15 },
  { month: "Feb", frequency: 22 },
  { month: "Mar", frequency: 14 },
];

/* ─── Sub-Components ─── */

function SeverityTag({ level }) {
  const config = {
    critical: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    monitor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    healthy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${config[level] || config.monitor}`}>
      {level}
    </span>
  );
}

function TrendBadge({ value, suffix = "" }) {
  if (value === undefined) return null;
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
      {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isPositive ? "+" : ""}{value}{suffix}
    </span>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant = "default", compact = false }) {
  const variants = {
    default: "text-muted-foreground hover:text-foreground hover:bg-accent",
    primary: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20",
    warning: "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20",
    danger: "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20",
    success: "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium transition-all ${compact ? "text-xs px-2 py-1 rounded-lg" : "text-sm px-3 py-2 rounded-xl"} ${variants[variant]}`}
    >
      <Icon size={compact ? 12 : 14} />
      {label}
    </button>
  );
}

function FilterSelect({ icon: Icon, value, onChange, options }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/40 border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
      >
        {options.map(opt => (
          <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
        ))}
      </select>
    </div>
  );
}

function MetricCard({ label, value, subtitle, trend, action, actionLabel, actionIcon: ActionIcon, severity }) {
  const borderClass = severity === "critical" ? "border-l-rose-500" : severity === "warning" ? "border-l-amber-500" : severity === "healthy" ? "border-l-emerald-500" : "border-l-border";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-card backdrop-blur-xl border border-border rounded-2xl p-4 border-l-2 ${borderClass} transition-all`}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        {trend !== undefined && <TrendBadge value={trend} suffix="%" />}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      {action && (
        <div className="mt-3">
          <ActionButton icon={ActionIcon || ChevronRight} label={actionLabel || action} onClick={action} variant={severity === "critical" ? "danger" : severity === "warning" ? "warning" : "primary"} compact />
        </div>
      )}
    </motion.div>
  );
}

function HealthGauge({ score }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Healthy" : score >= 60 ? "Moderate" : "At Risk";
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${score * 0.86} 86`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">{score}</span>
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">Institutional Health Score</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Q1 2026 &middot; Baseline: 72</p>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, isDarkMode }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-xl max-w-[200px]">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-semibold text-foreground">{entry.value}%</span>
        </div>
      ))}
      {payload[0]?.payload?.baseline && (
        <div className="mt-1.5 pt-1.5 border-t border-border text-[10px] text-muted-foreground">
          Baseline: {payload[0].payload.baseline}%
        </div>
      )}
    </div>
  );
}

function DrilledDownDepartment({ dept, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-card backdrop-blur-xl border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            dept.risk === "critical" ? "bg-rose-500/10" : dept.risk === "warning" ? "bg-amber-500/10" : "bg-emerald-500/10"
          }`}>
            <Building2 size={18} className={dept.risk === "critical" ? "text-rose-400" : dept.risk === "warning" ? "text-amber-400" : "text-emerald-400"} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{dept.name}</h3>
            <p className="text-xs text-muted-foreground">{dept.faculty} faculty &middot; {dept.students} students</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SeverityTag level={dept.risk} />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Engagement", value: `${dept.engagement}%`, trend: dept.trend, severity: dept.engagement < 70 ? "critical" : dept.engagement < 80 ? "warning" : "healthy" },
          { label: "Read Rate", value: `${dept.readRate}%` },
          { label: "Response Rate", value: `${dept.responseRate}%` },
          { label: "Approval Efficiency", value: `${dept.approvalEfficiency}%` },
        ].map((m, i) => (
          <div key={i} className={`p-3 rounded-xl border ${
            m.severity === "critical" ? "border-rose-500/20 bg-rose-500/5" :
            m.severity === "warning" ? "border-amber-500/20 bg-amber-500/5" :
            "border-border bg-accent/30"
          }`}>
            <p className="text-[11px] text-muted-foreground">{m.label}</p>
            <p className="text-lg font-bold text-foreground">{m.value}</p>
            {m.trend !== undefined && <TrendBadge value={m.trend} suffix=" pp" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-accent/30 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Unread Notices</p>
          <p className={`text-lg font-bold ${dept.unreadNotices > 5 ? "text-rose-400" : dept.unreadNotices > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {dept.unreadNotices}
          </p>
          {dept.unreadNotices > 0 && (
            <ActionButton icon={Bell} label="Notify HoD" variant="warning" compact onClick={() => {}} />
          )}
        </div>
        <div className="p-3 rounded-xl bg-accent/30 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Approval Delays</p>
          <p className={`text-lg font-bold ${dept.approvalDelays > 2 ? "text-rose-400" : dept.approvalDelays > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {dept.approvalDelays} ({dept.avgDelayHours}h avg)
          </p>
          {dept.approvalDelays > 0 && (
            <ActionButton icon={AlertTriangle} label="Escalate" variant="danger" compact onClick={() => {}} />
          )}
        </div>
      </div>

      {Object.keys(dept.outliers).length > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
          <p className="text-xs font-medium text-rose-400 mb-1">Anomalies Detected</p>
          {Object.entries(dept.outliers).map(([key, val]) => (
            <p key={key} className="text-xs text-muted-foreground">&middot; {val}</p>
          ))}
        </div>
      )}

      {dept.risk === "critical" && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs font-medium text-amber-400 mb-2">Recommended Actions</p>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={Send} label="Notify HoD" variant="warning" onClick={() => {}} />
            <ActionButton icon={AlertTriangle} label="Escalate to Principal" variant="danger" onClick={() => {}} />
            <ActionButton icon={FileText} label="View Communication Log" variant="default" onClick={() => {}} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function Reports() {
  const [filters, setFilters] = useState({
    semester: "q1-2026",
    department: "All Departments",
    commType: "All Types",
    urgency: "All Urgencies",
  });
  const [exporting, setExporting] = useState(null);
  const [drilldownDept, setDrilldownDept] = useState(null);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const healthScore = useMemo(() => {
    const avg = DEPT_METRICS.reduce((a, d) => a + d.engagement, 0) / DEPT_METRICS.length;
    const penalty = DEPT_METRICS.filter(d => d.risk === "critical").length * 5 + DEPT_METRICS.filter(d => d.risk === "warning").length * 2;
    return Math.max(0, Math.min(100, Math.round(avg - penalty + 3)));
  }, []);

  const activeAlerts = useMemo(() => ({
    critical: DEPT_METRICS.filter(d => d.risk === "critical").length,
    warning: DEPT_METRICS.filter(d => d.risk === "warning").length,
    delayedApprovals: DEPT_METRICS.reduce((a, d) => a + d.approvalDelays, 0),
    unreadCritical: DEPT_METRICS.reduce((a, d) => a + d.unreadNotices, 0),
  }), []);

  const topRisks = useMemo(() => {
    const risks = [];
    const critical = DEPT_METRICS.filter(d => d.risk === "critical");
    critical.forEach(d => risks.push(`${d.name}: engagement at ${d.engagement}% (${d.trend > 0 ? "+" : ""}${d.trend}pp vs Q4)`));
    const delayed = DEPT_METRICS.filter(d => d.avgDelayHours > 48);
    delayed.forEach(d => risks.push(`${d.name}: approval delays avg ${d.avgDelayHours}h (threshold: 48h)`));
    if (activeAlerts.unreadCritical > 10) risks.push(`${activeAlerts.unreadCritical} unread notices across school`);
    return risks.slice(0, 3);
  }, [activeAlerts]);

  const topImprovements = useMemo(() => {
    const imps = [];
    DEPT_METRICS.filter(d => d.trend > 0).forEach(d => imps.push(`${d.name}: engagement up ${d.trend}pp to ${d.engagement}%`));
    if (activeAlerts.critical === 0) imps.push("No departments in critical risk category");
    if (healthScore > 75) imps.push(`Institutional health score at ${healthScore} (above 72 baseline)`);
    return imps.slice(0, 3);
  }, [healthScore, activeAlerts]);

  const handleExport = (type) => {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
    }, 1500);
  };

  const chartTextColor = "#737373";
  const chartGridColor = "rgba(255,255,255,0.05)";

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Institutional Intelligence Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Decision analytics for communication governance &middot; {SEMESTERS.find(s => s.value === filters.semester)?.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground bg-accent px-2 py-1 rounded-md">
            Last updated: 21 May 2026, 14:30
          </span>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-2"
      >
        <FilterSelect icon={Calendar} value={filters.semester} onChange={(v) => updateFilter("semester", v)} options={SEMESTERS} />
        <FilterSelect icon={Building2} value={filters.department} onChange={(v) => updateFilter("department", v)} options={DEPARTMENTS} />
        <FilterSelect icon={MessageSquare} value={filters.commType} onChange={(v) => updateFilter("commType", v)} options={COMM_TYPES} />
        <FilterSelect icon={ShieldAlert} value={filters.urgency} onChange={(v) => updateFilter("urgency", v)} options={URGENCY_LEVELS} />
        <div className="flex-1" />
        <span className="text-[11px] text-muted-foreground">
          {DEPT_METRICS.length} departments &middot; {DEPT_METRICS.reduce((a, d) => a + d.faculty, 0)} faculty
        </span>
      </motion.div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-blue-400" />
            <h2 className="text-base font-semibold text-foreground">Executive Summary</h2>
            <span className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded">Q1 2026</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Health Score */}
            <div className="lg:col-span-1">
              <HealthGauge score={healthScore} />
            </div>

            {/* Top 3 Risks + Improvements */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Top Risks
                </p>
                <div className="space-y-1.5">
                  {topRisks.length > 0 ? topRisks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-xs text-muted-foreground">{risk}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-emerald-400">No critical risks detected</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp size={12} /> Key Improvements
                </p>
                <div className="space-y-1.5">
                  {topImprovements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-xs text-muted-foreground">{imp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Risk & Alerts Panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={16} className={activeAlerts.critical > 0 ? "text-rose-400" : "text-emerald-400"} />
          <h2 className="text-base font-semibold text-foreground">Risk & Alerts</h2>
          {activeAlerts.critical > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              {activeAlerts.critical} critical
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Depts Below Engagement Threshold"
            value={`${DEPT_METRICS.filter(d => d.engagement < 70).length} of ${DEPT_METRICS.length}`}
            subtitle="Target: minimum 70% engagement"
            severity={DEPT_METRICS.filter(d => d.engagement < 70).length > 0 ? "critical" : "healthy"}
            action={() => {}}
            actionLabel="Notify HoDs"
            actionIcon={Send}
          />
          <MetricCard
            label="Delayed Approvals (>48h)"
            value={activeAlerts.delayedApprovals}
            subtitle={`Avg delay: ${Math.round(DEPT_METRICS.reduce((a, d) => a + d.avgDelayHours, 0) / DEPT_METRICS.length)}h`}
            severity={activeAlerts.delayedApprovals > 2 ? "critical" : activeAlerts.delayedApprovals > 0 ? "warning" : "healthy"}
            action={() => {}}
            actionLabel="Review Pipeline"
            actionIcon={Clock}
          />
          <MetricCard
            label="Unread Critical Notices"
            value={activeAlerts.unreadCritical}
            subtitle="Across all departments"
            severity={activeAlerts.unreadCritical > 5 ? "critical" : activeAlerts.unreadCritical > 0 ? "warning" : "healthy"}
            action={() => {}}
            actionLabel="View Notices"
            actionIcon={Eye}
          />
        </div>
      </motion.div>

      {/* Performance Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-purple-400" />
              <h2 className="text-base font-semibold text-foreground">Engagement Trends by Department</h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#6B7280" }} /> Baseline 75%</span>
              <span className="text-[11px]">Q1 2026 &middot; 8-week view</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENGAGEMENT_TRENDS} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7280" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="week" stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} domain={[30, 100]} />
                <Tooltip content={<ChartTooltip isDarkMode={true} />} />
                <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: "11px", color: "#a3a3a3" }} />
                <ReferenceLine y={75} stroke="#6B7280" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Baseline 75%", fill: "#6B7280", fontSize: 10, position: "insideTopRight" }} />
                {DEPT_METRICS.map((dept, idx) => {
                  const colorList = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
                  return (
                    <Area
                      key={dept.id}
                      type="monotone"
                      dataKey={dept.id}
                      stroke={colorList[idx]}
                      strokeWidth={2}
                      fillOpacity={0}
                      name={dept.name}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle size={12} className="text-amber-400" />
            <span><strong className="text-amber-400">Chemistry</strong> and <strong className="text-rose-400">Engineering</strong> consistently below 75% baseline. Immediate attention recommended.</span>
          </div>
        </GlassCard>
      </motion.div>

      {/* Department Metrics Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-blue-400" />
              <h2 className="text-base font-semibold text-foreground">Department Performance Matrix</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">Click row to drill down</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="p-4 pl-5 font-semibold">Department</th>
                  <th className="p-4 font-semibold">Risk</th>
                  <th className="p-4 font-semibold">Engagement</th>
                  <th className="p-4 font-semibold">Read Rate</th>
                  <th className="p-4 font-semibold">Response Rate</th>
                  <th className="p-4 font-semibold">Approval Eff.</th>
                  <th className="p-4 font-semibold">Unread</th>
                  <th className="p-4 font-semibold">Delays</th>
                  <th className="p-4 pr-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DEPT_METRICS.map((dept, idx) => (
                  <motion.tr
                    key={dept.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setDrilldownDept(dept)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          dept.risk === "critical" ? "bg-rose-500/10" : dept.risk === "warning" ? "bg-amber-500/10" : "bg-emerald-500/10"
                        }`}>
                          <Building2 size={14} className={dept.risk === "critical" ? "text-rose-400" : dept.risk === "warning" ? "text-amber-400" : "text-emerald-400"} />
                        </div>
                        <span className="text-sm font-medium text-foreground">{dept.name}</span>
                      </div>
                    </td>
                    <td className="p-4"><SeverityTag level={dept.risk} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${dept.engagement < 70 ? "text-rose-400" : dept.engagement < 80 ? "text-amber-400" : "text-emerald-400"}`}>
                          {dept.engagement}%
                        </span>
                        <TrendBadge value={dept.trend} />
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{dept.readRate}%</td>
                    <td className="p-4 text-sm text-muted-foreground">{dept.responseRate}%</td>
                    <td className="p-4 text-sm text-muted-foreground">{dept.approvalEfficiency}%</td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${dept.unreadNotices > 5 ? "text-rose-400" : dept.unreadNotices > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        {dept.unreadNotices}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${dept.approvalDelays > 2 ? "text-rose-400" : dept.approvalDelays > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        {dept.approvalDelays}
                      </span>
                    </td>
                    <td className="p-4 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {dept.risk !== "healthy" && (
                          <ActionButton icon={Send} label="Notify" variant="warning" compact onClick={(e) => { e.stopPropagation(); }} />
                        )}
                        <ActionButton icon={Eye} label="Drill" variant="default" compact onClick={(e) => { e.stopPropagation(); setDrilldownDept(dept); }} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Drilldown */}
      <AnimatePresence>
        {drilldownDept && (
          <DrilledDownDepartment dept={drilldownDept} onClose={() => setDrilldownDept(null)} />
        )}
      </AnimatePresence>

      {/* Governance & Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Approval Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                <h2 className="text-base font-semibold text-foreground">Approval Pipeline</h2>
              </div>
              <span className="text-[11px] text-muted-foreground">Q1 2026</span>
            </div>
            <div className="space-y-2">
              {APPROVAL_PIPELINE.map((stage) => {
                const pct = Math.round((stage.avgHours / 72) * 100);
                const color = stage.stage === "Escalated" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  stage.stage === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  stage.stage === "Approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  "bg-accent/50 text-muted-foreground border-border";
                return (
                  <div key={stage.stage} className="flex items-center gap-3 p-2.5 rounded-xl border border-border hover:bg-accent/30 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      stage.stage === "Escalated" ? "bg-rose-400" :
                      stage.stage === "Rejected" ? "bg-red-400" :
                      stage.stage === "Approved" ? "bg-emerald-400" :
                      stage.stage === "Dean Review" ? "bg-blue-400" : "bg-muted-foreground"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{stage.stage}</p>
                      <p className="text-xs text-muted-foreground">{stage.count} requests &middot; avg {stage.avgHours}h in stage</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${color}`}>
                      {stage.count}
                    </span>
                    {stage.stage === "Escalated" && (
                      <ActionButton icon={AlertTriangle} label="Review" variant="danger" compact onClick={() => {}} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-2.5 rounded-xl bg-accent/30 border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Compliance Rate</span>
                <span className="font-semibold text-emerald-400">91.3%</span>
              </div>
              <div className="mt-1 w-full h-1.5 rounded-full bg-accent overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: "91.3%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Q1 2026 &middot; Target: &ge;90%</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Escalation Trends */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-400" />
                <h2 className="text-base font-semibold text-foreground">Escalation Frequency</h2>
              </div>
              <span className="text-[11px] text-muted-foreground">6-month trend</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ESCALATION_HISTORY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                  <XAxis dataKey="month" stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  />
                  <Bar dataKey="frequency" name="Escalations" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {ESCALATION_HISTORY.map((entry, idx) => (
                      <Cell key={idx} fill={entry.frequency >= 20 ? "#ef4444" : entry.frequency >= 14 ? "#f59e0b" : "#3b82f6"} />
                    ))}
                  </Bar>
                  <ReferenceLine y={15} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Threshold", fill: "#f59e0b", fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &ge;20/mo</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 14-19/mo</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> &lt;14/mo</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Download size={16} className="text-blue-400" />
            <h2 className="text-base font-semibold text-foreground">Export & Reporting</h2>
            <span className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded">
              Filters: {filters.semester} &middot; {filters.department}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "exec-summary", label: "Executive Summary", desc: "PDF · Health score, risks, improvements", icon: FileText },
              { key: "analytics", label: "Institutional Analytics", desc: "PDF · Full department metrics & trends", icon: BarChart3 },
              { key: "compliance", label: "Compliance Report", desc: "PDF · Approval pipeline & SLA adherence", icon: CheckCircle2 },
              { key: "dept-perf", label: "Department Performance", desc: "CSV · Raw data export", icon: FileSpreadsheet },
            ].map((exportItem) => (
              <button
                key={exportItem.key}
                onClick={() => handleExport(exportItem.key)}
                disabled={exporting === exportItem.key}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-accent/30 hover:bg-accent transition-all text-left disabled:opacity-50 group"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  {exporting === exportItem.key ? (
                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                  ) : (
                    <exportItem.icon size={16} className="text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{exportItem.label}</p>
                  <p className="text-[11px] text-muted-foreground">{exportItem.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
