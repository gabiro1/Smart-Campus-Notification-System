import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, AlertCircle, CheckCircle2, Clock, Loader2,
  RefreshCw, Radio, Trash2, Check, Sparkles, FileText,
  Search, Pin, PinOff, VolumeX, Volume2, Filter, X,
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import notificationService from "../../../../../services/notificationService";
import copilotService from "../../../../../services/copilotService";
import toast from "react-hot-toast";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const TYPE_STYLES = {
  info: { icon: Bell, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  warning: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  success: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  event: { icon: Radio, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  announcement: { icon: AlertCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

export const NotificationsTab = () => {
  const [activeTab, setActiveTab] = useState("incoming");
  const [localLoading, setLocalLoading] = useState(true);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [filters, setFilters] = useState({ type: "", status: "", priority: "", search: "" });
  const [showFilters, setShowFilters] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = { page: 1, limit: 100 };
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const response = await notificationService.getNotifications(params);
      const rawNotifs = response.data?.notifications || response.notifications || [];
      const style = (n) => TYPE_STYLES[n.type] || TYPE_STYLES.info;
      const mapped = rawNotifs.map(n => ({
        id: n._id,
        type: n.type || "info",
        title: n.title || "Notification",
        time: formatTimeAgo(n.createdAt),
        createdAt: n.createdAt,
        desc: n.message || n.content || "",
        unread: n.status === "unread",
        isPinned: n.isPinned || false,
        isMuted: n.isMuted || false,
        ...style(n),
      }));
      mapped.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setLocalNotifications(mapped);
      setUnreadCount(mapped.filter(n => n.unread).length);
    } catch {
      console.error("Failed to load notifications");
    } finally {
      setLocalLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (activeTab === "digest") fetchDigest();
  }, [activeTab]);

  const fetchDigest = async () => {
    setDigestLoading(true);
    try {
      const data = await copilotService.getDigestHistory();
      setDigest(data.digest || data);
    } catch { setDigest(null); }
    finally { setDigestLoading(false); }
  };

  const [digestLoading, setDigestLoading] = useState(false);
  const [digest, setDigest] = useState(null);
  const [digestPeriod, setDigestPeriod] = useState("weekly");
  const [generatingDigest, setGeneratingDigest] = useState(false);

  const generateDigest = async () => {
    setGeneratingDigest(true);
    try {
      const data = await copilotService.generateDigest(digestPeriod);
      setDigest(data.digest || data);
      toast.success("Digest generated successfully!");
    } catch { toast.error("Failed to generate digest"); }
    finally { setGeneratingDigest(false); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setLocalNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch { toast.error("Failed"); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setLocalNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await notificationService.togglePin(id);
      setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, isPinned: res.isPinned } : n));
      toast.success(res.isPinned ? "Pinned" : "Unpinned");
    } catch { toast.error("Failed"); }
  };

  const handleToggleMute = async (id) => {
    try {
      const res = await notificationService.toggleMute(id);
      setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, isMuted: res.isMuted } : n));
      toast.success(res.isMuted ? "Muted" : "Unmuted");
    } catch { toast.error("Failed"); }
  };

  const clearFilters = () => setFilters({ type: "", status: "", priority: "", search: "" });

  return (
    <div className="space-y-6 pb-12 ml-15">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 lg:px-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors ${
              showFilters || filters.search || filters.type || filters.status || filters.priority
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter size={14} /> Filters
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium bg-blue-500/10 px-3 sm:px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/20"
            >
              <Check size={16} /> <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-fit mx-4 lg:mx-6">
        {[
          { id: "incoming", label: "Inbox", icon: Bell, badge: unreadCount > 0 },
          { id: "digest", label: "AI Digest", icon: Sparkles },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 sm:px-6 py-2 text-sm font-medium transition-colors z-10 capitalize flex items-center gap-2 ${
              activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-neutral-300"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div layoutId="s-notif-tab"
                className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                activeTab === tab.id ? "bg-blue-500 text-foreground" : "bg-white/10 text-muted-foreground"
              }`}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "incoming" && (
        <div className="relative pt-4 px-4 lg:px-6">
          {(showFilters || filters.search) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" placeholder="Search notifications..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/40 transition-colors"
                />
                {filters.search && (
                  <button onClick={() => setFilters(f => ({ ...f, search: "" }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  ><X size={14} /></button>
                )}
              </div>
              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-blue-500/40"
                  >
                    <option value="">All Types</option>
                    {Object.keys(TYPE_STYLES).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-blue-500/40"
                  >
                    <option value="">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                  <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-blue-500/40"
                  >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button onClick={clearFilters}
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg"
                  >Clear</button>
                </div>
              )}
            </motion.div>
          )}

          <div className="absolute left-6 md:left-8 top-8 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/10 to-transparent" />

          {localLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading notifications...</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence mode="popLayout">
                {localNotifications.map((note, index) => (
                  <motion.div key={note.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative pl-12 sm:pl-16 md:pl-20 pr-1 sm:pr-2 group"
                  >
                    <div className={`absolute left-1 sm:left-2 md:left-4 top-3 sm:top-4 w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center border z-10 transition-transform duration-300 group-hover:scale-110 ${note.bg} ${note.border} ${note.unread ? "shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "shadow-lg"}`}>
                      {note.isPinned ? <Pin size={12} className="text-blue-400" /> : <note.icon size={14} className={note.color} />}
                    </div>

                    <GlassCard delay={0} hover={false}
                      className={`p-3 sm:p-5 transition-all duration-300 group-hover:bg-white/[0.04] ${note.isPinned ? "border-blue-500/40" : ""} ${note.unread ? "border-blue-500/30 bg-blue-500/[0.02]" : ""} ${note.isMuted ? "opacity-60" : ""}`}
                    >
                      {note.unread && (
                        <span className="absolute top-3 sm:top-5 right-3 sm:right-5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-blue-500" />
                        </span>
                      )}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {note.isPinned && <Pin size={12} className="text-blue-400 shrink-0" />}
                          <h3 className={`font-semibold text-sm sm:text-base truncate ${note.unread ? "text-foreground" : "text-neutral-200"}`}>
                            {note.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {note.isMuted && <VolumeX size={10} className="text-muted-foreground" />}
                          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-black/40 px-2 py-1 rounded-md border border-border">
                            <Clock size={10} /> {note.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{note.desc}</p>
                      <div className="flex items-center gap-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                        {note.unread && (
                          <button onClick={() => handleMarkAsRead(note.id)}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors"
                          ><Check size={12} /> <span className="hidden sm:inline">Read</span></button>
                        )}
                        <button onClick={() => handleTogglePin(note.id)}
                          className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            note.isPinned ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >{note.isPinned ? <PinOff size={12} /> : <Pin size={12} />} <span className="hidden sm:inline">{note.isPinned ? "Unpin" : "Pin"}</span></button>
                        <button onClick={() => handleToggleMute(note.id)}
                          className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            note.isMuted ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >{note.isMuted ? <Volume2 size={12} /> : <VolumeX size={12} />} <span className="hidden sm:inline">{note.isMuted ? "Unmute" : "Mute"}</span></button>
                        <button onClick={() => handleDelete(note.id)}
                          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                        ><Trash2 size={12} /> <span className="hidden sm:inline">Delete</span></button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>

              {localNotifications.length === 0 && !localLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-12 sm:pl-16 md:pl-20 py-10">
                  <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-border rounded-2xl bg-muted/20">
                    <Bell size={28} className="text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">You're all caught up!</p>
                    <p className="text-sm text-muted-foreground mt-1">No notifications to display right now.</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "digest" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6 px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles size={18} className="text-blue-400" />
              <span className="text-sm text-muted-foreground">AI-Powered Digest</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <select value={digestPeriod} onChange={e => setDigestPeriod(e.target.value)}
                className="bg-background border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button onClick={generateDigest} disabled={generatingDigest}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {generatingDigest ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span className="hidden sm:inline">Generate</span>
              </button>
            </div>
          </div>
          {digestLoading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm mt-4">Loading digest...</p>
            </div>
          ) : digest ? (
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FileText size={16} className="text-emerald-400" />
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Your Notification Summary</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                {typeof digest === 'string' ? (
                  <p className="text-neutral-300 text-sm sm:text-base whitespace-pre-wrap">{digest}</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {digest.summary && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1 sm:mb-2">Summary</h4>
                        <p className="text-muted-foreground text-sm">{digest.summary}</p>
                      </div>
                    )}
                    {digest.keyPoints?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1 sm:mb-2">Key Points</h4>
                        <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                          {digest.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                        </ul>
                      </div>
                    )}
                    {digest.actionItems?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1 sm:mb-2">Action Items</h4>
                        <ul className="list-decimal list-inside text-muted-foreground text-sm space-y-1">
                          {digest.actionItems.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 sm:p-8 text-center">
              <Sparkles size={32} className="text-neutral-600 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No digest available</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Generate" to create an AI summary of your notifications</p>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
};