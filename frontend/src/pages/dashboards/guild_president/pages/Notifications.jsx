import GlassCard from "../components/GlassCard";
import { Bell, AlertCircle, CheckCircle2, Megaphone } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "alert",
    title: "Admin Meeting Moved",
    time: "10 mins ago",
    desc: "The monthly campus admin sync has been moved to 3 PM.",
    unread: true,
    icon: AlertCircle,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    id: 2,
    type: "campaign",
    title: "Tech Symposium Blast Sent",
    time: "2 hours ago",
    desc: "Successfully delivered to 4,200 Engineering students.",
    unread: false,
    icon: Megaphone,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: 3,
    type: "system",
    title: "System Maintenance",
    time: "Yesterday",
    desc: "Student portal will be down from 2 AM - 4 AM on Sunday.",
    unread: false,
    icon: Bell,
    color: "text-neutral-400",
    bg: "bg-white/5",
  },
];

export default function Notifications() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Communication Center
          </h1>
          <p className="text-neutral-400">
            Manage alerts and student campaign history.
          </p>
        </div>
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
          Mark all as read
        </button>
      </header>

      <GlassCard className="p-8">
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {notifications.map((note, index) => (
            <div
              key={note.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Timeline dot */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/10 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${note.bg} ${note.unread ? "shadow-[0_0_15px_rgba(59,130,246,0.3)]" : ""}`}
              >
                <note.icon size={18} className={note.color} />
              </div>

              {/* Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-300 relative">
                {note.unread && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                )}
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-semibold ${note.unread ? "text-white" : "text-neutral-300"}`}
                  >
                    {note.title}
                  </h3>
                  <span className="text-xs font-medium text-neutral-500">
                    {note.time}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">{note.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
