import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Eye, Edit2, Trash2, Send, Plus, X, Loader2, Save,
  Clock, CheckCircle, XCircle, UserCheck, AlertTriangle, RefreshCw,
  Mail, Phone, Building2, Shield, Calendar, User, Briefcase,
  Layers, GitBranch,
} from "lucide-react";
import { useStaffDrafts, useHrAssignments } from "../hooks/useHrDashboard";
import hrService from "../../../services/hrService";
import GlassCard from "@/components/shared/cards/GlassCard";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import EmptyState from "@/components/feedback/EmptyState";
import { HR_STATUS, HR_STATUS_LABELS, TARGET_ROLES, TARGET_ROLE_LIST } from "../constants/hrStatus";

// ═════════════════════════════════════════════
// 1. CONSTANTS
// ═════════════════════════════════════════════

const STATUS_CONFIG = Object.freeze({
  [HR_STATUS.DRAFT]:     { icon: Edit2,       gradient: "from-slate-500 to-gray-500",   dot: "bg-slate-500",  bg: "bg-slate-500/10", text: "text-slate-500" },
  [HR_STATUS.PENDING]:   { icon: Clock,        gradient: "from-amber-500 to-orange-500", dot: "bg-amber-500",  bg: "bg-amber-500/10", text: "text-amber-500" },
  [HR_STATUS.APPROVED]:  { icon: CheckCircle,  gradient: "from-emerald-500 to-teal-500", dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-500" },
  [HR_STATUS.REJECTED]:  { icon: XCircle,      gradient: "from-red-500 to-rose-500",     dot: "bg-red-500",    bg: "bg-red-500/10", text: "text-red-500" },
  [HR_STATUS.ACTIVATED]: { icon: UserCheck,    gradient: "from-violet-500 to-purple-500", dot: "bg-violet-500", bg: "bg-violet-500/10", text: "text-violet-500" },
});

const STAT_CARDS = Object.freeze([
  { key: "total",    label: "Total Records",    icon: Layers,      featured: true  },
  { key: "draft",    label: "In Draft",         icon: Edit2,       featured: false },
  { key: "pending",  label: "Pending Review",   icon: Clock,       featured: false },
  { key: "approved", label: "Approved",         icon: CheckCircle, featured: false },
  { key: "rejected", label: "Rejected",         icon: XCircle,     featured: false },
  { key: "activated",label: "Activated",        icon: UserCheck,   featured: true  },
]);

const TABS = Object.freeze([
  { key: "drafts",      label: "Staff Drafts",     icon: FileText },
  { key: "assignments", label: "Assignments",      icon: UserCheck },
]);

const WORKFLOW = Object.freeze({
  canEdit:   [HR_STATUS.DRAFT, HR_STATUS.REJECTED, HR_STATUS.PENDING],
  canDelete: [HR_STATUS.DRAFT],
  canSubmit: [HR_STATUS.DRAFT],
});

const INITIAL_FORM = Object.freeze({ fullName: "", email: "", phoneNumber: "", targetRole: "lecturer" });

// ═════════════════════════════════════════════
// 2. INLINE SUB-COMPONENTS
// ═════════════════════════════════════════════

function AnimatedNumber({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="tabular-nums"
    >
      {value}
    </motion.span>
  );
}

function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  const sz = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.bg} ${cfg.text} ${sz}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {HR_STATUS_LABELS[status] || status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, isActive, onClick, delay }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={[
        "rounded-2xl border text-left w-full p-5 transition-all duration-300 bg-card",
        isActive
          ? "border-border bg-accent/50 scale-[1.02]"
          : "border-border hover:shadow-md hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <Icon size={18} className="text-foreground" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground leading-none">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
        {sub && (
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-medium tracking-tight">
            {sub}
          </p>
        )}
      </div>
    </motion.button>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-500 capitalize">
      {TARGET_ROLES[role] || role}
    </span>
  );
}

function SourceBadge({ type }) {
  const isDraft = type === "draft";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
      isDraft ? "bg-slate-500/10 text-slate-400" : "bg-violet-500/10 text-violet-400"
    }`}>
      {isDraft ? <FileText size={10} /> : <UserCheck size={10} />}
      {isDraft ? "Draft" : "Assignment"}
    </span>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-accent/50 border border-border w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <motion.button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={[
              "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive ? "text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-card rounded-lg border border-border"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={14} />
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ActionBtn({ icon: Icon, title, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none ${className}`}
    >
      <Icon size={14} className={Icon === Loader2 ? "animate-spin" : ""} />
    </button>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value ?? "-"}</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</h4>
      <div className="bg-accent/30 rounded-xl px-4">{children}</div>
    </div>
  );
}

// ─── Overlay / Shell ────────────────────────

function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {children}
    </div>
  );
}

function ModalShell({ children, onClose, title, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto z-10"
    >
      <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <Icon size={16} className="text-foreground" />
            </div>
          )}
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
          <X size={16} />
        </button>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Create Draft Modal ─────────────────────

function CreateDraftModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await hrService.createStaffDraft(form);
      setForm(INITIAL_FORM);
      setSaving(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err.response?.data?.message || "Failed to create draft");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <ModalOverlay onClose={onClose}>
        <ModalShell onClose={onClose} title="Create Staff Draft" icon={Plus}>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <Field label="Full Name" id="create-name">
              <input type="text" id="create-name" value={form.fullName} onChange={set("fullName")} required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="e.g. John Doe"
              />
            </Field>
            <Field label="Email" id="create-email">
              <input type="email" id="create-email" value={form.email} onChange={set("email")} required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="e.g. john@university.edu"
              />
            </Field>
            <Field label="Phone Number" id="create-phone">
              <input type="tel" id="create-phone" value={form.phoneNumber} onChange={set("phoneNumber")}
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="e.g. +256 700 000 000"
              />
            </Field>
            <Field label="Target Role" id="create-role">
              <select id="create-role" value={form.targetRole} onChange={set("targetRole")} required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none"
              >
                {TARGET_ROLE_LIST.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} />
                Create Draft
              </button>
            </div>
          </form>
        </ModalShell>
      </ModalOverlay>
    </AnimatePresence>
  );
}

// ─── View Detail Modal ─────────────────────

function ViewDetailModal({ record, onClose, variant = "draft" }) {
  if (!record) return null;

  const org = record.department?.name
    ? { label: "Department", value: record.department.name }
    : record.school?.name
      ? { label: "School", value: record.school.name }
      : record.college?.name
        ? { label: "College", value: record.college.name }
        : null;

  const title = variant === "draft" ? "Staff Draft Details" : "Assignment Details";
  const icon = variant === "draft" ? FileText : UserCheck;

  return (
    <AnimatePresence>
      <ModalOverlay onClose={onClose}>
        <ModalShell onClose={onClose} title={title} icon={icon}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">{record.fullName}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Created {new Date(record.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={record.status} size="md" />
            </div>

            <Section title="Personal Info">
              <DetailRow icon={User} label="Full Name" value={record.fullName} />
              <DetailRow icon={Mail} label="Email" value={record.email} />
              <DetailRow icon={Phone} label="Phone" value={record.phoneNumber || "Not provided"} />
            </Section>

            <Section title="Role & Organization">
              <DetailRow icon={Shield} label="Target Role" value={TARGET_ROLES[record.targetRole] || record.targetRole} />
              {org && <DetailRow icon={Building2} label={org.label} value={org.value} />}
              <DetailRow icon={Briefcase} label="Status" value={<StatusBadge status={record.status} />} />
            </Section>

            <Section title="Timeline">
              <DetailRow icon={Calendar} label="Created" value={new Date(record.createdAt).toLocaleString()} />
              {record.updatedAt && <DetailRow icon={Calendar} label="Last Updated" value={new Date(record.updatedAt).toLocaleString()} />}
              {record.createdBy?.name && <DetailRow icon={User} label="Created By" value={record.createdBy.name} />}
              {record.approvedAt && <DetailRow icon={Calendar} label="Approved" value={new Date(record.approvedAt).toLocaleString()} />}
              {record.activatedAt && <DetailRow icon={Calendar} label="Activated" value={new Date(record.activatedAt).toLocaleString()} />}
            </Section>

            {variant === "assignment" && record.requester?.name && (
              <Section title="Request Info">
                <DetailRow icon={User} label="Requester" value={record.requester.name} />
                <DetailRow icon={Shield} label="Requester Role" value={record.requesterRole || "-"} />
              </Section>
            )}

            {record.rejectionReason && (
              <Section title="Rejection Reason">
                <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2 mt-1">{record.rejectionReason}</p>
              </Section>
            )}
          </div>
        </ModalShell>
      </ModalOverlay>
    </AnimatePresence>
  );
}

// ─── Edit Draft Modal ──────────────────────

function EditDraftModal({ draft, onClose, onSaved }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (draft) {
      setForm({
        fullName: draft.fullName || "",
        email: draft.email || "",
        phoneNumber: draft.phoneNumber || "",
        targetRole: draft.targetRole || "lecturer",
      });
      setError(null);
    }
  }, [draft]);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await hrService.updateStaffDraft(draft._id, form);
      setSaving(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err.response?.data?.message || "Failed to update draft");
    }
  };

  if (!draft) return null;

  return (
    <AnimatePresence>
      <ModalOverlay onClose={onClose}>
        <ModalShell onClose={onClose} title="Edit Staff Draft" icon={Edit2}>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <Field label="Full Name" id="edit-name">
              <input type="text" id="edit-name" value={form.fullName} onChange={set("fullName")} required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </Field>
            <Field label="Email" id="edit-email">
              <input type="email" id="edit-email" value={form.email} onChange={set("email")} required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </Field>
            <Field label="Phone Number" id="edit-phone">
              <input type="tel" id="edit-phone" value={form.phoneNumber} onChange={set("phoneNumber")}
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </Field>
            <Field label="Target Role" id="edit-role">
              <select id="edit-role" value={form.targetRole} onChange={set("targetRole")} required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none"
              >
                {TARGET_ROLE_LIST.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </form>
        </ModalShell>
      </ModalOverlay>
    </AnimatePresence>
  );
}

// ─── Confirm Modal ─────────────────────────

function ConfirmModal({ open, title, message, confirmLabel = "Delete", variant = "danger", onConfirm, onCancel }) {
  if (!open) return null;

  const styles = {
    danger: { bg: "bg-red-500/10", text: "text-red-500", btn: "bg-red-500 hover:bg-red-600" },
    warning: { bg: "bg-amber-500/10", text: "text-amber-500", btn: "bg-amber-500 hover:bg-amber-600" },
  };
  const s = styles[variant] || styles.danger;

  return (
    <AnimatePresence>
      <ModalOverlay onClose={onCancel}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10"
        >
          <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-accent text-muted-foreground">
            <X size={16} />
          </button>
          <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center mb-4`}>
            <AlertTriangle className={`w-6 h-6 ${s.text}`} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >Cancel</button>
            <button onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${s.btn}`}
            >{confirmLabel}</button>
          </div>
        </motion.div>
      </ModalOverlay>
    </AnimatePresence>
  );
}

// ─── Table shared sub-components ────────────

function TableHead({ columns }) {
  return (
    <thead>
      <tr className="border-b border-border">
        {columns.map((col) => (
          <th key={col.key}
            className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >{col.header}</th>
        ))}
      </tr>
    </thead>
  );
}

function TableRow({ row, columns, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
    >
      {columns.map((col) => (
        <td key={col.key} className={`px-4 py-3 ${col.className || "text-sm text-muted-foreground"}`}>
          {col.render ? col.render(row) : row[col.key] ?? "-"}
        </td>
      ))}
    </motion.tr>
  );
}

// ═════════════════════════════════════════════
// 3. MAIN COMPONENT
// ═════════════════════════════════════════════

export default function HrWorkflowDashboard({ defaultTab = "drafts" }) {
  // ── STATE ──────────────────────────────────
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [statusFilter, setStatusFilter] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [viewVariant, setViewVariant] = useState("draft");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitConfirm, setSubmitConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const { data: allDrafts = [], isLoading: draftsLoading, error: draftsError, refetch: refetchDrafts } = useStaffDrafts();
  const { data: allAssignments = [], isLoading: assignmentsLoading, error: assignmentsError, refetch: refetchAssignments } = useHrAssignments();

  const isLoading = activeTab === "drafts" ? draftsLoading : assignmentsLoading;
  const error = activeTab === "drafts" ? draftsError : assignmentsError;

  // ── DERIVED: Combined stats ────────────────
  const stats = useMemo(() => {
    let d = 0, p = 0, a = 0, r = 0, act = 0;
    for (const draft of allDrafts) {
      if (draft.status === HR_STATUS.DRAFT) d++;
      else if (draft.status === HR_STATUS.PENDING) p++;
      else if (draft.status === HR_STATUS.APPROVED) a++;
      else if (draft.status === HR_STATUS.REJECTED) r++;
      else if (draft.status === HR_STATUS.ACTIVATED) act++;
    }
    const as = { draft: 0, pending: 0, approved: 0, rejected: 0, activated: 0 };
    for (const assign of allAssignments) {
      if (assign.status === HR_STATUS.PENDING) as.pending++;
      else if (assign.status === HR_STATUS.APPROVED) as.approved++;
      else if (assign.status === HR_STATUS.REJECTED) as.rejected++;
      else if (assign.status === HR_STATUS.ACTIVATED) as.activated++;
    }
    const total = allDrafts.length + allAssignments.length;
    return {
      total,
      totalSub: `${allDrafts.length} drafts · ${allAssignments.length} assignments`,
      draft: d,
      draftSub: `${d} in drafts`,
      pending: p + as.pending,
      pendingSub: `${p} drafts · ${as.pending} assignments`,
      approved: a + as.approved,
      approvedSub: `${a} drafts · ${as.approved} assignments`,
      rejected: r + as.rejected,
      rejectedSub: `${r} drafts · ${as.rejected} assignments`,
      activated: act + as.activated,
      activatedSub: `${act} drafts · ${as.activated} assignments`,
    };
  }, [allDrafts, allAssignments]);

  // ── DERIVED: Table data ────────────────────
  const tableData = useMemo(() => {
    if (statusFilter) {
      if (activeTab === "drafts") return allDrafts.filter((d) => d.status === statusFilter);
      return allAssignments.filter((a) => a.status === statusFilter);
    }
    return activeTab === "drafts" ? allDrafts : allAssignments;
  }, [activeTab, statusFilter, allDrafts, allAssignments]);

  // ── REFRESH ─────────────────────────────────
  const refresh = useCallback(() => {
    setActionLoading(null);
    refetchDrafts();
    refetchAssignments();
  }, [refetchDrafts, refetchAssignments]);

  // ── HANDLERS ────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget);
    try {
      await hrService.deleteStaffDraft(deleteTarget);
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      setActionLoading(null);
      alert(err.response?.data?.message || "Failed to delete");
    }
  }, [deleteTarget, refresh]);

  const handleSubmitApproval = useCallback(async () => {
    const target = submitConfirm;
    if (!target) return;
    setActionLoading(target._id);
    setSubmitConfirm(null);
    try {
      await hrService.submitRoleAssignment(target._id);
      refresh();
    } catch (err) {
      setActionLoading(null);
      alert(err.response?.data?.message || "Failed to submit");
    }
  }, [submitConfirm, refresh]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setStatusFilter(null);
  }, []);

  const handleStatFilter = useCallback((key) => {
    const mapped = key === "total" || key === "draft" || key === "activated" ? null : key;
    setStatusFilter((prev) => (prev === mapped ? null : mapped));
  }, []);

  const handleView = useCallback((record, variant) => {
    setViewTarget(record);
    setViewVariant(variant);
  }, []);

  const isLoadingId = useCallback((id) => actionLoading === id, [actionLoading]);

  // ── COLUMNS ─────────────────────────────────
  const draftColumns = useMemo(() => [
    { key: "fullName", header: "Name", className: "text-sm font-medium text-foreground" },
    { key: "email", header: "Email" },
    { key: "targetRole", header: "Role", render: (r) => <RoleBadge role={r.targetRole} /> },
    {
      key: "department", header: "Department",
      render: (r) => r.department?.name || r.school?.name || r.college?.name || "-",
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "createdAt", header: "Created", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: "actions", header: "Actions",
      render: (r) => {
        const loading = isLoadingId(r._id);
        return (
          <div className="flex items-center gap-1">
            <ActionBtn icon={Eye} title="View" onClick={() => handleView(r, "draft")} />
            {WORKFLOW.canEdit.includes(r.status) && (
              <ActionBtn icon={Edit2} title="Edit" onClick={() => setEditTarget(r)} />
            )}
            {WORKFLOW.canDelete.includes(r.status) && (
              <ActionBtn icon={Trash2} title="Delete" onClick={() => setDeleteTarget(r._id)} className="hover:text-red-400 text-red-500" />
            )}
            {WORKFLOW.canSubmit.includes(r.status) && (
              <ActionBtn icon={loading ? Loader2 : Send} title="Submit for Approval"
                onClick={() => setSubmitConfirm(r)} disabled={loading}
                className={loading ? "opacity-40" : "text-amber-500 hover:text-amber-400"}
              />
            )}
          </div>
        );
      },
    },
  ], []);

  const assignmentColumns = useMemo(() => [
    { key: "fullName", header: "Staff", className: "text-sm font-medium text-foreground" },
    { key: "email", header: "Email" },
    { key: "targetRole", header: "Role", render: (r) => <RoleBadge role={r.targetRole} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "createdAt", header: "Created", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: "actions", header: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1">
          <ActionBtn icon={Eye} title="View" onClick={() => handleView(r, "assignment")} />
        </div>
      ),
    },
  ], []);

  const columns = activeTab === "drafts" ? draftColumns : assignmentColumns;

  // ── RENDER: Table ───────────────────────────
  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <GlassCard padding="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Failed to load {activeTab}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">{error.message || "Something went wrong"}</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={refresh}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Retry
            </motion.button>
          </div>
        </GlassCard>
      );
    }

    const source = activeTab === "drafts" ? allDrafts : allAssignments;
    if (source.length === 0) {
      const icon = activeTab === "drafts" ? FileText : UserCheck;
      const title = activeTab === "drafts" ? "No drafts found" : "No assignments found";
      const desc = activeTab === "drafts"
        ? "Create your first staff draft to start the workflow"
        : "Assignments will appear once drafts are submitted for approval";
      return (
        <GlassCard padding="p-0">
          <EmptyState icon={icon} title={title} description={desc}
            action={activeTab === "drafts" ? "Create Staff Draft" : undefined}
            onAction={activeTab === "drafts" ? () => setShowCreate(true) : undefined}
          />
        </GlassCard>
      );
    }

    return (
      <GlassCard padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHead columns={columns} />
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No records match the selected filter
                  </td>
                </tr>
              ) : (
                tableData.map((row, i) => (
                  <TableRow key={row._id} row={row} columns={columns} index={i} />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {tableData.length} of {source.length} {activeTab}</span>
          {statusFilter && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Filtered by {HR_STATUS_LABELS[statusFilter] || statusFilter}
            </span>
          )}
        </div>
      </GlassCard>
    );
  };

  // ── RENDER ──────────────────────────────────
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Workflow</h1>
          <p className="text-sm text-muted-foreground mt-1">Unified staff management pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <TabBar tabs={TABS} active={activeTab} onChange={handleTabChange} />
          {activeTab === "drafts" && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreate(true)}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} />
              New Draft
            </motion.button>
          )}
        </div>
      </div>

      {/* Combined Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAT_CARDS.map((card, i) => {
          const val = stats[card.key];
          const sub = stats[`${card.key}Sub`];
          const mappedKey = card.key === "total" || card.key === "draft" || card.key === "activated" ? null : card.key;
          return (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={val}
              sub={sub}
              isActive={statusFilter === mappedKey}
              onClick={() => handleStatFilter(card.key)}
              delay={i * 0.05}
            />
          );
        })}
      </div>

      {/* Table */}
      {renderTable()}

      {/* Modals */}
      <CreateDraftModal open={showCreate} onClose={() => setShowCreate(false)} onSaved={refresh} />
      <ViewDetailModal record={viewTarget} onClose={() => setViewTarget(null)} variant={viewVariant} />
      <EditDraftModal draft={editTarget} onClose={() => setEditTarget(null)} onSaved={refresh} />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Draft"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={!!submitConfirm}
        title="Submit for Approval"
        message="This will change the draft status to PENDING and begin the approval process. Continue?"
        confirmLabel="Submit"
        variant="warning"
        onConfirm={handleSubmitApproval}
        onCancel={() => setSubmitConfirm(null)}
      />
    </div>
  );
}
