// import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Eye, XCircle, Filter } from "lucide-react";

const RECENT_EVENTS = [
  {
    id: 1,
    title: "Huawei ICT Forum",
    author: "Guild President",
    date: "Today, 10:00 AM",
    status: "Verified",
  },
  {
    id: 2,
    title: "Urgent: Room Change",
    author: "Lecturer (Dept of IT)",
    date: "Today, 09:15 AM",
    status: "Pending",
  },
  {
    id: 3,
    title: "Free Pizza at CST",
    author: "Student Group",
    date: "Yesterday",
    status: "Flagged",
  },
];

export default function EventMonitor() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Event Monitor</h1>
          <p className="text-neutral-500">
            Review and verify all announcements across the campus.
          </p>
        </div>
        <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
          <Filter size={16} /> Filter by Status
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {RECENT_EVENTS.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ x: 5 }}
            className="glass p-6 rounded-[32px] border border-white/5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  event.status === "Verified"
                    ? "bg-green-500/10 text-green-500"
                    : event.status === "Flagged"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-500"
                }`}
              >
                {event.status === "Verified" ? (
                  <CheckCircle size={24} />
                ) : event.status === "Flagged" ? (
                  <XCircle size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{event.title}</h3>
                <div className="flex gap-4 mt-1 text-xs text-neutral-500 font-medium uppercase tracking-wider">
                  <span>By {event.author}</span>
                  <span>•</span>
                  <span>{event.date}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-neutral-400 hover:text-white transition-all"
                title="View Content"
              >
                <Eye size={18} />
              </button>
              <button
                className="p-3 bg-green-600/20 hover:bg-green-600 rounded-2xl text-green-500 hover:text-white transition-all"
                title="Verify Event"
              >
                <CheckCircle size={18} />
              </button>
              <button
                className="p-3 bg-red-600/20 hover:bg-red-600 rounded-2xl text-red-500 hover:text-white transition-all"
                title="Take Down"
              >
                <XCircle size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
