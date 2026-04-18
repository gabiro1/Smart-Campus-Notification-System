import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  CheckCheck,
  Activity,
} from "lucide-react";
import notificationService from "../../services/notificationService"; // Adjust path if needed
import toast from "react-hot-toast";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [digest, setDigest] = useState(null);
  const [loadingDigest, setLoadingDigest] = useState(false);

  const dropdownRef = useRef(null);

  // 1. Fetch initial unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // 2. Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      console.error("Failed to fetch unread count");
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(1, 10); // Get latest 10
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestDigest = async () => {
    try {
      const data = await notificationService.getLatestDigest();
      if (data.success && data.summary) {
        setDigest(data.summary);
      } else {
        setDigest(null);
      }
    } catch {
      console.error("Failed to fetch latest digest");
      setDigest(null);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications(); // Fetch notifications
      fetchLatestDigest(); // Fetch latest digest
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id, currentStatus) => {
    if (currentStatus === "read") return; // Already read

    try {
      await notificationService.markAsRead(id);

      // Update local state for instant UI feedback
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, status: "read" } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, status: "read" })),
      );
      setUnreadCount(0);
      toast.success("All caught up!");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleGenerateDigest = async () => {
    setLoadingDigest(true);
    try {
      const result = await notificationService.generateDigest('daily');
      if (result.success && result.summary) {
        setDigest(result.summary);
        toast.success('Digest generated!');
      } else if (result.success && !result.summary) {
        setDigest('No new low-priority notifications to summarize.');
        toast.info('No new notifications to digest.');
      } else {
        throw new Error(result.message || 'Failed to generate digest');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to generate digest');
    } finally {
      setLoadingDigest(false);
    }
  };

  // Helper to map notification type to styling
  const getNotificationStyle = (type) => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle size={16} />,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      case "warning":
        return {
          icon: <AlertTriangle size={16} />,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        };
      case "event":
        return {
          icon: <Calendar size={16} />,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        };
      default:
        return {
          icon: <Info size={16} />,
          color: "text-purple-500",
          bg: "bg-purple-500/10",
        };
    }
  };

  // Helper to format timestamps (e.g., "2 hours ago")
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
      >
        <Bell size={20} />
        {/* Red Dot Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            />
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-background border border-white/10 rounded-[20px] shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111]">
              <h3 className="font-black text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
                <button
                  onClick={handleGenerateDigest}
                  disabled={loadingDigest}
                  className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="Generate AI digest of low-priority notifications"
                >
                  {loadingDigest ? (
                    <>Generating...</>
                  ) : (
                    <>📋 Digest</>
                  )}
                </button>
              </div>
            </div>

            {/* Digest Section */}
            {(digest || loadingDigest) && (
              <div className="p-4 border-b border-white/5 bg-[#0a0a0a]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    AI Daily Digest
                  </h4>
                </div>
                {loadingDigest ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Activity className="animate-spin" size={14} />
                    Generating your digest...
                  </div>
                ) : (
                  <div className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed bg-[#111] p-3 rounded-lg border border-white/5">
                    {digest}
                  </div>
                )}
              </div>
            )}

            {/* List Body */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar flex-1 bg-background">
              {loading ? (
                <div className="p-8 flex flex-col items-center justify-center gap-3 text-neutral-500">
                  <Activity className="animate-spin text-blue-500" size={24} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    Loading...
                  </span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  <Bell size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => {
                    const style = getNotificationStyle(notif.type);
                    const isUnread = notif.status === "unread";

                    return (
                      <div
                        key={notif._id}
                        onClick={() =>
                          handleMarkAsRead(notif._id, notif.status)
                        }
                        className={`p-4 hover:bg-white/[0.03] transition-colors cursor-pointer flex gap-4 ${isUnread ? "bg-white/[0.02]" : "opacity-60 hover:opacity-100"}`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}
                        >
                          {style.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-sm font-bold ${isUnread ? "text-white" : "text-neutral-300"}`}
                            >
                              {notif.title}
                            </h4>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mt-2 block">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-[#111] text-center">
              <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                View notification history
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
