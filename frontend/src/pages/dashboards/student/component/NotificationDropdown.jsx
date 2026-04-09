import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Megaphone, 
  Calendar, 
  X, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

/**
 * NotificationDropdown
 * --------------------
 * A premium, high-fidelity dropdown for real-time academic pulses.
 * Designed with a glassmorphic aesthetic to match the UniNotify dashboard.
 * 
 * Props:
 * - notifications: Array of notification objects
 * - unreadCount: Number of unread alerts
 * - onMarkAsRead: Function to handle marking single items
 * - onClearAll: Function to handle clear all action
 * - isOpen: Boolean controlling visibility
 * - onClose: Function to close the dropdown
 */
const NotificationDropdown = ({ 
  notifications = [], 
  unreadCount = 0, 
  onMarkAsRead, 
  onClearAll, 
  isOpen, 
  onClose 
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    if (notif.status === 'unread') {
      onMarkAsRead(notif._id);
    }
    
    // Dynamic Navigation Logic
    if (notif.data?.pulseId) {
      if (notif.type === 'announcement') {
        navigate(`/student/announcements?id=${notif.data.pulseId}`);
      } else {
        navigate(`/student/events?id=${notif.data.pulseId}`);
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={onClose} 
          />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 w-[380px] bg-card/95 backdrop-blur-xl border border-border rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-accent">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Bell size={14} className="text-blue-500" />
                  Academic Pulses
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} NEW UPDATES` : "NO NEW UPDATES"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button 
                    onClick={onClearAll}
                    className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-16 h-16 bg-accent border border-border rounded-2xl flex items-center justify-center mb-4 text-muted-foreground">
                    <Bell size={32} strokeWidth={1} />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Your feed is quiet
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Verified campus alerts will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notif) => (
                    <button
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left p-5 hover:bg-primary/10 transition-all flex gap-4 relative group ${
                        notif.status === 'unread' ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      {/* Unread Indicator */}
                      {notif.status === 'unread' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      )}

                      {/* Icon */}
                      <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        notif.type === 'event' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {notif.type === 'event' ? <Calendar size={18} /> : <Megaphone size={18} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-foreground truncate pr-4 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                            {notif.title}
                          </h4>
                          <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock size={8} />
                            {formatDistanceToNow(new Date(notif.createdAt || Date.now()), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-3">
                           <span className="flex items-center gap-1 text-[9px] font-black text-blue-500/60 uppercase">
                             <ShieldCheck size={10} /> Verified Pulse
                           </span>
                           <div className="ml-auto flex items-center gap-1 text-[9px] font-bold text-muted-foreground group-hover:text-blue-500 transition-colors">
                             VIEW DETAILS <ArrowRight size={10} />
                           </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <button 
                onClick={() => { navigate('/student/notifications'); onClose(); }}
                className="w-full py-4 text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-[0.2em] bg-primary/10 border-t border-border transition-all"
              >
                View Archive History
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
