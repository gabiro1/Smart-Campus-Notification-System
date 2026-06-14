import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import {
  Search, Megaphone, RefreshCw, AlertTriangle,
  MessageSquare, Send, ChevronDown, ChevronUp,
  Loader2, HelpCircle, Clock, X
} from "lucide-react";
import announcementService from "../../../../../services/announcementService";
import qaService from "../../../../../services/qaService";

const priorityColors = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const typeConfig = {
  General: { icon: Megaphone, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  Urgent: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  Assignment: { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  Event: { icon: Clock, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

const tabs = [
  { id: "all", label: "All", icon: Megaphone },
  { id: "high", label: "High", icon: AlertTriangle },
  { id: "medium", label: "Medium", icon: Clock },
  { id: "low", label: "Low", icon: ChevronDown },
];

export default function StudentFeedTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedQA, setExpandedQA] = useState({});
  const [questionText, setQuestionText] = useState({});
  const [asking, setAsking] = useState({});
  const [similarDups, setSimilarDups] = useState({});
  const [confirmForce, setConfirmForce] = useState({});

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await announcementService.getAllAnnouncements();
      console.log("[Feed] Announcements response:", data);
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[Feed] Failed to load announcements:", err);
      setError("Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const filtered = announcements.filter((a) => {
    const title = a.title || "";
    const dept = a.lecturer?.name || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || dept.toLowerCase().includes(search.toLowerCase());
    const priority = (a.aiMetadata?.priority || "medium").toLowerCase();
    const matchPriority = activeTab === "all" || priority === activeTab;
    return matchSearch && matchPriority;
  });

  const handleAskQuestion = async (announcementId) => {
    const content = questionText[announcementId]?.trim();
    if (!content) return;
    setAsking((prev) => ({ ...prev, [announcementId]: true }));
    try {
      const result = await qaService.askQuestion(announcementId, content);
      if (result.duplicate) {
        setSimilarDups((prev) => ({ ...prev, [announcementId]: result.similar }));
        setConfirmForce((prev) => ({ ...prev, [announcementId]: true }));
      } else {
        setQuestionText((prev) => ({ ...prev, [announcementId]: "" }));
      }
    } catch (err) {
      console.error("Failed to ask question:", err);
    } finally {
      setAsking((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  const handleForceAsk = async (announcementId) => {
    const content = questionText[announcementId]?.trim();
    if (!content) return;
    setAsking((prev) => ({ ...prev, [announcementId]: true }));
    try {
      await qaService.askQuestionForce(announcementId, content);
      setQuestionText((prev) => ({ ...prev, [announcementId]: "" }));
      setSimilarDups((prev) => ({ ...prev, [announcementId]: null }));
      setConfirmForce((prev) => ({ ...prev, [announcementId]: false }));
    } catch (err) {
      console.error("Failed to force ask question:", err);
    } finally {
      setAsking((prev) => ({ ...prev, [announcementId]: false }));
    }
  };

  if (error && announcements.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={fetchAnnouncements} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 lg:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">Announcements</h1>
          <p className="text-sm text-muted-foreground">
            {announcements.length > 0 ? `${announcements.length} announcements` : "Latest updates from your classes"}
          </p>
        </div>
        <button onClick={fetchAnnouncements} disabled={loading}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 lg:px-0">
        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search announcements..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/40 transition-all placeholder:text-muted-foreground/50" />
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors z-10 capitalize flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-neutral-300"
              }`}>
              {activeTab === tab.id && (
                <motion.div layoutId="feed-tabs"
                  className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <WidgetErrorBoundary name="ClassFeed">
        <div className="relative pt-4 px-4 lg:px-0">
          <div className="absolute left-6 md:left-8 top-8 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/10 to-transparent" />

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-4">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading announcements...</p>
            </div>
          )}

          {!loading && (
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, index) => {
                  const type = item.type || "General";
                  const config = typeConfig[type] || typeConfig.General;
                  const Icon = config.icon;
                  return (
                    <motion.div key={item._id || index}
                      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                      className="relative pl-12 sm:pl-16 md:pl-20 pr-1 sm:pr-2 group">
                      <div className={`absolute left-1 sm:left-2 md:left-4 top-3 sm:top-4 w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center border z-10 transition-transform duration-300 group-hover:scale-110 ${config.bg} ${config.border} ${item.aiMetadata?.priority === 'high' ? "shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "shadow-lg"}`}>
                        <Icon size={14} className={config.color} />
                      </div>

                      <GlassCard delay={0} hover={false}
                        className={`p-3 sm:p-5 transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/20 ${item.aiMetadata?.priority === 'high' ? "border-red-500/30 bg-red-500/[0.02]" : ""}`}>
                        {item.aiMetadata?.priority === 'high' && (
                          <span className="absolute top-3 sm:top-5 right-3 sm:right-5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                          </span>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-semibold text-sm sm:text-base ${item.aiMetadata?.priority === 'high' ? "text-foreground" : "text-neutral-200"}`}>
                              {item.title}
                            </h3>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityColors[item.aiMetadata?.priority] || priorityColors.medium}`}>
                              {item.aiMetadata?.priority || "Medium"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-black/40 px-2 py-1 rounded-md border border-border w-fit">
                            <Clock size={10} />
                            {formatTimeAgo(item.createdAt)}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {item.content}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">{item.lecturer?.name || "Academic Office"}</span>
                          {item.course?.name && (
                            <>
                              <span className="text-xs text-border">·</span>
                              <span className="text-xs text-muted-foreground/60">{item.course.name}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setExpandedQA((prev) => ({ ...prev, [item._id]: !prev[item._id] }))}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors">
                            <MessageSquare size={12} />
                            <span>Ask a Question</span>
                            {expandedQA[item._id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </div>

                        {expandedQA[item._id] && (
                          <div className="mt-3 space-y-3 pt-3 border-t border-border">
                            {confirmForce[item._id] && similarDups[item._id] && (
                              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
                                <p className="text-xs font-medium text-amber-400">Similar questions found:</p>
                                <ul className="space-y-1">
                                  {similarDups[item._id].map((dup, di) => (
                                    <li key={di} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <HelpCircle size={12} className="shrink-0 mt-0.5 text-amber-400" />
                                      <span>"{dup.content}" ({Math.round(dup.similarity * 100)}% match)</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="flex gap-2 pt-1">
                                  <button onClick={() => { setConfirmForce((prev) => ({ ...prev, [item._id]: false })); setSimilarDups((prev) => ({ ...prev, [item._id]: null })); setQuestionText((prev) => ({ ...prev, [item._id]: "" })); }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                  <button onClick={() => handleForceAsk(item._id)} disabled={asking[item._id]}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1">
                                    {asking[item._id] ? <Loader2 size={12} className="animate-spin" /> : null}
                                    Ask Anyway
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <input type="text" placeholder="Type your question..." value={questionText[item._id] || ""}
                                onChange={(e) => setQuestionText((prev) => ({ ...prev, [item._id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") handleAskQuestion(item._id); }}
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/40 transition-all placeholder:text-muted-foreground/50" />
                              <button onClick={() => handleAskQuestion(item._id)} disabled={asking[item._id] || !questionText[item._id]?.trim()}
                                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1">
                                {asking[item._id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                              </button>
                            </div>
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-4 py-10">
                  <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-border rounded-2xl bg-muted/20">
                    <Megaphone size={28} className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">No announcements</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {search || activeTab !== "all" ? "No announcements match your filters." : "No announcements from your classes yet."}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </WidgetErrorBoundary>
    </div>
  );
}
