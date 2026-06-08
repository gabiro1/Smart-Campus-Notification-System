import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Bell, Mail, MessageSquare, Check, Loader2 } from "lucide-react";
import notificationService from "../../../../../services/notificationService";

const typeConfig = {
  announcement: { icon: Bell, bg: "bg-blue-500/10", border: "border-blue-500/20", color: "text-blue-400" },
  event: { icon: Mail, bg: "bg-purple-500/10", border: "border-purple-500/20", color: "text-purple-400" },
  reminder: { icon: MessageSquare, bg: "bg-amber-500/10", border: "border-amber-500/20", color: "text-amber-400" },
};

const tabs = ["all", "announcement", "event", "reminder"];

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapNotificationType(type) {
  if (!type) return "announcement";
  const t = type.toLowerCase();
  if (t.includes("event")) return "event";
  if (t.includes("reminder")) return "reminder";
  return "announcement";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notificationService.getNotifications({ page: 1, limit: 50 });
        const list = res?.notifications || res?.data || res || [];
        setNotifications(Array.isArray(list) ? list : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = activeTab === "all" ? notifications : notifications.filter((n) => mapNotificationType(n.type) === activeTab);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <GlassCard padding="p-4">
        <div className="flex items-center gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n, i) => {
            const mappedType = mapNotificationType(n.type);
            const config = typeConfig[mappedType] || typeConfig.announcement;
            return (
              <GlassCard key={n._id || i} delay={i * 0.04} padding="p-4" hover={false}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${config.bg} ${config.border} shrink-0 mt-0.5`}>
                    <config.icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </h3>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">{n.message || n.description || ""}</p>
                    <span className="text-xs text-muted-foreground/50 mt-1.5 block">
                      {n.createdAt ? formatRelativeTime(n.createdAt) : ""}
                    </span>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
          {filtered.length === 0 && (
            <GlassCard padding="p-10">
              <div className="text-center">
                <Bell size={36} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up</p>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
