import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle, XCircle, UserPlus, Clock, Search,
  Mail, Phone, Building2, GraduationCap, AlertTriangle,
  UserCheck, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import hrService from "../../../services/hrService";
import { useSocket } from "../../../context/SocketContext";
import { format } from "date-fns";

const statusConfig = {
  PENDING: { color: "text-amber-500 bg-amber-500/10", icon: Clock, label: "Pending" },
  APPROVED: { color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle, label: "Approved" },
  REJECTED: { color: "text-red-500 bg-red-500/10", icon: XCircle, label: "Rejected" },
  ACTIVATED: { color: "text-purple-500 bg-purple-500/10", icon: UserCheck, label: "Activated" },
};

export default function RoleAssignmentsApproval() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { socket } = useSocket();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await hrService.getPendingAssignments();
      setAssignments(res?.data || []);
    } catch { toast.error("Failed to load role assignments"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("role-assignment:new", fetchAssignments);
    return () => socket.off("role-assignment:new", fetchAssignments);
  }, [socket]);

  const filtered = assignments.filter(a =>
    a.staffDraft?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    a.staffDraft?.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.staffDraft?.targetRole?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id) => {
    try {
      await hrService.approveAssignment(id);
      toast.success("Role assignment approved");
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await hrService.rejectAssignment(id, reason);
      toast.success("Role assignment rejected");
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    }
  };

  const handleActivate = async (id) => {
    if (!confirm("This will create a user account for this assignment. Continue?")) return;
    try {
      await hrService.activateAssignment(id);
      toast.success("Role activated — user account created");
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to activate");
    }
  };

  const handleResendEmail = async (id) => {
    try {
      await hrService.resendSetupEmail(id);
      toast.success("Setup email resent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend email");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Role Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve staff role assignments submitted by HR
          </p>
        </div>
        <button
          onClick={fetchAssignments}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Clock size={14} />
          Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Search by name, email, or role..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <UserCheck size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No pending role assignments</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map(a => {
              const draft = a.staffDraft || {};
              const StatusIcon = statusConfig[a.status]?.icon || Clock;
              return (
                <motion.div
                  key={a._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-card rounded-xl border border-border hover:border-blue-500/30 transition-all p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-blue-500/20">
                      {draft.fullName?.charAt(0) || "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{draft.fullName}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusConfig[a.status]?.color || "bg-muted text-muted-foreground"}`}>
                          <StatusIcon size={10} />
                          {statusConfig[a.status]?.label || a.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail size={10} /> {draft.email}</span>
                        {draft.phoneNumber && <span className="flex items-center gap-1"><Phone size={10} /> {draft.phoneNumber}</span>}
                        <span className="flex items-center gap-1 capitalize"><UserCheck size={10} /> {draft.targetRole?.replace(/_/g, " ")}</span>
                        {draft.department && <span className="flex items-center gap-1"><Building2 size={10} /> {draft.department}</span>}
                        {draft.school && <span className="flex items-center gap-1"><GraduationCap size={10} /> {draft.school}</span>}
                      </div>
                      {a.createdAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Submitted {format(new Date(a.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {a.rejectionReason && (
                        <div className="flex items-start gap-1.5 mt-2 text-xs text-red-500 bg-red-500/10 px-2.5 py-1.5 rounded-lg">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                          <span>Rejected: {a.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {a.status === "PENDING" && (
                        <>
                          <button onClick={() => handleApprove(a._id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-xs font-medium">
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button onClick={() => handleReject(a._id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium">
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {a.status === "APPROVED" && (
                        <button onClick={() => handleActivate(a._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium">
                          <UserPlus size={14} /> Activate
                        </button>
                      )}
                      {a.status === "ACTIVATED" && (
                        <button onClick={() => handleResendEmail(a._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium">
                          <RefreshCw size={14} /> Resend Email
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
