import { motion, AnimatePresence } from "framer-motion";
import { X, User, Briefcase, Calendar, Mail, Phone, Building2, Shield, FileText, UserCheck } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { TARGET_ROLES } from "../constants/hrStatus";

const TYPE_CONFIG = {
  draft: {
    icon: FileText,
    title: "Staff Draft Details",
  },
  assignment: {
    icon: UserCheck,
    title: "Role Assignment Details",
  },
};

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value || "-"}</p>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</h4>
      <div className="bg-accent/30 rounded-xl px-4">
        {children}
      </div>
    </div>
  );
}

export default function ViewDetailModal({ open, onClose, record, type = "draft" }) {
  if (!open || !record) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.draft;
  const Icon = config.icon;

  const orgInfo = record.department?.name
    ? { label: "Department", value: record.department.name, icon: Building2 }
    : record.school?.name
      ? { label: "School", value: record.school.name, icon: Building2 }
      : record.college?.name
        ? { label: "College", value: record.college.name, icon: Building2 }
        : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 lg:pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto z-10"
        >
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                <Icon size={16} className="text-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{config.title}</h3>
                <p className="text-xs text-muted-foreground">{record.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
              <X size={16} />
            </button>
          </div>

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

            <DetailSection title="Personal Info">
              <DetailRow icon={User} label="Full Name" value={record.fullName} />
              <DetailRow icon={Mail} label="Email" value={record.email} />
              <DetailRow icon={Phone} label="Phone" value={record.phoneNumber || "Not provided"} />
            </DetailSection>

            <DetailSection title="Role & Organization">
              <DetailRow
                icon={Shield}
                label="Target Role"
                value={TARGET_ROLES[record.targetRole] || record.targetRole}
              />
              {orgInfo && <DetailRow icon={orgInfo.icon} label={orgInfo.label} value={orgInfo.value} />}
              <DetailRow icon={Briefcase} label="Status" value={<StatusBadge status={record.status} />} />
            </DetailSection>

            <DetailSection title="Timeline">
              <DetailRow icon={Calendar} label="Created" value={new Date(record.createdAt).toLocaleString()} />
              {record.updatedAt && (
                <DetailRow icon={Calendar} label="Last Updated" value={new Date(record.updatedAt).toLocaleString()} />
              )}
              {record.createdBy?.name && (
                <DetailRow icon={User} label="Created By" value={record.createdBy.name} />
              )}
              {record.approvedAt && (
                <DetailRow icon={Calendar} label="Approved" value={new Date(record.approvedAt).toLocaleString()} />
              )}
              {record.activatedAt && (
                <DetailRow icon={Calendar} label="Activated" value={new Date(record.activatedAt).toLocaleString()} />
              )}
            </DetailSection>

            {record.rejectionReason && (
              <DetailSection title="Rejection Reason">
                <p className="text-sm text-red-500 px-1 py-2">{record.rejectionReason}</p>
              </DetailSection>
            )}

            {type === "assignment" && record.requester?.name && (
              <DetailSection title="Request Info">
                <DetailRow icon={User} label="Requester" value={record.requester.name} />
                <DetailRow icon={Shield} label="Requester Role" value={record.requesterRole || "-"} />
              </DetailSection>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
