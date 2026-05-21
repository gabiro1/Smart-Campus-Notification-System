import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Shield,
  MoreVertical,
  Edit2,
  Ban,
  X,
  Check,
  Users,
  Building2,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  Send,
  ChevronRight,
  Eye,
  Radio,
  UserPlus,
  FileText,
  ArrowUpRight,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import EmptyState from "@/components/shared/feedback/EmptyState";
import LoadingSkeleton from "@/components/shared/feedback/LoadingSkeleton";

/* ─── Data ─── */
const initialStaff = [
  {
    id: 1,
    name: "Dr. Amanda Clarke",
    title: "Head of Physics Department",
    responsibility: "Department Coordinator",
    dept: "Physics",
    activity: "Active",
    activityLabel: "Active today",
    engagementScore: 92,
    trend: "+5%",
    lastActive: "2026-05-21T09:30:00",
    pendingQueue: 0,
    avatar: "AC",
    engagementRisk: false,
  },
  {
    id: 2,
    name: "Prof. John Davies",
    title: "Senior Lecturer, Computer Science",
    responsibility: "Lecturer",
    dept: "Computer Science",
    activity: "Inactive",
    activityLabel: "Inactive 3 days",
    engagementScore: 64,
    trend: "-12%",
    lastActive: "2026-05-18T14:00:00",
    pendingQueue: 0,
    avatar: "JD",
    engagementRisk: true,
  },
  {
    id: 3,
    name: "Dr. Mark Spector",
    title: "Lecturer, Engineering",
    responsibility: "Lecturer",
    dept: "Engineering",
    activity: "Low Engagement",
    activityLabel: "Below 60% threshold",
    engagementScore: 43,
    trend: "-8%",
    lastActive: "2026-05-19T11:00:00",
    pendingQueue: 0,
    avatar: "MS",
    engagementRisk: true,
  },
  {
    id: 4,
    name: "Sarah Williams",
    title: "Administrative Coordinator",
    responsibility: "Admin Liaison",
    dept: "Dean's Office",
    activity: "Active",
    activityLabel: "Active today",
    engagementScore: 88,
    trend: "+2%",
    lastActive: "2026-05-21T10:15:00",
    pendingQueue: 1,
    avatar: "SW",
    engagementRisk: false,
  },
  {
    id: 5,
    name: "Dr. Emily Chen",
    title: "Head of Computer Science",
    responsibility: "Department Coordinator",
    dept: "Computer Science",
    activity: "Pending Queue",
    activityLabel: "3 approvals pending",
    engagementScore: 76,
    trend: "+1%",
    lastActive: "2026-05-20T16:45:00",
    pendingQueue: 3,
    avatar: "EC",
    engagementRisk: false,
  },
  {
    id: 6,
    name: "Prof. Robert Kimani",
    title: "Lecturer, Mathematics",
    responsibility: "Lecturer",
    dept: "Mathematics",
    activity: "Active",
    activityLabel: "Active today",
    engagementScore: 95,
    trend: "+8%",
    lastActive: "2026-05-21T08:00:00",
    pendingQueue: 0,
    avatar: "RK",
    engagementRisk: false,
  },
  {
    id: 7,
    name: "Dr. Patricia Ochieng",
    title: "Senior Lecturer, Biology",
    responsibility: "Lecturer",
    dept: "Biology",
    activity: "Inactive",
    activityLabel: "Inactive 7 days",
    engagementScore: 31,
    trend: "-22%",
    lastActive: "2026-05-14T12:30:00",
    pendingQueue: 0,
    avatar: "PO",
    engagementRisk: true,
  },
  {
    id: 8,
    name: "James Mwangi",
    title: "Lab Coordinator, Engineering",
    responsibility: "Admin Liaison",
    dept: "Engineering",
    activity: "Active",
    activityLabel: "Active today",
    engagementScore: 81,
    trend: "+3%",
    lastActive: "2026-05-21T07:30:00",
    pendingQueue: 0,
    avatar: "JM",
    engagementRisk: false,
  },
];

const recommendations = [
  { value: "role-adjustment", label: "Recommend Role Adjustment" },
  { value: "staff-onboarding", label: "Request Staff Onboarding" },
  { value: "restrict-access", label: "Restrict Broadcast Access" },
  { value: "dept-responsibility", label: "Assign Department Responsibility" },
  { value: "escalate-issue", label: "Escalate Communication Issue" },
];

const auditLog = [
  {
    id: 1,
    action: "Recommendation Submitted",
    staff: "Dr. Mark Spector",
    type: "Escalate Communication Issue",
    timestamp: "2026-05-20T14:30:00",
    status: "Pending Review",
  },
  {
    id: 2,
    action: "Recommendation Approved",
    staff: "Dr. Patricia Ochieng",
    type: "Send Engagement Reminder",
    timestamp: "2026-05-19T10:00:00",
    status: "Approved",
  },
  {
    id: 3,
    action: "Escalation Submitted",
    staff: "Dr. Emily Chen",
    type: "Approval Queue Delay",
    timestamp: "2026-05-18T16:20:00",
    status: "Escalated",
  },
];

/* ─── Sub-Components ─── */

function EngagementBadge({ score }) {
  if (score === undefined) return null;
  const color = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400";
  const bg = score >= 75 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-rose-500/10";
  const border = score >= 75 ? "border-emerald-500/20" : score >= 50 ? "border-amber-500/20" : "border-rose-500/20";
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full border ${color} ${bg} ${border}`}>
      {score}%
      {score < 50 && (
        <AlertTriangle size={12} className="text-rose-400" />
      )}
    </span>
  );
}

function ActivityBadge({ activity }) {
  const config = {
    Active: { color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
    Inactive: { color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
    "Low Engagement": { color: "text-rose-400", bg: "bg-rose-500/10", dot: "bg-rose-400" },
    "Pending Queue": { color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
  };
  const c = config[activity] || config.Active;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${c.color} ${c.bg} ${c.border || "border-transparent"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {activity}
    </span>
  );
}

function ResponsibilityBadge({ role }) {
  const config = {
    "Department Coordinator": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Lecturer": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Admin Liaison": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "HoD": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${config[role] || "bg-accent text-muted-foreground border-border"}`}>
      {role}
    </span>
  );
}

function StatusIndicator({ status }) {
  const config = {
    "Pending Review": { color: "text-amber-400", dot: "bg-amber-400", bg: "bg-amber-500/10" },
    "Approved": { color: "text-emerald-400", dot: "bg-emerald-400", bg: "bg-emerald-500/10" },
    "Escalated": { color: "text-rose-400", dot: "bg-rose-400", bg: "bg-rose-500/10" },
    "Requires Admin Action": { color: "text-blue-400", dot: "bg-blue-400", bg: "bg-blue-500/10" },
  };
  const c = config[status] || config["Pending Review"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${c.color} ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function InsightCard({ icon: Icon, value, label, trend, trendUp, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card backdrop-blur-xl border-border rounded-2xl p-4 border transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${trend === "danger" ? "bg-rose-500/10" : trend === "warning" ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
            <Icon size={16} className={trend === "danger" ? "text-rose-400" : trend === "warning" ? "text-amber-400" : "text-blue-400"} />
          </div>
          {trend === "danger" && <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />}
        </div>
        {trend !== undefined && typeof trend === "number" && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${trend > 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant = "default" }) {
  const variants = {
    default: "text-muted-foreground hover:text-foreground hover:bg-accent",
    primary: "text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20",
    warning: "text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20",
    danger: "text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20",
    success: "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${variants[variant]}`}
      title={label}
    >
      <Icon size={14} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

/* ─── Main Component ─── */
export default function SchoolStaffOversight() {
  const [staff] = useState(initialStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalStep, setModalStep] = useState("select");
  const [recommendationType, setRecommendationType] = useState("");
  const [reason, setReason] = useState("");
  const [showAudit, setShowAudit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staff;
    const q = searchQuery.toLowerCase();
    return staff.filter(
      s => s.name.toLowerCase().includes(q) ||
           s.dept.toLowerCase().includes(q) ||
           s.responsibility.toLowerCase().includes(q) ||
           s.title.toLowerCase().includes(q)
    );
  }, [staff, searchQuery]);

  const insights = useMemo(() => ({
    departmentsAttention: staff.filter(s => s.engagementRisk).length,
    pendingEscalations: staff.filter(s => s.pendingQueue > 0).length + 2,
    avgEngagement: Math.round(staff.reduce((a, s) => a + s.engagementScore, 0) / staff.length),
    inactiveStaff: staff.filter(s => s.activity === "Inactive" || s.activity === "Low Engagement").length,
  }), [staff]);

  const openRecommendation = (member) => {
    setSelectedMember(member);
    setModalStep("select");
    setRecommendationType("");
    setReason("");
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setModalStep("submitted");
    }, 800);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setModalStep("select");
    setSubmitted(false);
  };

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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">School Staff Oversight</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor departmental communication participation and coordination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAudit(!showAudit)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              showAudit
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-accent text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <FileText size={16} />
            Governance Log
          </button>
        </div>
      </motion.div>

      {/* Executive Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <InsightCard
          icon={AlertTriangle}
          value={insights.departmentsAttention}
          label="Departments Requiring Attention"
          trend={12}
          subtitle={insights.departmentsAttention > 0 ? `${insights.departmentsAttention} staff below engagement threshold` : "All departments performing well"}
        />
        <InsightCard
          icon={Clock}
          value={insights.pendingEscalations}
          label="Pending Communication Escalations"
          trend="danger"
          subtitle={insights.pendingEscalations > 0 ? `${insights.pendingEscalations} items requiring review` : "No escalations pending"}
        />
        <InsightCard
          icon={Activity}
          value={`${insights.avgEngagement}%`}
          label="Avg Department Engagement"
          trend={3}
          subtitle={insights.avgEngagement >= 70 ? "Healthy communication participation" : "Below institutional target"}
        />
        <InsightCard
          icon={Users}
          value={insights.inactiveStaff}
          label="Inactive Staff Members"
          trend={inactiveStaff > 0 ? -8 : 0}
          subtitle={insights.inactiveStaff > 0 ? `${insights.inactiveStaff} staff need engagement follow-up` : "All staff actively participating"}
        />
      </div>

      {/* Audit Log Drawer */}
      <AnimatePresence>
        {showAudit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-400" />
                  <h3 className="text-base font-semibold text-foreground">Governance Activity Log</h3>
                </div>
                <button
                  onClick={() => setShowAudit(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 border border-border">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                      <FileText size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{entry.action}</span>
                        <StatusIndicator status={entry.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.staff} &middot; {entry.type}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(entry.timestamp).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Table Card */}
      <GlassCard className="p-0 overflow-hidden min-h-[400px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 md:p-5 border-b border-border bg-white/[0.01] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, department, or role..."
              className="w-full bg-black/40 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users size={14} />
            <span>{filteredStaff.length} of {staff.length} staff</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="p-4 pl-5 font-semibold">Staff Member</th>
                <th className="p-4 font-semibold">Responsibility</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Activity</th>
                <th className="p-4 font-semibold">Engagement</th>
                <th className="p-4 pr-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member, idx) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Staff Member */}
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                          {member.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {member.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Responsibility */}
                    <td className="p-4">
                      <ResponsibilityBadge role={member.responsibility} />
                    </td>

                    {/* Department */}
                    <td className="p-4 text-sm text-muted-foreground">
                      {member.dept}
                    </td>

                    {/* Activity */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <ActivityBadge activity={member.activity} />
                        <span className="text-[10px] text-muted-foreground">
                          {member.activityLabel}
                        </span>
                      </div>
                    </td>

                    {/* Engagement */}
                    <td className="p-4">
                      <EngagementBadge score={member.engagementScore} />
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton
                          icon={Eye}
                          label="History"
                          variant="default"
                          onClick={() => {}}
                        />
                        <ActionButton
                          icon={Edit2}
                          label="Recommend"
                          variant="primary"
                          onClick={() => openRecommendation(member)}
                        />
                        {member.activity === "Inactive" && (
                          <ActionButton
                            icon={Send}
                            label="Remind"
                            variant="warning"
                            onClick={() => {}}
                          />
                        )}
                        {member.pendingQueue > 2 && (
                          <ActionButton
                            icon={AlertTriangle}
                            label="Escalate"
                            variant="danger"
                            onClick={() => openRecommendation(member)}
                          />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Users}
                      title="No staff match your search"
                      description="Try adjusting your search query or filters"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        <div className="p-4 border-t border-border bg-white/[0.01] flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {staff.filter(s => s.activity === "Active").length} Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {staff.filter(s => s.activity === "Inactive").length} Inactive
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              {staff.filter(s => s.activity === "Low Engagement").length} At Risk
            </span>
          </div>
          <span>Updated just now</span>
        </div>
      </GlassCard>

      {/* Recommendation Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-background border border-border rounded-2xl p-6 shadow-2xl z-10"
            >
              {modalStep === "select" && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        Recommend Organizational Adjustment
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedMember.name} &middot; {selectedMember.dept}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Recommendation Type
                    </label>
                    <div className="space-y-2">
                      {recommendations.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setRecommendationType(r.value)}
                          className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
                            recommendationType === r.value
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-accent/30 text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          <div className={`p-1 rounded-md ${
                            recommendationType === r.value ? "bg-blue-500/20" : "bg-accent"
                          }`}>
                            <ChevronRight size={14} className={recommendationType === r.value ? "text-blue-400" : "text-muted-foreground"} />
                          </div>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Reason for Recommendation
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide context for this recommendation..."
                      rows={3}
                      className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500/50 resize-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
                    <p className="text-xs text-amber-400 flex items-start gap-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      This recommendation will be reviewed by system administration before any changes are applied.
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!recommendationType || !reason.trim() || submitting}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Recommendation"
                      )}
                    </button>
                  </div>
                </>
              )}

              {modalStep === "submitted" && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Recommendation Submitted</h2>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                    Your recommendation for <strong className="text-foreground">{selectedMember?.name}</strong> has been
                    logged and forwarded to system administration for review.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
                    <Clock size={12} />
                    <span>Expected review: 24-48 hours</span>
                  </div>
                  <div className="bg-accent/30 border border-border rounded-xl p-4 text-left mb-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Reference ID</span>
                      <span className="text-foreground font-mono">GOV-{Date.now().toString(36).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Type</span>
                      <span className="text-foreground">
                        {recommendations.find(r => r.value === recommendationType)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Status</span>
                      <StatusIndicator status="Pending Review" />
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
