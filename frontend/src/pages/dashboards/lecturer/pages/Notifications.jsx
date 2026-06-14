import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Loader2, CheckCheck, Trash2, RefreshCw, AlertTriangle,
  Megaphone, MessageSquare, Calendar, Info, AlertCircle,
  CheckCircle, X, Inbox
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import notificationService from "../../../../services/notificationService";
import { useSocket } from "../../../../context/SocketContext";
import toast from "react-hot-toast";

const TYPE_CONFIG = {
  announcement: { icon: Megaphone, bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  question: { icon: MessageSquare, bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  reply: { icon: MessageSquare, bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  class: { icon: Calendar, bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  system: { icon: Info, bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
};

function getTypeConfig(type) {
  const t = (type || "system").toLowerCase();
  return TYPE_CONFIG[t] || TYPE_CONFIG.system;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function LecturerNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications();
      const data = res?.data || res?.notifications || res || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notif) => {
      if (!notif?.title && !notif?.message) return;
      const normalized = {
        _id: notif._id || `notif_${Date.now()}`,
        title: notif.title,
        message: notif.message || notif.body || notif.title || "",
        body: notif.body || notif.message || "",
        type: notif.type || "system",
        read: false,
        createdAt: notif.timestamp || new Date().toISOString(),
      };
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === normalized._id);
        return exists ? prev : [normalized, ...prev];
      });
      toast.custom(
        (t) => (
          <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-[#111] shadow-2xl rounded-[15px] pointer-events-auto flex ring-1 ring-white/10 overflow-hidden border border-white/5`}>
            <div className="flex-1 w-0 p-4">
              <p className="text-sm font-bold text-white uppercase tracking-tight">{normalized.title}</p>
              <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{normalized.message}</p>
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

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const handleClearAll = async () => {
    if (!confirm("Delete all notifications?")) return;
    try {
      await Promise.all(notifications.map((n) => notificationService.deleteNotification(n._id)));
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch { toast.error("Failed to clear"); }
  };

  const filtered = filter === "all" ? notifications : filter === "unread" ? notifications.filter((n) => !n.read) : notifications.filter((n) => (n.type || "").toLowerCase() === filter);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={fetchNotifications} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 px-4 lg:px-0">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchNotifications} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-blue-400 transition-colors">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleClearAll}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-red-400 transition-colors">
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </header>

      <div className="flex items-center gap-1.5 flex-wrap">
        {[{ id: "all", label: "All" }, { id: "unread", label: "Unread" }, ...Object.keys(TYPE_CONFIG).map((t) => ({ id: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} padding="p-4" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-2/3 h-4 bg-accent/50 animate-pulse rounded" />
                  <div className="w-full h-3 bg-accent/50 animate-pulse rounded" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard padding="p-10">
          <div className="text-center">
            <Inbox size={36} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No notifications {filter !== "all" ? `matching "${filter}"` : ""}</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((n, i) => {
              const cfg = getTypeConfig(n.type);
              const Icon = cfg.icon;
              const isUnread = !n.read;
              return (
                <motion.div key={n._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  onClick={() => { if (isUnread) handleMarkRead(n._id); }}
                  className={`rounded-xl border transition-colors cursor-pointer ${isUnread ? "bg-blue-500/5 border-blue-500/10" : "bg-card border-border"} ${isUnread ? "" : "hover:bg-accent/50"}`}>
                  <div className="flex items-start gap-3 p-4">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                        <p className={`text-sm ${isUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{n.title || n.message || n.content}</p>
                      </div>
                      {n.body && <p className={`text-xs mt-1 ${isUnread ? "text-muted-foreground/80" : "text-muted-foreground/60"}`}>{n.body}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground/50">{formatDate(n.createdAt)}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>{(n.type || "system").charAt(0).toUpperCase() + (n.type || "system").slice(1)}</span>
                      </div>
                    </div>
                    {isUnread && (
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                          <CheckCheck size={13} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
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
