import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Check,
  X,
  Search,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import leadershipService from "../../../../services/studentLeadershipService";

export default function CpApprovals() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingCPs, setPendingCPs] = useState([]);
  const [allCPs, setAllCPs] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingData, allData] = await Promise.all([
        leadershipService.getPendingClassReps().catch(() => ({ data: [] })),
        leadershipService.getAllClassReps().catch(() => ({ data: [] })),
      ]);
      setPendingCPs(pendingData?.data || (Array.isArray(pendingData) ? pendingData : []));
      setAllCPs(allData?.data || (Array.isArray(allData) ? allData : []));
    } catch (err) {
      console.error("Failed to fetch CP data:", err);
      toast.error("Failed to load class representative data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await leadershipService.approveClassRep(id);
      toast.success("Class Representative approved");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal);
    try {
      await leadershipService.rejectClassRep(rejectModal, rejectReason || "Rejected by HOD");
      toast.success("Class Representative proposal rejected");
      setRejectModal(null);
      setRejectReason("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
      SUSPENDED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return styles[status] || styles.PENDING;
  };

  const filteredList = activeTab === "pending" ? pendingCPs : allCPs;
  const searched = filteredList.filter(
    (cp) =>
      !search ||
      cp.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      cp.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      cp.classId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-accent rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <LoadingCard key={i} />)}
        </div>
        <LoadingCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Class Representative Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage class representative proposals
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 text-muted-foreground transition-all"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pending"
          value={pendingCPs.length}
          icon={Clock}
          iconBgClass="bg-amber-500/10"
          iconClass="text-amber-500"
        />
        <StatCard
          title="Active"
          value={allCPs.filter((c) => c.status === "ACTIVE").length}
          icon={CheckCircle}
          iconBgClass="bg-emerald-500/10"
          iconClass="text-emerald-500"
        />
        <StatCard
          title="Total Proposals"
          value={allCPs.length}
          icon={UserCheck}
          iconBgClass="bg-blue-500/10"
          iconClass="text-blue-500"
        />
      </div>

      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {["pending", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "pending" ? "Pending" : "All Proposals"}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {searched.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserCheck size={48} className="mb-3 opacity-30" />
            <p className="text-lg font-medium">No proposals found</p>
            <p className="text-sm mt-1">
              {activeTab === "pending"
                ? "All class representative proposals have been reviewed"
                : "No class representatives have been proposed yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {searched.map((cp) => (
              <motion.div
                key={cp._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-accent/30 border border-border"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                    {cp.userId?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {cp.userId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cp.userId?.email || "No email"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {cp.classId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {cp.classId.name}
                        </span>
                      )}
                      {cp.courseId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {cp.courseId.name}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(cp.status)}`}>
                        {cp.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {cp.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => handleApprove(cp._id)}
                        disabled={actionLoading === cp._id}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {actionLoading === cp._id ? (
                          <Activity size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectModal(cp._id)}
                        disabled={actionLoading === cp._id}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${getStatusBadge(cp.status)}`}>
                      {cp.status === "ACTIVE" ? "Approved" : cp.status === "REJECTED" ? "Rejected" : cp.status}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-foreground mb-2">Reject Proposal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Provide a reason for rejecting this class representative proposal.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500 resize-none h-24"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === rejectModal ? (
                  <Activity size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
