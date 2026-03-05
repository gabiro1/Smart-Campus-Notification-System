import { useState } from "react";
import GlassCard from "../components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Send,
  Clock,
  CheckCheck,
} from "lucide-react";

const notificationsData = [
  // Incoming Notifications
  {
    id: 1,
    category: "incoming",
    type: "alert",
    title: "System Maintenance",
    time: "2 hours ago",
    desc: "The student portal will undergo maintenance this Sunday from 2 AM to 4 AM. Announcements scheduled during this time may be delayed.",
    unread: true,
    icon: AlertCircle,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    id: 2,
    category: "incoming",
    type: "system",
    title: "Weekly Analytics Report",
    time: "Yesterday",
    desc: "Your weekly engagement report is ready. Average open rates are up by 4% across all your classes.",
    unread: false,
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    id: 3,
    category: "incoming",
    type: "system",
    title: "New Feature Available",
    time: "Oct 20, 2026",
    desc: "You can now use AI tags to automatically categorize your announcements.",
    unread: false,
    icon: Bell,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },

  // Sent History
  {
    id: 4,
    category: "sent",
    type: "broadcast",
    title: "Midterm Exam Schedule",
    time: "Today, 10:00 AM",
    desc: "Successfully delivered to 142 students in CS101. Current open rate: 84%.",
    status: "Delivered",
    icon: Send,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    id: 5,
    category: "sent",
    type: "broadcast",
    title: "Assignment 3 Extended",
    time: "Yesterday, 3:30 PM",
    desc: "Successfully delivered to 85 students in ENG201. Current open rate: 92%.",
    status: "Delivered",
    icon: Send,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("incoming");

  // Filter data based on active tab
  const filteredNotifications = notificationsData.filter(
    (n) => n.category === activeTab,
  );

  // Count unread incoming notifications
  const unreadCount = notificationsData.filter(
    (n) => n.category === "incoming" && n.unread,
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Notifications
          </h1>
          <p className="text-neutral-400">
            View system alerts and your broadcast delivery history.
          </p>
        </div>
        {activeTab === "incoming" && unreadCount > 0 && (
          <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/20">
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </header>

      {/* Liquid Tabs */}
      <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10 w-fit relative">
        {["incoming", "sent"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-2.5 text-sm font-medium transition-colors z-10 capitalize flex items-center gap-2 ${
              activeTab === tab
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="notification-tabs"
                className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {tab === "incoming" ? "Inbox" : "Sent History"}
            {tab === "incoming" && unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab ? "bg-blue-500 text-white" : "bg-white/10 text-neutral-400"}`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline Layout */}
      <div className="relative pt-4">
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 md:left-8 top-8 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/10 to-transparent" />

        <div className="space-y-6">
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
                className="relative pl-16 md:pl-20 pr-2 group"
              >
                {/* Timeline Node */}
                <div
                  className={`absolute left-2 md:left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center border z-10 transition-transform duration-300 group-hover:scale-110 ${note.bg} ${note.border} ${note.unread ? "shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "shadow-lg"}`}
                >
                  <note.icon size={16} className={note.color} />
                </div>

                {/* Content Card */}
                <GlassCard
                  delay={0}
                  hover={false}
                  className={`p-5 transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/20 ${note.unread ? "border-blue-500/30 bg-blue-500/[0.02]" : ""}`}
                >
                  {/* Unread Pulsing Badge */}
                  {note.unread && (
                    <span className="absolute top-5 right-5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    </span>
                  )}

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                    <h3
                      className={`font-semibold text-base ${note.unread ? "text-white" : "text-neutral-200"}`}
                    >
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 bg-black/40 px-2.5 py-1 rounded-md border border-white/5 w-fit">
                      <Clock size={12} />
                      {note.time}
                    </div>
                  </div>

                  <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                    {note.desc}
                  </p>

                  {/* Sent History Specific Meta */}
                  {note.category === "sent" && (
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                        <CheckCheck size={14} /> {note.status}
                      </span>
                      <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                        View Analytics &rarr;
                      </button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pl-16 md:pl-20 py-10"
            >
              <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Bell size={32} className="text-neutral-600 mb-3" />
                <p className="text-neutral-400 font-medium">
                  You're all caught up!
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  No {activeTab} notifications to display right now.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
