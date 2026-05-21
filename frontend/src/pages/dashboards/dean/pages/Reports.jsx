import { useState, useEffect, useMemo } from "react";
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
import LoadingSkeleton from "@/components/shared/feedback/LoadingSkeleton";
import reportService from "../../../../services/reportService";

const DEPT_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

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
  if (value === undefined || value === null) return null;
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
  if (score === null || score === undefined) return null;
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
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
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
          <span className="font-semibold text-foreground">{entry.value != null ? entry.value + "%" : "—"}</span>
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
  if (!dept) return null;
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
            <p className="text-xs text-muted-foreground">{dept.reportCount} report(s) submitted</p>
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
          { label: "Engagement", value: dept.engagement != null ? `${dept.engagement}%` : "—", trend: dept.trend },
          { label: "Read Rate", value: dept.readRate != null ? `${dept.readRate}%` : "—" },
          { label: "Response Rate", value: dept.responseRate != null ? `${dept.responseRate}%` : "—" },
          { label: "Approval Efficiency", value: dept.approvalEfficiency != null ? `${dept.approvalEfficiency}%` : "—" },
        ].map((m, i) => (
          <div key={i} className="p-3 rounded-xl border border-border bg-accent/30">
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
        </div>
        <div className="p-3 rounded-xl bg-accent/30 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Approval Delays</p>
          <p className={`text-lg font-bold ${dept.approvalDelays > 2 ? "text-rose-400" : dept.approvalDelays > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {dept.approvalDelays} ({dept.avgDelayHours}h avg)
          </p>
        </div>
      </div>

      {dept.risk === "critical" && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs font-medium text-amber-400 mb-2">Recommended Actions</p>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={Send} label="Notify HoD" variant="warning" onClick={() => {}} />
            <ActionButton icon={AlertTriangle} label="Escalate to Principal" variant="danger" onClick={() => {}} />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [drilldownDept, setDrilldownDept] = useState(null);
  const [filters, setFilters] = useState({
    semester: "current",
    department: "All Departments",
    commType: "All Types",
    urgency: "All Urgencies",
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await reportService.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExport = (type) => {
    setExporting(type);
    setTimeout(() => setExporting(null), 1500);
  };

  const chartTextColor = "#737373";
  const chartGridColor = "rgba(255,255,255,0.05)";

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <LoadingSkeleton variant="text" width="w-64" />
            <LoadingSkeleton variant="text" width="w-48" className="mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <LoadingSkeleton variant="card" className="h-32" />
          <LoadingSkeleton variant="card" className="h-32" />
          <LoadingSkeleton variant="card" className="h-32" />
        </div>
        <LoadingSkeleton variant="card" className="h-72" />
        <LoadingSkeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <GlassCard>
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data"
          description="Acknowledge submitted reports to generate institutional analytics. Insights will appear here once reports flow through the governance pipeline."
        />
      </GlassCard>
    );
  }

  const {
    healthScore,
    totalAcknowledgedReports,
    totalSubmitted,
    totalUnderReview,
    totalApproved,
    totalDepartments,
    totalFaculty,
    averageEngagement,
    lastUpdated,
    period,
    complianceRate,
    activeAlerts,
    topRisks = [],
    topImprovements = [],
    departments = [],
    engagementTrends = [],
    approvalPipeline = [],
    escalationFrequency = [],
  } = data;

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
            Decision analytics for communication governance &middot; {period}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground bg-accent px-2 py-1 rounded-md">
            {totalAcknowledgedReports} acknowledged reports
          </span>
          <span className="text-[10px] text-muted-foreground bg-accent px-2 py-1 rounded-md">
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
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
        <span className="text-[11px] text-muted-foreground">
          {totalDepartments} departments &middot; ~{totalFaculty} faculty
        </span>
        <div className="flex-1" />
        <span className="text-[11px] text-muted-foreground">
          {totalSubmitted} submitted &middot; {totalUnderReview} under review &middot; {totalApproved} approved
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
            <span className="text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded">{period}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              {healthScore != null ? <HealthGauge score={healthScore} /> : (
                <p className="text-sm text-muted-foreground">Insufficient data for health score.</p>
              )}
            </div>

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
                  {topImprovements.length > 0 ? topImprovements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-xs text-muted-foreground">{imp}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-muted-foreground">Improvement insights will appear as data accumulates.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Risk & Alerts Panel */}
      {activeAlerts && (
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
              value={`${departments.filter(d => d.engagement != null && d.engagement < 70).length} of ${departments.length}`}
              subtitle="Target: minimum 70% engagement"
              severity={departments.filter(d => d.engagement != null && d.engagement < 70).length > 0 ? "critical" : "healthy"}
            />
            <MetricCard
              label="Delayed Approvals (>48h)"
              value={activeAlerts.delayedApprovals}
              subtitle={`Across ${departments.length} departments`}
              severity={activeAlerts.delayedApprovals > 2 ? "critical" : activeAlerts.delayedApprovals > 0 ? "warning" : "healthy"}
            />
            <MetricCard
              label="Unread Critical Notices"
              value={activeAlerts.unreadCritical}
              subtitle="Across all departments"
              severity={activeAlerts.unreadCritical > 5 ? "critical" : activeAlerts.unreadCritical > 0 ? "warning" : "healthy"}
            />
          </div>
        </motion.div>
      )}

      {/* Performance Analytics */}
      {engagementTrends.length > 0 && (
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
                <span className="text-[11px]">Per report submission</span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                  <XAxis dataKey="week" stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} domain={[30, 100]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: "11px", color: "#a3a3a3" }} />
                  <ReferenceLine y={75} stroke="#6B7280" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Baseline 75%", fill: "#6B7280", fontSize: 10, position: "insideTopRight" }} />
                  {departments.filter(d => d.engagement != null).slice(0, 6).map((dept, idx) => (
                    <Area
                      key={dept.name}
                      type="monotone"
                      dataKey={dept.name}
                      stroke={DEPT_COLORS[idx % DEPT_COLORS.length]}
                      strokeWidth={2}
                      fillOpacity={0}
                      name={dept.name}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      connectNulls
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {departments.filter(d => d.engagement != null && d.engagement < 70).length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle size={12} className="text-amber-400" />
                <span><strong className="text-amber-400">{departments.filter(d => d.engagement != null && d.engagement < 70).map(d => d.name).join(", ")}</strong> below 75% baseline.</span>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Department Metrics Matrix */}
      {departments.length > 0 && (
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
                    <th className="p-4 pr-5 font-semibold text-right">Report Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {departments.map((dept, idx) => (
                    <motion.tr
                      key={dept.name}
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
                          <span className={`text-sm font-semibold ${dept.engagement != null && dept.engagement < 70 ? "text-rose-400" : dept.engagement != null && dept.engagement < 80 ? "text-amber-400" : "text-emerald-400"}`}>
                            {dept.engagement != null ? `${dept.engagement}%` : "—"}
                          </span>
                          <TrendBadge value={dept.trend} />
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{dept.readRate != null ? `${dept.readRate}%` : "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{dept.responseRate != null ? `${dept.responseRate}%` : "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{dept.approvalEfficiency != null ? `${dept.approvalEfficiency}%` : "—"}</td>
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
                      <td className="p-4 pr-5 text-right text-sm text-muted-foreground">{dept.reportCount}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Drilldown */}
      <AnimatePresence>
        {drilldownDept && (
          <DrilledDownDepartment dept={drilldownDept} onClose={() => setDrilldownDept(null)} />
        )}
      </AnimatePresence>

      {/* Governance & Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Approval Pipeline */}
        {approvalPipeline.length > 0 && (
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
                <span className="text-[11px] text-muted-foreground">{period}</span>
              </div>
              <div className="space-y-2">
                {approvalPipeline.map((stage) => {
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
                        stage.stage === "Under Review" ? "bg-blue-400" : "bg-muted-foreground"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{stage.stage}</p>
                        <p className="text-xs text-muted-foreground">{stage.count} requests &middot; avg {stage.avgHours}h in stage</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${color}`}>
                        {stage.count}
                      </span>
                    </div>
                  );
                })}
              </div>
              {complianceRate != null && (
                <div className="mt-3 p-2.5 rounded-xl bg-accent/30 border border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Compliance Rate</span>
                    <span className={`font-semibold ${complianceRate >= 90 ? "text-emerald-400" : "text-amber-400"}`}>{complianceRate}%</span>
                  </div>
                  <div className="mt-1 w-full h-1.5 rounded-full bg-accent overflow-hidden">
                    <div className={`h-full rounded-full ${complianceRate >= 90 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${complianceRate}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{period} &middot; Target: &ge;90%</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Escalation Trends */}
        {escalationFrequency.length > 0 && (
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
                  <BarChart data={escalationFrequency} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                    <XAxis dataKey="month" stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    />
                    <Bar dataKey="frequency" name="Escalations" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {escalationFrequency.map((entry, idx) => (
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
        )}
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
              {period} &middot; {totalDepartments} depts
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
