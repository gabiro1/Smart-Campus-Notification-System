import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, CheckCircle, Clock, X, Info } from "lucide-react";
import adminService from "../../../../services/adminService"; // Adjust path if needed

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch global warnings and pending approvals
  useEffect(() => {
    const fetchGlobalAlerts = async () => {
      try {
        const metricsData = await adminService.getDashboardMetrics();
        const systemAlerts = metricsData.alerts || [];

        // Fallback dummy data if your backend doesn't have alerts yet
        const dummyNotifications = [
          {
            id: "1",
            type: "warning",
            title: "High SMS Usage",
            message: "You have used 85% of your monthly SMS quota.",
            time: "10m ago",
            isRead: false,
          },
          {
            id: "2",
            type: "action",
            title: "Pending Approval",
            message: "Dr. Smith requested a broadcast to CST.",
            time: "1h ago",
            isRead: false,
          },
        ];

        setNotifications(dummyNotifications);
        setUnreadCount(dummyNotifications.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchGlobalAlerts();
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.isRead).length);
  };

  const getIcon = (type) => {
    switch (type) {
      case "error":
        return <AlertTriangle size={18} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={18} className="text-amber-500" />;
      case "action":
        return <Clock size={18} className="text-purple-500" />;
      case "success":
        return <CheckCircle size={18} className="text-green-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-[#111] hover:bg-[#1A1A1A] rounded-full text-neutral-400 hover:text-white transition-all border border-white/5 shadow-md"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border border-[#050505] text-[9px] font-black text-white shadow-sm"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* The Dropdown Panel - Animatng from top right down */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-[#0D0D0D] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 flex flex-col items-center gap-2">
                  <CheckCircle size={32} className="text-white/10" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    You're all caught up
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group ${!notif.isRead ? "bg-blue-500/[0.02]" : ""}`}
                    >
                      <div
                        className={`shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center ${
                          notif.type === "error"
                            ? "bg-red-500/10"
                            : notif.type === "warning"
                              ? "bg-amber-500/10"
                              : notif.type === "action"
                                ? "bg-purple-500/10"
                                : "bg-blue-500/10"
                        }`}
                      >
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p
                            className={`text-sm ${!notif.isRead ? "font-bold text-white" : "font-medium text-neutral-400"}`}
                          >
                            {notif.title}
                          </p>
                          <button
                            onClick={(e) => removeNotification(notif.id, e)}
                            className="text-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed pr-4">
                          {notif.message}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mt-2">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-[#0a0a0a] text-center">
              <button className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                View Full Logs
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
