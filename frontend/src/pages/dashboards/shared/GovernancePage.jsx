import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  Check,
  X,
  Plus,
  Send,
  RefreshCw,
  Activity,
  FileText,
  Clock,
  User,
  Globe,
  Building2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import GlassCard from "../../../components/cards/GlassCard";
import StatCard from "../../../components/cards/StatCard";
import LoadingCard from "../../../components/feedback/LoadingCard";
import governanceService from "../../../services/governanceService";

export default function GovernancePage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "medium",
    targetScope: "department",
  });
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pending, mine] = await Promise.all([
        governanceService.getPending().catch(() => []),
        governanceService.getMine().catch(() => ({ data: [] })),
      ]);
      const pendingArr = Array.isArray(pending) ? pending : pending?.data || [];
      setPendingList(pendingArr);
      setMyAnnouncements(mine?.data || (Array.isArray(mine) ? mine : []));
    } catch (err) {
      console.error("Governance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await governanceService.approveAnnouncement(id);
      toast.success("Announcement approved");
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
      await governanceService.rejectAnnouncement(rejectModal, rejectReason);
      toast.success("Announcement rejected");
      setRejectModal(null);
      setRejectReason("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }
    setActionLoading("create");
    try {
      const result = await governanceService.create(form);
      toast.success(result?.message || "Announcement created");
      setShowCreate(false);
      setForm({ title: "", content: "", priority: "medium", targetScope: "department" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create announcement");
    } finally {
      setActionLoading(null);
    }
  };

  const getScopeBadge = (scope) => {
    const Icon = scope === "college" ? Globe : scope === "school" ? Building2 : FileText;
    const colors = {
      college: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      school: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      department: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      module: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${colors[scope] || colors.department}`}>
        <Icon size={10} />
        {scope}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-accent rounded-lg animate-pulse" />
        <LoadingCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Governance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve announcements and manage governance content
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 text-muted-foreground transition-all">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Pending Review" value={pendingList.length} icon={Clock} iconBgClass="bg-amber-500/10" iconClass="text-amber-500" />
        <StatCard title="My Announcements" value={myAnnouncements.length} icon={FileText} iconBgClass="bg-blue-500/10" iconClass="text-blue-500" />
        <StatCard title="Published" value={myAnnouncements.filter((a) => a.status === "published").length} icon={Send} iconBgClass="bg-emerald-500/10" iconClass="text-emerald-500" />
      </div>

      <div className="flex gap-2">
        {["pending", "mine"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "pending" ? "Pending Review" : "My Announcements"}
          </button>
        ))}
      </div>

      <GlassCard>
        {activeTab === "pending" && (
          <>
            {pendingList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Scale size={48} className="mb-3 opacity-30" />
                <p className="text-lg font-medium">No pending announcements</p>
                <p className="text-sm mt-1">All announcements have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingList.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-accent/30 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content || "No content"}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <User size={10} />
                            {item.authorName || item.authorId?.name || "Unknown"}
                          </span>
                          {getScopeBadge(item.targetScope)}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            item.priority === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            item.priority === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(item._id)}
                          disabled={actionLoading === item._id}
                          className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-all disabled:opacity-50"
                        >
                          {actionLoading === item._id ? <Activity size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => setRejectModal(item._id)}
                          disabled={actionLoading === item._id}
                          className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-all disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "mine" && (
          <>
            {myAnnouncements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText size={48} className="mb-3 opacity-30" />
                <p className="text-lg font-medium">No announcements yet</p>
                <p className="text-sm mt-1">Create your first governance announcement</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAnnouncements.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-accent/30 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {getScopeBadge(item.targetScope)}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            item.status === "published" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            item.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </GlassCard>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Create Governance Announcement</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Announcement title"
                  className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Announcement content..."
                  rows={4}
                  className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Scope</label>
                  <select
                    value={form.targetScope}
                    onChange={(e) => setForm({ ...form, targetScope: e.target.value })}
                    className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-blue-500"
                  >
                    <option value="module">Module</option>
                    <option value="department">Department</option>
                    <option value="school">School</option>
                  </select>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-xs text-blue-400">
                <AlertTriangle size={14} className="inline mr-1" />
                Department scope publishes immediately. School scope requires Dean approval.
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "create"}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === "create" ? <Activity size={14} className="animate-spin" /> : <Send size={14} />}
                  Publish
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-foreground mb-2">Reject Announcement</h3>
            <p className="text-sm text-muted-foreground mb-4">Provide a reason for rejection.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason..."
              rows={3}
              className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading === rejectModal} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                {actionLoading === rejectModal ? <Activity size={14} className="animate-spin" /> : <X size={14} />}
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
