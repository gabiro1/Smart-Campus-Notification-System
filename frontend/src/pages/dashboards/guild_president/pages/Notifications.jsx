import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell, Loader2, AlertCircle, RefreshCw, CheckCheck,
  Info, AlertTriangle, Megaphone, Calendar, MessageSquare,
  CheckCircle2
} from "lucide-react";
import GlassCard from "../../../../components/cards/GlassCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import apiClient from "../../../../services/apiClient";

function ErrorState({ onRetry }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-lg font-semibold text-foreground">Failed to Load Notifications</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm">
        <RefreshCw size={16} /> Retry
      </button>
    </GlassCard>
  );
}

function EmptyState() {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
        <Bell className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold text-foreground">No Notifications</p>
      <p className="text-sm text-muted-foreground">You're all caught up! No new notifications.</p>
    </GlassCard>
  );
}

const TYPE_ICONS = {
  info: Info,
  warning: AlertTriangle,
  announcement: Megaphone,
  event: Calendar,
  message: MessageSquare,
};

const TYPE_COLORS = {
  info: "bg-blue-500/10 text-blue-400",
  warning: "bg-amber-500/10 text-amber-400",
  announcement: "bg-purple-500/10 text-purple-400",
  event: "bg-emerald-500/10 text-emerald-400",
  message: "bg-cyan-500/10 text-cyan-400",
};

export default function GuildNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiClient.get("/notifications");
      setNotifications(res.data?.data || res.data?.notifications || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-accent rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-72 bg-accent rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <LoadingCard key={i} lines={2} />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState onRetry={fetchNotifications} />;
  if (!notifications.length) return <EmptyState />;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Stay updated with guild activities and announcements</p>
      </motion.div>

      <div className="space-y-3">
        {notifications.map((notif, i) => {
          const Icon = TYPE_ICONS[notif.type] || Bell;
          const colorClass = TYPE_COLORS[notif.type] || "bg-accent text-muted-foreground";
          return (
            <motion.div
              key={notif._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{notif.title || notif.message}</p>
                {notif.message && !notif.title && (
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1.5">
                  {new Date(notif.createdAt || notif.timestamp).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
