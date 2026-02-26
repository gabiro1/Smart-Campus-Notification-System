import { motion } from "framer-motion";
import { AlertCircle, Clock } from "lucide-react";

const CRITICAL_ALERTS = [
  {
    id: 1,
    title: "Exam Venue Change",
    desc: "Level 4 IT exam moved to Lab 5",
    time: "10 mins ago",
  },
  {
    id: 2,
    title: "Urgent Meeting",
    desc: "Guild members report to office",
    time: "30 mins ago",
  },
];

export default function AlertCarousel() {
  return (
    <div className="mb-8 overflow-hidden">
      <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        Critical Alerts
      </h3>

      <motion.div
        drag="x"
        dragConstraints={{ right: 0, left: -300 }} // Adjust based on number of items
        className="flex gap-4 cursor-grab active:cursor-grabbing"
      >
        {CRITICAL_ALERTS.map((alert) => (
          <motion.div
            key={alert.id}
            className="min-w-[300px] p-5 rounded-[28px] bg-red-600/10 border border-red-500/20 glass relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-600/20 blur-2xl rounded-full" />

            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-red-500/20 rounded-xl text-red-400">
                <AlertCircle size={18} />
              </div>
              <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                <Clock size={10} /> {alert.time}
              </span>
            </div>

            <h4 className="text-white font-bold text-lg mb-1">{alert.title}</h4>
            <p className="text-neutral-400 text-sm">{alert.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
