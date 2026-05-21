import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  ChevronRight,
  Send,
  Building2,
  User,
  Calendar,
  Activity,
  Loader2,
  ShieldAlert,
  Trash2,
  Edit3,
  GripVertical,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import EmptyState from "@/components/shared/feedback/EmptyState";
import LoadingSkeleton from "@/components/shared/feedback/LoadingSkeleton";
import reportService from "../../../../services/reportService";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-accent", border: "border-border" },
  submitted: { label: "Submitted", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  under_review: { label: "Under Review", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  rejected: { label: "Rejected", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  revision_requested: { label: "Revision Needed", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  acknowledged: { label: "Acknowledged", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${c.color} ${c.bg} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.color.replace("text-", "bg-")}`} />
      {c.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ActionBtn({ icon: Icon, label, onClick, variant = "primary", loading = false, disabled = false }) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
    warning: "bg-amber-600 hover:bg-amber-500 text-white",
    ghost: "bg-accent hover:bg-accent/80 text-foreground border border-border",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ${variants[variant]}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  );
}

function MetricRow({ label, value, unit, trend, isAnomaly }) {
  return (
    <div className={`flex items-center justify-between p-2.5 rounded-lg ${isAnomaly ? "bg-rose-500/5 border border-rose-500/15" : "bg-accent/30"}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {isAnomaly && <AlertTriangle size={12} className="text-rose-400" />}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${isAnomaly ? "text-rose-400" : "text-foreground"}`}>
          {value}{unit}
        </span>
        {trend && (
          <span className={`text-[11px] ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-muted-foreground"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
    </div>
  );
}

function LifecycleTimeline({ entries }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No history recorded.</p>;
  }

  const actionLabels = {
    created: "Report created",
    submitted: "Submitted for review",
    under_review: "Review started",
    approved: "Approved",
    rejected: "Rejected",
    revision_requested: "Revision requested",
    acknowledged: "Acknowledged",
    escalated: "Escalated",
    note_added: "Note added",
    resubmitted: "Resubmitted",
  };

  return (
    <div className="relative pl-6 space-y-4">
      <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-border" />
      {entries.slice().reverse().map((entry, idx) => (
        <div key={idx} className="relative">
          <div className={`absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
            entry.action === "approved" || entry.action === "acknowledged" ? "border-emerald-500 bg-emerald-500/20" :
            entry.action === "rejected" || entry.action === "escalated" ? "border-rose-500 bg-rose-500/20" :
            entry.action === "revision_requested" ? "border-orange-500 bg-orange-500/20" :
            "border-blue-500 bg-blue-500/20"
          }`} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {actionLabels[entry.action] || entry.action}
              </p>
              {entry.comments && (
                <p className="text-xs text-muted-foreground mt-0.5">{entry.comments}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {entry.actorName || entry.actorRole} &middot; {formatDate(entry.timestamp)}
              </p>
            </div>
            {entry.previousStatus && entry.newStatus && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <StatusBadge status={entry.previousStatus} />
                <ChevronRight size={10} />
                <StatusBadge status={entry.newStatus} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const emptyReport = {
  title: "",
  summary: "",
  reportingPeriod: { start: "", end: "", label: "" },
  metrics: [],
  notes: "",
  riskFlags: [],
};

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  const [counts, setCounts] = useState({ total: 0, drafts: 0, submitted: 0, revision_requested: 0 });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyReport, reportingPeriod: { start: "", end: "", label: "" } });
  const [submitting, setSubmitting] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportService.getMine();
      const data = res.data || [];
      setReports(data);
      setCounts({
        total: data.length,
        drafts: data.filter(r => r.status === "draft").length,
        submitted: data.filter(r => r.status === "submitted" || r.status === "under_review").length,
        revision_requested: data.filter(r => r.status === "revision_requested").length,
      });
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const openDetail = async (report) => {
    try {
      setDetailLoading(true);
      const res = await reportService.getReport(report._id);
      setSelectedReport(res.data);
    } catch (err) {
      console.error("Failed to fetch report detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyReport, reportingPeriod: { start: "", end: "", label: "" } });
    setShowForm(true);
  };

  const openEditForm = (report) => {
    setEditingId(report._id);
    setForm({
      title: report.title || "",
      summary: report.summary || "",
      reportingPeriod: {
        start: report.reportingPeriod?.start ? report.reportingPeriod.start.slice(0, 10) : "",
        end: report.reportingPeriod?.end ? report.reportingPeriod.end.slice(0, 10) : "",
        label: report.reportingPeriod?.label || "",
      },
      metrics: report.metrics?.length > 0 ? report.metrics.map(m => ({ label: m.label, value: m.value ?? "", unit: m.unit || "", trend: m.trend || "stable" })) : [],
      notes: report.notes || "",
      riskFlags: report.riskFlags?.length > 0 ? report.riskFlags.map(r => ({ severity: r.severity || "info", message: r.message || "" })) : [],
    });
    setShowForm(true);
  };

  const addMetric = () => {
    setForm(prev => ({
      ...prev,
      metrics: [...prev.metrics, { label: "", value: "", unit: "", trend: "stable" }],
    }));
  };

  const updateMetric = (idx, field, value) => {
    setForm(prev => {
      const m = [...prev.metrics];
      m[idx] = { ...m[idx], [field]: value };
      return { ...prev, metrics: m };
    });
  };

  const removeMetric = (idx) => {
    setForm(prev => ({ ...prev, metrics: prev.metrics.filter((_, i) => i !== idx) }));
  };

  const addRiskFlag = () => {
    setForm(prev => ({
      ...prev,
      riskFlags: [...prev.riskFlags, { severity: "info", message: "" }],
    }));
  };

  const updateRiskFlag = (idx, field, value) => {
    setForm(prev => {
      const r = [...prev.riskFlags];
      r[idx] = { ...r[idx], [field]: value };
      return { ...prev, riskFlags: r };
    });
  };

  const removeRiskFlag = (idx) => {
    setForm(prev => ({ ...prev, riskFlags: prev.riskFlags.filter((_, i) => i !== idx) }));
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        reportingPeriod: {
          start: form.reportingPeriod.start || new Date().toISOString(),
          end: form.reportingPeriod.end || new Date().toISOString(),
          label: form.reportingPeriod.label || undefined,
        },
        metrics: form.metrics.filter(m => m.label.trim()).map(m => ({
          label: m.label,
          value: isNaN(Number(m.value)) ? m.value : Number(m.value),
          unit: m.unit,
          trend: m.trend === "stable" ? null : m.trend,
        })),
        notes: form.notes,
        riskFlags: form.riskFlags.filter(r => r.message.trim()).map(r => ({
          severity: r.severity,
          message: r.message,
        })),
      };

      if (editingId) {
        await reportService.update(editingId, payload);
      } else {
        await reportService.create(payload);
      }

      setShowForm(false);
      fetchReports();
    } catch (err) {
      console.error("Failed to save report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      let id = editingId;
      if (!id) {
        const payload = {
          title: form.title,
          summary: form.summary,
          reportingPeriod: {
            start: form.reportingPeriod.start || new Date().toISOString(),
            end: form.reportingPeriod.end || new Date().toISOString(),
            label: form.reportingPeriod.label || undefined,
          },
          metrics: form.metrics.filter(m => m.label.trim()).map(m => ({
            label: m.label,
            value: isNaN(Number(m.value)) ? m.value : Number(m.value),
            unit: m.unit,
            trend: m.trend === "stable" ? null : m.trend,
          })),
          notes: form.notes,
          riskFlags: form.riskFlags.filter(r => r.message.trim()).map(r => ({
            severity: r.severity,
            message: r.message,
          })),
        };
        const res = await reportService.create(payload);
        id = res.data?._id || res.report?._id;
      } else {
        await reportService.update(id, {
          title: form.title,
          summary: form.summary,
          reportingPeriod: {
            start: form.reportingPeriod.start || new Date().toISOString(),
            end: form.reportingPeriod.end || new Date().toISOString(),
            label: form.reportingPeriod.label || undefined,
          },
          metrics: form.metrics.filter(m => m.label.trim()).map(m => ({
            label: m.label,
            value: isNaN(Number(m.value)) ? m.value : Number(m.value),
            unit: m.unit,
            trend: m.trend === "stable" ? null : m.trend,
          })),
          notes: form.notes,
          riskFlags: form.riskFlags.filter(r => r.message.trim()).map(r => ({
            severity: r.severity,
            message: r.message,
          })),
        });
      }
      if (id) {
        await reportService.submit(id);
      }
      setShowForm(false);
      fetchReports();
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async (id) => {
    setActionLoading("resubmit_" + id);
    try {
      await reportService.submit(id);
      fetchReports();
    } catch (err) {
      console.error("Failed to resubmit:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = filter === "all"
    ? reports
    : reports.filter(r => r.status === filter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Report Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and submit departmental reports for Dean's review.
          </p>
        </div>
        <ActionBtn icon={Plus} label="New Report" variant="primary" onClick={openCreateForm} />
      </motion.div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Total Reports", value: counts.total, color: "text-muted-foreground", bg: "bg-accent", icon: FileText },
          { label: "Drafts", value: counts.drafts, color: "text-muted-foreground", bg: "bg-accent", icon: Edit3 },
          { label: "Active Submissions", value: counts.submitted, color: counts.submitted > 0 ? "text-blue-400" : "text-muted-foreground", bg: counts.submitted > 0 ? "bg-blue-500/10" : "bg-accent", icon: Send, pulse: counts.submitted > 0 },
          { label: "Revision Needed", value: counts.revision_requested, color: counts.revision_requested > 0 ? "text-orange-400" : "text-muted-foreground", bg: counts.revision_requested > 0 ? "bg-orange-500/10" : "bg-accent", icon: AlertTriangle, pulse: counts.revision_requested > 0 },
        ].map((item) => (
          <div key={item.label} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-lg ${item.bg}`}>
                <item.icon size={14} className={item.color} />
              </div>
              {item.pulse && <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />}
            </div>
            <p className="text-xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: `All (${reports.length})` },
          { key: "draft", label: "Drafts" },
          { key: "submitted", label: "Submitted" },
          { key: "under_review", label: "Under Review" },
          { key: "approved", label: "Approved" },
          { key: "acknowledged", label: "Acknowledged" },
          { key: "revision_requested", label: "Revision Needed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
              filter === tab.key
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-accent/50 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card backdrop-blur-xl border-border rounded-2xl p-5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-accent rounded w-48" />
                  <div className="h-3 bg-accent rounded w-32" />
                </div>
                <div className="h-6 bg-accent rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={FileText}
            title={filter === "all" ? "No reports yet" : `No ${filter.replace("_", " ")} reports`}
            description={filter === "all" ? "Create your first departmental report to submit for Dean's review." : `No reports with status "${filter.replace("_", " ")}"`}
            action={filter === "all" ? { label: "Create Report", onClick: openCreateForm } : undefined}
          />
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filteredReports.map((report, idx) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-card backdrop-blur-xl border border-border rounded-2xl p-4 hover:bg-accent/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => openDetail(report)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{report.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDateShort(report.reportingPeriod?.start)} — {formatDateShort(report.reportingPeriod?.end)}
                    </span>
                    {report.metrics?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Activity size={11} />
                        {report.metrics.length} metrics
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <StatusBadge status={report.status} />
                  {report.status === "draft" && (
                    <ActionBtn icon={Edit3} label="Edit" variant="ghost" onClick={(e) => { e.stopPropagation(); openEditForm(report); }} />
                  )}
                  {report.status === "revision_requested" && (
                    <ActionBtn
                      icon={Send}
                      label="Resubmit"
                      variant="warning"
                      loading={actionLoading === "resubmit_" + report._id}
                      onClick={(e) => { e.stopPropagation(); handleResubmit(report._id); }}
                    />
                  )}
                  {report.status === "draft" && (
                    <ActionBtn
                      icon={Send}
                      label="Submit"
                      variant="primary"
                      onClick={(e) => { e.stopPropagation(); openEditForm(report); }}
                    />
                  )}
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-start justify-between sticky top-0 bg-background z-10">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{editingId ? "Edit Report" : "Create New Report"}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {editingId ? "Update your report before submitting." : "Fill in the details below to create a departmental report."}
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 ml-3"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Report Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Q1 Academic Performance Report"
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Reporting Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Period Start <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.reportingPeriod.start}
                      onChange={e => setForm(prev => ({ ...prev, reportingPeriod: { ...prev.reportingPeriod, start: e.target.value } }))}
                      className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Period End <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.reportingPeriod.end}
                      onChange={e => setForm(prev => ({ ...prev, reportingPeriod: { ...prev.reportingPeriod, end: e.target.value } }))}
                      className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Period Label
                    </label>
                    <input
                      type="text"
                      value={form.reportingPeriod.label}
                      onChange={e => setForm(prev => ({ ...prev, reportingPeriod: { ...prev.reportingPeriod, label: e.target.value } }))}
                      placeholder="e.g. Semester 1 2025"
                      className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Executive Summary */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Executive Summary
                  </label>
                  <textarea
                    value={form.summary}
                    onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief overview of the report findings..."
                    rows={3}
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>

                {/* Performance Metrics */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Performance Metrics
                    </label>
                    <button
                      onClick={addMetric}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Metric
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-accent/30 rounded-xl p-3 border border-border">
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            value={metric.label}
                            onChange={e => updateMetric(idx, "label", e.target.value)}
                            placeholder="Label"
                            className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50"
                          />
                          <input
                            type="text"
                            value={metric.value}
                            onChange={e => updateMetric(idx, "value", e.target.value)}
                            placeholder="Value"
                            className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50"
                          />
                          <input
                            type="text"
                            value={metric.unit}
                            onChange={e => updateMetric(idx, "unit", e.target.value)}
                            placeholder="Unit (e.g. %, pts)"
                            className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50"
                          />
                          <select
                            value={metric.trend}
                            onChange={e => updateMetric(idx, "trend", e.target.value)}
                            className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50"
                          >
                            <option value="stable">Stable →</option>
                            <option value="up">Up ↑</option>
                            <option value="down">Down ↓</option>
                          </select>
                        </div>
                        <button
                          onClick={() => removeMetric(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {form.metrics.length === 0 && (
                      <p className="text-xs text-muted-foreground">No metrics added yet. Click "Add Metric" to include performance indicators.</p>
                    )}
                  </div>
                </div>

                {/* Risk Flags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Risk Flags
                    </label>
                    <button
                      onClick={addRiskFlag}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Risk Flag
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.riskFlags.map((flag, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-accent/30 rounded-xl p-3 border border-border">
                        <select
                          value={flag.severity}
                          onChange={e => updateRiskFlag(idx, "severity", e.target.value)}
                          className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50 shrink-0"
                        >
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="critical">Critical</option>
                        </select>
                        <input
                          type="text"
                          value={flag.message}
                          onChange={e => updateRiskFlag(idx, "message", e.target.value)}
                          placeholder="Describe the risk..."
                          className="flex-1 bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50"
                        />
                        <button
                          onClick={() => removeRiskFlag(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {form.riskFlags.length === 0 && (
                      <p className="text-xs text-muted-foreground">No risk flags. Click "Add Risk Flag" to highlight concerns.</p>
                    )}
                  </div>
                </div>

                {/* Department Notes */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Department Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional context, observations, or recommendations..."
                    rows={3}
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-border flex items-center justify-end gap-2">
                <ActionBtn icon={X} label="Cancel" variant="ghost" onClick={() => setShowForm(false)} />
                <ActionBtn
                  icon={Edit3}
                  label="Save as Draft"
                  variant="ghost"
                  loading={submitting}
                  disabled={!form.title.trim()}
                  onClick={handleSaveDraft}
                />
                <ActionBtn
                  icon={Send}
                  label="Submit for Review"
                  variant="primary"
                  loading={submitting}
                  disabled={!form.title.trim()}
                  onClick={handleSubmit}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              className="relative w-full max-w-3xl bg-background border border-border rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-start justify-between sticky top-0 bg-background z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-foreground truncate">{selectedReport.title}</h2>
                    <StatusBadge status={selectedReport.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedReport.departmentName || "My Department"}
                    &middot; {formatDateShort(selectedReport.reportingPeriod?.start)} — {formatDateShort(selectedReport.reportingPeriod?.end)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 ml-3"
                >
                  <X size={18} />
                </button>
              </div>

              {detailLoading ? (
                <div className="p-8 space-y-4">
                  <LoadingSkeleton variant="text" width="w-1/2" />
                  <LoadingSkeleton variant="text" />
                  <LoadingSkeleton variant="text" />
                  <div className="h-32 bg-accent rounded-xl" />
                </div>
              ) : (
                <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Summary */}
                  {selectedReport.summary && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Executive Summary</p>
                      <p className="text-sm text-foreground">{selectedReport.summary}</p>
                    </div>
                  )}

                  {/* Metrics */}
                  {selectedReport.metrics && selectedReport.metrics.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Performance Metrics</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedReport.metrics.map((m, i) => (
                          <MetricRow key={i} {...m} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedReport.notes && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Department Notes</p>
                      <p className="text-sm text-foreground bg-accent/30 rounded-xl p-3 border border-border">{selectedReport.notes}</p>
                    </div>
                  )}

                  {/* Risk Flags */}
                  {selectedReport.riskFlags && selectedReport.riskFlags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Flags</p>
                      <div className="space-y-1.5">
                        {selectedReport.riskFlags.map((flag, i) => (
                          <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl border text-sm ${
                            flag.severity === "critical" ? "bg-rose-500/5 border-rose-500/20 text-rose-300" :
                            flag.severity === "warning" ? "bg-amber-500/5 border-amber-500/20 text-amber-300" :
                            "bg-blue-500/5 border-blue-500/20 text-blue-300"
                          }`}>
                            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                            <span>{flag.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Comments */}
                  {selectedReport.reviewComments && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Review Comments</p>
                      <p className="text-sm text-foreground bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">{selectedReport.reviewComments}</p>
                    </div>
                  )}

                  {selectedReport.revisionRequest && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Revision Request</p>
                      <p className="text-sm text-foreground bg-orange-500/5 border border-orange-500/15 rounded-xl p-3">{selectedReport.revisionRequest}</p>
                    </div>
                  )}

                  {/* Acknowledgement Info */}
                  {selectedReport.status === "acknowledged" && (
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <p className="text-sm font-medium text-emerald-400">Acknowledged by Dean</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(selectedReport.acknowledgedAt)}
                      </p>
                    </div>
                  )}

                  {/* Lifecycle / Audit Trail */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} className="text-muted-foreground" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report Lifecycle</p>
                    </div>
                    <LifecycleTimeline entries={selectedReport.lifecycle} />
                  </div>

                  {/* HoD actions */}
                  {selectedReport.status === "revision_requested" && (
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <ActionBtn icon={Edit3} label="Edit & Resubmit" variant="warning"
                        onClick={() => { setSelectedReport(null); openEditForm(selectedReport); }} />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
