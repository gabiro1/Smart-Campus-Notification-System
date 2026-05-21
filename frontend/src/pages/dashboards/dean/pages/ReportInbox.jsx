import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  ChevronRight,
  Send,
  Eye,
  Building2,
  User,
  Calendar,
  Activity,
  Loader2,
  ShieldAlert,
  ArrowLeft,
  MessageSquare,
  Download,
  ThumbsUp,
  Plus,
  Sparkles,
  Upload,
  Paperclip,
  File,
  Trash2,
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import EmptyState from "@/components/shared/feedback/EmptyState";
import LoadingSkeleton from "@/components/shared/feedback/LoadingSkeleton";
import reportService from "../../../../services/reportService";
import copilotService from "../../../../services/copilotService";

/* ─── Status Config ─── */
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
      <span className={`w-1.5 h-1.5 rounded-full ${status === "submitted" ? "bg-blue-400 animate-pulse" : c.color.replace("text-", "bg-")}`} />
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

/* ─── Action Button ─── */
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

/* ─── Metrics Display ─── */
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

/* ─── Lifecycle Timeline ─── */
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

/* ─── Main Component ─── */
export default function ReportInbox() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [filter, setFilter] = useState("all");
  const [counts, setCounts] = useState({ pending_review: 0, under_review: 0, total: 0 });

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "", summary: "", reportingPeriod: { start: "", end: "", label: "" },
    metrics: [], notes: "", riskFlags: [],
  });
  const [createFiles, setCreateFiles] = useState([]);
  const [aiLoading, setAiLoading] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportService.getPendingReview();
      setReports(res.data || []);
      setCounts(res.counts || {});
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

  const handleAction = async (action, reportId) => {
    const needsComment = action === "reject" || action === "request_revision" || action === "escalate";
    if (needsComment && !commentText.trim()) {
      setShowCommentInput(action);
      return;
    }
    if (showCommentInput && !commentText.trim() && needsComment) return;

    setActionLoading(action);
    try {
      switch (action) {
        case "start_review":
          await reportService.startReview(reportId);
          break;
        case "approve":
          await reportService.approveReport(reportId, commentText);
          break;
        case "reject":
          await reportService.rejectReport(reportId, commentText);
          break;
        case "request_revision":
          await reportService.requestRevision(reportId, commentText);
          break;
        case "acknowledge":
          await reportService.acknowledgeReport(reportId, commentText);
          break;
        case "escalate":
          await reportService.escalateReport(reportId, commentText);
          break;
        case "add_note":
          await reportService.addNote(reportId, commentText);
          break;
      }
      setCommentText("");
      setShowCommentInput(null);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAIParaphrase = async (field) => {
    const text = createForm[field];
    if (!text?.trim()) return;
    setAiLoading(field);
    try {
      const res = await copilotService.paraphrase(text, "professional");
      if (res?.paraphrased) setCreateForm(prev => ({ ...prev, [field]: res.paraphrased }));
    } catch (err) {
      console.error("AI paraphrase failed:", err);
    } finally {
      setAiLoading(null);
    }
  };

  const addMetric = () => setCreateForm(prev => ({ ...prev, metrics: [...prev.metrics, { label: "", value: "", unit: "", trend: "stable" }] }));
  const updateMetric = (idx, field, value) => setCreateForm(prev => {
    const m = [...prev.metrics]; m[idx] = { ...m[idx], [field]: value }; return { ...prev, metrics: m };
  });
  const removeMetric = (idx) => setCreateForm(prev => ({ ...prev, metrics: prev.metrics.filter((_, i) => i !== idx) }));

  const addRiskFlag = () => setCreateForm(prev => ({ ...prev, riskFlags: [...prev.riskFlags, { severity: "info", message: "" }] }));
  const updateRiskFlag = (idx, field, value) => setCreateForm(prev => {
    const r = [...prev.riskFlags]; r[idx] = { ...r[idx], [field]: value }; return { ...prev, riskFlags: r };
  });
  const removeRiskFlag = (idx) => setCreateForm(prev => ({ ...prev, riskFlags: prev.riskFlags.filter((_, i) => i !== idx) }));

  const handleFileSelect = (e) => {
    setCreateFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    e.target.value = "";
  };
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    setCreateFiles(prev => [...prev, ...Array.from(e.dataTransfer.files || [])]);
  };
  const removeFile = (idx) => setCreateFiles(prev => prev.filter((_, i) => i !== idx));
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleCreateDraft = async () => {
    if (!createForm.title.trim()) return;
    setCreateLoading(true);
    try {
      const hasFiles = createFiles.length > 0;
      let payload;
      if (hasFiles) {
        const fd = new FormData();
        fd.append("title", createForm.title);
        fd.append("summary", createForm.summary);
        fd.append("reportingPeriod", JSON.stringify(createForm.reportingPeriod));
        fd.append("metrics", JSON.stringify(createForm.metrics.filter(m => m.label.trim()).map(m => ({
          label: m.label, value: isNaN(Number(m.value)) ? m.value : Number(m.value), unit: m.unit, trend: m.trend === "stable" ? null : m.trend,
        }))));
        fd.append("notes", createForm.notes);
        fd.append("riskFlags", JSON.stringify(createForm.riskFlags.filter(r => r.message.trim()).map(r => ({ severity: r.severity, message: r.message }))));
        createFiles.forEach(f => fd.append("attachments", f));
        payload = fd;
      } else {
        payload = {
          title: createForm.title, summary: createForm.summary,
          reportingPeriod: createForm.reportingPeriod,
          metrics: createForm.metrics.filter(m => m.label.trim()).map(m => ({
            label: m.label, value: isNaN(Number(m.value)) ? m.value : Number(m.value), unit: m.unit, trend: m.trend === "stable" ? null : m.trend,
          })),
          notes: createForm.notes,
          riskFlags: createForm.riskFlags.filter(r => r.message.trim()).map(r => ({ severity: r.severity, message: r.message })),
        };
      }
      await reportService.create(payload);
      setShowCreate(false);
      setCreateFiles([]);
      setCreateForm({ title: "", summary: "", reportingPeriod: { start: "", end: "", label: "" }, metrics: [], notes: "", riskFlags: [] });
    } catch (err) {
      console.error("Failed to create report:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!createForm.title.trim()) return;
    setCreateLoading(true);
    try {
      const hasFiles = createFiles.length > 0;
      let payload;
      if (hasFiles) {
        const fd = new FormData();
        fd.append("title", createForm.title);
        fd.append("summary", createForm.summary);
        fd.append("reportingPeriod", JSON.stringify(createForm.reportingPeriod));
        fd.append("metrics", JSON.stringify(createForm.metrics.filter(m => m.label.trim()).map(m => ({
          label: m.label, value: isNaN(Number(m.value)) ? m.value : Number(m.value), unit: m.unit, trend: m.trend === "stable" ? null : m.trend,
        }))));
        fd.append("notes", createForm.notes);
        fd.append("riskFlags", JSON.stringify(createForm.riskFlags.filter(r => r.message.trim()).map(r => ({ severity: r.severity, message: r.message }))));
        createFiles.forEach(f => fd.append("attachments", f));
        payload = fd;
      } else {
        payload = {
          title: createForm.title, summary: createForm.summary,
          reportingPeriod: createForm.reportingPeriod,
          metrics: createForm.metrics.filter(m => m.label.trim()).map(m => ({
            label: m.label, value: isNaN(Number(m.value)) ? m.value : Number(m.value), unit: m.unit, trend: m.trend === "stable" ? null : m.trend,
          })),
          notes: createForm.notes,
          riskFlags: createForm.riskFlags.filter(r => r.message.trim()).map(r => ({ severity: r.severity, message: r.message })),
        };
      }
      const res = await reportService.create(payload);
      const id = res.data?._id || res.report?._id;
      if (id) await reportService.submit(id);
      setShowCreate(false);
      setCreateFiles([]);
      setCreateForm({ title: "", summary: "", reportingPeriod: { start: "", end: "", label: "" }, metrics: [], notes: "", riskFlags: [] });
      fetchReports();
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setShowCreate(false);
    setCreateFiles([]);
    setCreateForm({ title: "", summary: "", reportingPeriod: { start: "", end: "", label: "" }, metrics: [], notes: "", riskFlags: [] });
  };

  const filteredReports = filter === "all"
    ? reports
    : reports.filter(r => r.status === filter);

  const showActions = (status) => ["submitted", "under_review", "approved", "revision_requested"].includes(status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Report Inbox</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review, approve, and acknowledge departmental reports.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-xl transition-all"
        >
          <Plus size={14} /> New Report
        </button>
      </motion.div>

      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "Pending Review", value: counts.pending_review, color: "text-blue-400", bg: "bg-blue-500/10", pulse: counts.pending_review > 0 },
          { label: "Under Review", value: counts.under_review, color: "text-amber-400", bg: "bg-amber-500/10", pulse: false },
          { label: "Total Submitted", value: counts.total, color: "text-muted-foreground", bg: "bg-accent", pulse: false },
        ].map((item) => (
          <div key={item.label} className="bg-card backdrop-blur-xl border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-lg ${item.bg}`}>
                <FileText size={14} className={item.color} />
              </div>
              {item.pulse && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
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
            title={filter === "all" ? "No reports submitted" : `No ${filter.replace("_", " ")} reports`}
            description={filter === "all" ? "Departments have not submitted any reports yet. Reports will appear here once submitted." : `No reports with status "${filter.replace("_", " ")}"`}
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
              onClick={() => openDetail(report)}
              className="bg-card backdrop-blur-xl border border-border rounded-2xl p-4 hover:bg-accent/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{report.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {report.authorName || report.authorId?.name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={11} />
                      {report.departmentName || "Unknown Dept"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDateShort(report.reportingPeriod?.start)} — {formatDateShort(report.reportingPeriod?.end)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <StatusBadge status={report.status} />
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedReport(null); setShowCommentInput(null); setCommentText(""); }}
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
                    {selectedReport.departmentName} &middot; Submitted by {selectedReport.authorName}
                    &middot; {formatDateShort(selectedReport.reportingPeriod?.start)} — {formatDateShort(selectedReport.reportingPeriod?.end)}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedReport(null); setShowCommentInput(null); setCommentText(""); }}
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

                  {/* Review Info */}
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
                        <ThumbsUp size={14} className="text-emerald-400" />
                        <p className="text-sm font-medium text-emerald-400">Acknowledged</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        By {selectedReport.acknowledgedBy?.name || "Dean"} &middot; {formatDate(selectedReport.acknowledgedAt)}
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

                  {/* Comment Input */}
                  {showCommentInput && (
                    <div className="space-y-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={
                          showCommentInput === "request_revision" ? "Describe what needs to be revised..." :
                          showCommentInput === "escalate" ? "Reason for escalation..." :
                          "Add comments..."
                        }
                        rows={3}
                        className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-blue-500/50 resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <ActionBtn icon={X} label="Cancel" variant="ghost" onClick={() => { setShowCommentInput(null); setCommentText(""); }} />
                        <ActionBtn
                          icon={Send}
                          label="Confirm"
                          variant="primary"
                          loading={actionLoading === showCommentInput}
                          disabled={!commentText.trim()}
                          onClick={() => handleAction(showCommentInput, selectedReport._id)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions (not shown when comment input is active) */}
                  {!showCommentInput && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                      {selectedReport.status === "submitted" && (
                        <ActionBtn icon={Eye} label="Start Review" variant="primary"
                          loading={actionLoading === "start_review"}
                          onClick={() => handleAction("start_review", selectedReport._id)} />
                      )}
                      {selectedReport.status === "under_review" && (
                        <>
                          <ActionBtn icon={CheckCircle2} label="Approve" variant="success"
                            loading={actionLoading === "approve"}
                            onClick={() => handleAction("approve", selectedReport._id)} />
                          <ActionBtn icon={AlertTriangle} label="Request Revision" variant="warning"
                            onClick={() => setShowCommentInput("request_revision")} />
                          <ActionBtn icon={X} label="Reject" variant="danger"
                            onClick={() => setShowCommentInput("reject")} />
                          <ActionBtn icon={ShieldAlert} label="Escalate" variant="ghost"
                            onClick={() => setShowCommentInput("escalate")} />
                        </>
                      )}
                      {selectedReport.status === "approved" && (
                        <>
                          <ActionBtn icon={ThumbsUp} label="Acknowledge" variant="success"
                            loading={actionLoading === "acknowledge"}
                            onClick={() => handleAction("acknowledge", selectedReport._id)} />
                          <ActionBtn icon={MessageSquare} label="Add Note" variant="ghost"
                            onClick={() => setShowCommentInput("add_note")} />
                        </>
                      )}
                      {(selectedReport.status === "revision_requested" || selectedReport.status === "rejected") && (
                        <p className="text-xs text-muted-foreground">Waiting for department to resubmit.</p>
                      )}
                      {selectedReport.status === "acknowledged" && (
                        <p className="text-xs text-emerald-400">This report has been acknowledged and its data is included in institutional analytics.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Report Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetCreateForm}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-start justify-between sticky top-0 bg-background z-10">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Create New Report</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Submit a report to the Principal for review.</p>
                </div>
                <button onClick={resetCreateForm} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 ml-3">
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
                    type="text" value={createForm.title}
                    onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. School Performance Summary"
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                {/* Reporting Period */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Period Start</label>
                    <input type="date" value={createForm.reportingPeriod.start}
                      onChange={e => setCreateForm(prev => ({ ...prev, reportingPeriod: { ...prev.reportingPeriod, start: e.target.value } }))}
                      className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Period End</label>
                    <input type="date" value={createForm.reportingPeriod.end}
                      onChange={e => setCreateForm(prev => ({ ...prev, reportingPeriod: { ...prev.reportingPeriod, end: e.target.value } }))}
                      className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50" />
                  </div>
                </div>

                {/* Executive Summary + AI */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Executive Summary</label>
                    <button onClick={() => handleAIParaphrase("summary")} disabled={!createForm.summary.trim() || aiLoading === "summary"}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-colors"
                    >
                      {aiLoading === "summary" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {aiLoading === "summary" ? "Polishing..." : "Polish with AI"}
                    </button>
                  </div>
                  <textarea value={createForm.summary} onChange={e => setCreateForm(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief overview..." rows={3}
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50 resize-none" />
                </div>

                {/* Metrics */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance Metrics</label>
                    <button onClick={addMetric} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                      <Plus size={12} /> Add Metric
                    </button>
                  </div>
                  <div className="space-y-2">
                    {createForm.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-accent/30 rounded-xl p-3 border border-border">
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input type="text" value={metric.label} onChange={e => updateMetric(idx, "label", e.target.value)} placeholder="Label" className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50" />
                          <input type="text" value={metric.value} onChange={e => updateMetric(idx, "value", e.target.value)} placeholder="Value" className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50" />
                          <input type="text" value={metric.unit} onChange={e => updateMetric(idx, "unit", e.target.value)} placeholder="Unit" className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50" />
                          <select value={metric.trend} onChange={e => updateMetric(idx, "trend", e.target.value)} className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50">
                            <option value="stable">Stable →</option>
                            <option value="up">Up ↑</option>
                            <option value="down">Down ↓</option>
                          </select>
                        </div>
                        <button onClick={() => removeMetric(idx)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 shrink-0"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    {createForm.metrics.length === 0 && <p className="text-xs text-muted-foreground">Click "Add Metric" to include performance indicators.</p>}
                  </div>
                </div>

                {/* Risk Flags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Flags</label>
                    <button onClick={addRiskFlag} className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
                      <Plus size={12} /> Add Risk Flag
                    </button>
                  </div>
                  <div className="space-y-2">
                    {createForm.riskFlags.map((flag, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-accent/30 rounded-xl p-3 border border-border">
                        <select value={flag.severity} onChange={e => updateRiskFlag(idx, "severity", e.target.value)}
                          className="bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50 shrink-0">
                          <option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option>
                        </select>
                        <input type="text" value={flag.message} onChange={e => updateRiskFlag(idx, "message", e.target.value)}
                          placeholder="Describe the risk..." className="flex-1 bg-black/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500/50" />
                        <button onClick={() => removeRiskFlag(idx)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 shrink-0"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    {createForm.riskFlags.length === 0 && <p className="text-xs text-muted-foreground">Click "Add Risk Flag" to highlight concerns.</p>}
                  </div>
                </div>

                {/* File Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">File Attachments</label>
                    <label className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer">
                      <Upload size={12} /> Upload Files
                      <input type="file" multiple className="hidden" onChange={handleFileSelect} />
                    </label>
                  </div>
                  <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${dragOver ? "border-blue-400 bg-blue-500/5" : "border-border bg-accent/20"}`}>
                    <Upload size={20} className="mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Drag & drop files here, or{" "}
                      <label className="text-blue-400 hover:text-blue-300 cursor-pointer underline">browse<input type="file" multiple className="hidden" onChange={handleFileSelect} /></label>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">PDF, DOC, DOCX, images (max 10MB each)</p>
                  </div>
                  {createFiles.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {createFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-accent/30 rounded-lg px-3 py-2 border border-border">
                          <File size={14} className="text-muted-foreground shrink-0" />
                          <span className="flex-1 text-xs text-foreground truncate">{file.name}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
                          <button onClick={() => removeFile(idx)} className="p-0.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes + AI */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
                    <button onClick={() => handleAIParaphrase("notes")} disabled={!createForm.notes.trim() || aiLoading === "notes"}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 disabled:opacity-40 transition-colors"
                    >
                      {aiLoading === "notes" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {aiLoading === "notes" ? "Polishing..." : "Polish with AI"}
                    </button>
                  </div>
                  <textarea value={createForm.notes} onChange={e => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional context..." rows={3}
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50 resize-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-border flex items-center justify-end gap-2">
                <button onClick={resetCreateForm} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-accent hover:bg-accent/80 text-foreground border border-border transition-all">
                  <X size={14} /> Cancel
                </button>
                <button onClick={handleCreateDraft} disabled={!createForm.title.trim() || createLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-accent hover:bg-accent/80 text-foreground border border-border transition-all disabled:opacity-50">
                  {createLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  Save as Draft
                </button>
                <button onClick={handleCreateSubmit} disabled={!createForm.title.trim() || createLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50">
                  {createLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit for Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
