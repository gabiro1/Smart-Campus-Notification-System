import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  X,
  CheckCheck,
} from "lucide-react";

const typeStyles = {
  success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  event: { icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  reminder: { icon: Bell, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  default: { icon: Info, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationDetailModal({ notification, onClose, onMarkAsRead }) {
  if (!notification) return null;

  const style = typeStyles[notification.type] || typeStyles.default;
  const Icon = style.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl w-full sm:max-w-lg p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl ${style.bg} ${style.border} border`}>
                <Icon size={16} className={style.color} />
                <span className={`text-xs font-semibold uppercase ${style.color}`}>
                  {notification.type || "Notification"}
                </span>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{notification.title}</h2>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6 whitespace-pre-wrap">
              {notification.message || notification.desc || notification.body || "No additional details."}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <Clock size={14} className="text-neutral-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase text-neutral-500 font-medium">Received</p>
                  <p className="text-sm text-white">{formatDate(notification.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <CheckCheck size={14} className="text-neutral-500 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase text-neutral-500 font-medium">Status</p>
                  <p className="text-sm text-white capitalize">{notification.status || "unread"}</p>
                </div>
              </div>
            </div>

            {notification.unread && (
              <button
                onClick={() => {
                  onMarkAsRead?.(notification.id || notification._id);
                  onClose();
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <CheckCheck size={16} />
                Mark as read
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
