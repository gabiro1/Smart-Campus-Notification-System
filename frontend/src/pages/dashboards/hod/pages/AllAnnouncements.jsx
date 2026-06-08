import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Files,
  RefreshCw,
  Activity,
  FileText,
  User,
  Clock,
  Globe,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import GlassCard from "../../../../components/cards/GlassCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import governanceService from "../../../../services/governanceService";

export default function AllAnnouncements() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedData, mineData] = await Promise.all([
        governanceService.getFeed().catch(() => ({ data: [] })),
        governanceService.getMine().catch(() => ({ data: [] })),
      ]);
      const feed = feedData?.data || (Array.isArray(feedData) ? feedData : []);
      const mine = mineData?.data || (Array.isArray(mineData) ? mineData : []);
      const all = [...feed, ...mine];
      const unique = all.filter((item, idx, self) => idx === self.findIndex((a) => a._id === item._id));
      setAnnouncements(unique);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getScopeIcon = (scope) => {
    switch (scope) {
      case "college": return Globe;
      case "school": return Building2;
      default: return Files;
    }
  };

  const filtered = filter === "all" ? announcements : announcements.filter((a) => a.scope === filter);

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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            All Announcements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View governance announcements across the institution
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 text-muted-foreground transition-all"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {["all", "college", "school", "department", "module"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === s
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <GlassCard>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText size={48} className="mb-3 opacity-30" />
            <p className="text-lg font-medium">No announcements found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((announcement) => {
              const ScopeIcon = getScopeIcon(announcement.scope);
              return (
                <motion.div
                  key={announcement._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-accent/30 border border-border hover:border-blue-500/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
                      <ScopeIcon size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {announcement.content || announcement.description || "No content"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <User size={10} />
                          {announcement.createdBy?.name || "Unknown"}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {announcement.scope || "general"}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          announcement.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : announcement.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}>
                          {announcement.status || "draft"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
