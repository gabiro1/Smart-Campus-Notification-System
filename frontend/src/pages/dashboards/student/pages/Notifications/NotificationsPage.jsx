import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Send,
  Clock,
  CheckCheck,
  Loader2,
  RefreshCw,
  Radio,
  AlertTriangle,
  Info,
  Trash2,
  Check,
  Sparkles,
  FileText,
  Mail,
  MessageSquare,
} from "lucide-react";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import notificationService from "../../../../../services/notificationService";
import copilotService from "../../../../../services/copilotService";
import { useSocket } from "../../../../../context/SocketContext";
import toast from "react-hot-toast";
import NotificationDetailModal from "../../../../../components/common/NotificationDetailModal";

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

const typeConfig = {
  announcement: { icon: Bell, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  event: { icon: Radio, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  reminder: { icon: MessageSquare, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
};

const iconByType = {
  announcement: Bell,
  event: Radio,
  reminder: MessageSquare,
  alert: AlertCircle,
  system: Info,
  approval: CheckCircle2,
};

function mapNotificationType(type) {
  if (!type) return "announcement";
  const t = type.toLowerCase();
  if (t.includes("event")) return "event";
  if (t.includes("reminder")) return "reminder";
  if (t.includes("alert")) return "alert";
  if (t.includes("approval")) return "approval";
  return "announcement";
}

const tabs = [
  { id: "all", label: "All", icon: Bell },
  { id: "announcement", label: "Announcements", icon: Bell },
  { id: "event", label: "Events", icon: Radio },
  { id: "reminder", label: "Reminders", icon: MessageSquare },
];

export default function NotificationsPage() {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Digest state
  const [digestLoading, setDigestLoading] = useState(false);
  const [digest, setDigest] = useState(null);
  const [digestPeriod, setDigestPeriod] = useState("weekly");
  const [generatingDigest, setGeneratingDigest] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ page: 1, limit: 50 });
      const rawNotifs = res?.notifications || res?.data || res || [];
      const list = Array.isArray(rawNotifs) ? rawNotifs : [];

      const mapped = list.map((n) => {
        const mappedType = mapNotificationType(n.type);
        const isUnread = n.status ? n.status === "unread" : !n.read;
        const config = typeConfig[mappedType] || typeConfig.announcement;
        return {
          id: n._id,
          type: mappedType,
          title: n.title || "Notification",
          time: formatTimeAgo(n.createdAt),
          desc: n.message || n.description || "",
          unread: isUnread,
          icon: iconByType[mappedType] || Bell,
          color: config.color,
          bg: config.bg,
          border: config.border,
        };
      });

      setNotifications(mapped);
      setUnreadCount(mapped.filter((n) => n.unread).length);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notif) => {
      if (!notif?.title && !notif?.message) return;
      const mappedType = mapNotificationType(notif.type);
      const config = typeConfig[mappedType] || typeConfig.announcement;
      const normalized = {
        id: notif._id || `notif_${Date.now()}`,
        type: mappedType,
        title: notif.title || "Notification",
        time: "Just now",
        desc: notif.message || notif.body || notif.title || "",
        unread: true,
        icon: iconByType[mappedType] || Bell,
        color: config.color,
        bg: config.bg,
        border: config.border,
      };
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === normalized.id);
        return exists ? prev : [normalized, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
      toast.custom(
        (t) => (
          <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full mx-3 bg-[#111] shadow-2xl rounded-[15px] pointer-events-auto flex ring-1 ring-white/10 overflow-hidden border border-white/5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${normalized.bg}`}>
                    <span className="font-black text-xs uppercase">{normalized.type?.[0] || 'N'}</span>
                  </div>
                </div>
                <div className="ml-3 flex-1 text-left">
                  <p className="text-sm font-bold text-white uppercase tracking-tight">{normalized.title}</p>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{normalized.desc}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-white/5">
              <button onClick={() => toast.dismiss(t.id)} className="px-6 border border-transparent rounded-none rounded-r-[15px] flex items-center justify-center text-xs font-black text-neutral-500 hover:text-white transition-colors">CLOSE</button>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
    };
    socket.on("notification:new", handleNewNotification);
    return () => { socket.off("notification:new", handleNewNotification); };
  }, [socket]);

  useEffect(() => {
    if (activeTab === "digest") {
      fetchDigest();
    }
  }, [activeTab]);

  const fetchDigest = async () => {
    setDigestLoading(true);
    try {
      const data = await copilotService.getDigestHistory();
      setDigest(data.digest || data);
    } catch {
      setDigest(null);
    } finally {
      setDigestLoading(false);
    }
  };

  const generateDigest = async () => {
    setGeneratingDigest(true);
    try {
      const data = await copilotService.generateDigest(digestPeriod);
      setDigest(data.digest || data);
      toast.success("Digest generated successfully!");
    } catch {
      toast.error("Failed to generate digest");
    } finally {
      setGeneratingDigest(false);
    }
  };

  const notifyUnreadChanged = () => {
    window.dispatchEvent(new Event("notifications:updated"));
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);
      notifyUnreadChanged();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      notifyUnreadChanged();
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target?.unread) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
      notifyUnreadChanged();
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 lg:px-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium bg-blue-500/10 px-3 sm:px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/20"
          >
            <CheckCheck size={16} /> <span className="hidden sm:inline">Mark all as read</span>
          </button>
        )}
      </header>

      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-full sm:w-fit mx-4 lg:mx-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 sm:px-5 py-2 text-sm font-medium transition-colors z-10 capitalize flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-neutral-300"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="student-notification-tabs"
                className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab !== "digest" ? (
        <>
          <div className="relative pt-4 px-4 lg:px-6">
            <div className="absolute left-6 md:left-8 top-8 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/10 to-transparent" />

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-4">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-muted-foreground text-sm">Loading notifications...</p>
              </div>
            )}

            {!loading && (
              <div className="space-y-4 sm:space-y-6">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      className="relative pl-12 sm:pl-16 md:pl-20 pr-1 sm:pr-2 group cursor-pointer"
                      onClick={() => setSelectedNotification(note)}
                    >
                      <div
                        className={`absolute left-1 sm:left-2 md:left-4 top-3 sm:top-4 w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center border z-10 transition-transform duration-300 group-hover:scale-110 ${note.bg} ${note.border} ${note.unread ? "shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "shadow-lg"}`}
                      >
                        <note.icon size={14} className={note.color} />
                      </div>

                      <GlassCard
                        delay={0}
                        hover={false}
                        className={`p-3 sm:p-5 transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/20 ${note.unread ? "border-blue-500/30 bg-blue-500/[0.02]" : ""}`}
                      >
                        {note.unread && (
                          <span className="absolute top-3 sm:top-5 right-3 sm:right-5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                          </span>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 mb-2">
                          <h3 className={`font-semibold text-sm sm:text-base ${note.unread ? "text-foreground" : "text-neutral-200"}`}>
                            {note.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-black/40 px-2 py-1 rounded-md border border-border w-fit">
                            <Clock size={10} />
                            {note.time}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {note.desc}
                        </p>

                        <div className="flex items-center gap-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                          {note.unread && (
                            <button
                              onClick={() => handleMarkAsRead(note.id)}
                              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-colors"
                            >
                              <Check size={12} /> <span className="hidden sm:inline">Mark as read</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={12} /> <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredNotifications.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pl-12 sm:pl-16 md:pl-20 py-10"
                  >
                    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-border rounded-2xl bg-muted/20">
                      <Bell size={28} className="text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-medium">
                        You're all caught up!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        No notifications to display right now.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6 px-4 lg:px-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles size={18} className="text-blue-400" />
              <span className="text-sm text-muted-foreground">AI-Powered Digest</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <select
                value={digestPeriod}
                onChange={(e) => setDigestPeriod(e.target.value)}
                className="bg-background border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button
                onClick={generateDigest}
                disabled={generatingDigest}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {generatingDigest ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
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
                {typeof digest === "string" ? (
                  <p className="text-neutral-300 text-sm sm:text-base whitespace-pre-wrap">{digest}</p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {digest.summary && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1 sm:mb-2">Summary</h4>
                        <p className="text-muted-foreground text-sm">{digest.summary}</p>
                      </div>
                    )}
                    {digest.keyPoints && digest.keyPoints.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1 sm:mb-2">Key Points</h4>
                        <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                          {digest.keyPoints.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {digest.actionItems && digest.actionItems.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1 sm:mb-2">Action Items</h4>
                        <ul className="list-decimal list-inside text-muted-foreground text-sm space-y-1">
                          {digest.actionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
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
              <p className="text-sm text-muted-foreground mt-1">
                Click "Generate" to create an AI summary of your notifications
              </p>
            </GlassCard>
          )}
        </motion.div>
      )}

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onMarkAsRead={(id) => {
          handleMarkAsRead(id);
          setSelectedNotification(null);
        }}
      />
    </div>
  );
}
