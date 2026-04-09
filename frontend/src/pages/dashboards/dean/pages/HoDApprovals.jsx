import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Search, Filter, Eye, Check, X, ShieldAlert, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import governanceService from "../../../../services/governanceService";
import { useAuth } from "../../../../context/AuthContext";

export default function HoDApprovals() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await governanceService.getPending();
      setApprovals(data || []);
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessing(id);
      await governanceService.review(id, "approve");
      toast.success("Announcement approved successfully");
      setApprovals(approvals.filter(a => a._id !== id));
      setSelectedItem(null);
    } catch (error) {
      console.error("Approve failed:", error);
      toast.error(error.response?.data?.message || "Failed to approve announcement");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessing(id);
      const reason = prompt("Enter rejection reason:");
      if (!reason) {
        setProcessing(null);
        return;
      }
      await governanceService.review(id, "reject", reason);
      toast.success("Announcement rejected");
      setApprovals(approvals.filter(a => a._id !== id));
      setSelectedItem(null);
    } catch (error) {
      console.error("Reject failed:", error);
      toast.error(error.response?.data?.message || "Failed to reject announcement");
    } finally {
      setProcessing(null);
    }
  };

  const filteredApprovals = approvals.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || item.department?.name === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = [...new Set(approvals.map(a => a.department?.name).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            HoD Approvals
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve announcements submitted by Heads of Department
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
            {approvals.length} Pending
          </span>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="pl-10 pr-8 py-3 rounded-xl bg-card border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Approvals List */}
      {filteredApprovals.length === 0 ? (
        <div className="text-center py-16">
          <ShieldAlert className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Pending Approvals</h3>
          <p className="text-muted-foreground">All announcements have been reviewed</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredApprovals.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-medium">
                        Pending Dean
                      </span>
                      {item.department && (
                        <span className="text-sm text-muted-foreground">
                          {item.department.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.content?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By: {item.author?.name || "Unknown"}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-2 rounded-lg bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleApprove(item._id)}
                      disabled={processing === item._id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50"
                    >
                      {processing === item._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item._id)}
                      disabled={processing === item._id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors disabled:opacity-50"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-card rounded-2xl border border-border p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedItem.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    By {selectedItem.author?.name} • {selectedItem.department?.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-foreground whitespace-pre-wrap">{selectedItem.content}</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedItem.targetAudience?.map((audience, idx) => (
                  <span key={idx} className="px-3 py-1 bg-accent rounded-full text-sm text-foreground">
                    {audience}
                  </span>
                ))}
                {selectedItem.priority && (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedItem.priority === 'urgent' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {selectedItem.priority}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleReject(selectedItem._id)}
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedItem._id)}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}