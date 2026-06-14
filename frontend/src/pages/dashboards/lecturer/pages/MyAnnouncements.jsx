import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Megaphone, Search, Loader2, RefreshCw, AlertTriangle,
  PlusCircle, Trash2, ExternalLink, Clock, CheckCircle,
  XCircle, Eye, MessageSquare, Sparkles, Filter
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import announcementService from "../../../../services/announcementService";
import toast from "react-hot-toast";

const statusConfig = {
  pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  approved: { label: "Approved", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  rejected: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  draft: { label: "Draft", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  scheduled: { label: "Scheduled", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LecturerAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await announcementService.getLecturerAnnouncements();
      const data = res?.data || res?.announcements || res || [];
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      toast.success("Announcement deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = announcements.filter((a) => {
    const title = a.title || "";
    const content = a.content || a.body || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || content.toLowerCase().includes(search.toLowerCase());
    const status = (a.status || "draft").toLowerCase();
    const matchStatus = filter === "all" || status === filter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: announcements.length,
    approved: announcements.filter((a) => (a.status || "").toLowerCase() === "approved").length,
    pending: announcements.filter((a) => (a.status || "").toLowerCase() === "pending").length,
    draft: announcements.filter((a) => (a.status || "").toLowerCase() === "draft" || !a.status).length,
  };

  if (error && announcements.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={fetchAnnouncements} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">My Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage all your published announcements</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAnnouncements} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
          <Link to="/lecturer/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            <PlusCircle size={15} /> New
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
          <p className="text-xs text-muted-foreground mt-1">Approved</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.draft}</p>
          <p className="text-xs text-muted-foreground mt-1">Drafts</p>
        </GlassCard>
      </div>

      <GlassCard padding="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search announcements..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", "approved", "pending", "draft", "scheduled"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} padding="p-4" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-accent/50 animate-pulse rounded" />
                  <div className="w-full h-3 bg-accent/50 animate-pulse rounded" />
                  <div className="w-1/3 h-3 bg-accent/50 animate-pulse rounded" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const status = (item.status || "draft").toLowerCase();
              const cfg = statusConfig[status] || statusConfig.draft;
              const StatIcon = status === "approved" ? CheckCircle : status === "pending" ? Clock : status === "rejected" ? XCircle : Eye;
              return (
                <motion.div key={item._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <GlassCard padding="p-4" hover={false}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <Megaphone size={16} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <StatIcon size={10} className="inline mr-0.5" />
                            {cfg.label}
                          </span>
                          {item.priority && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${item.priority === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" : item.priority === "low" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{item.content || item.body || ""}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                          {(item.viewCount || item.views) && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye size={11} />{item.viewCount || item.views || 0}</span>
                          )}
                          {(item.commentCount || item.questions?.length) && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare size={11} />{item.commentCount || item.questions?.length || 0}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link to={`/lecturer/qa?announcement=${item._id}`}
                          className="p-2 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                          <MessageSquare size={14} />
                        </Link>
                        <button onClick={() => handleDelete(item._id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <GlassCard padding="p-10">
              <div className="text-center">
                <Megaphone size={36} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No announcements found</p>
                <Link to="/lecturer/create" className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-400 hover:text-blue-300">
                  <PlusCircle size={14} /> Create your first announcement
                </Link>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
