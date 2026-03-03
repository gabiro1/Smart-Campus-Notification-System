import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  AlertCircle,
} from "lucide-react";

export default function EventCard({ event, onRate, onDetails }) {
  // Determine badge color based on approval level
  const getApprovalBadge = (level) => {
    switch (level) {
      case "college":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "school":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2, backgroundColor: "#121212" }}
      className={`relative p-6 rounded-[15px] border border-white/5 bg-[#141414] transition-all group overflow-hidden ${
        event.priority === "high" ? "border-red-500/20" : ""
      }`}
    >
      {/* 1. TOP ROW: META DATA & GOVERNANCE */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-2">
          {/* Approval Badge - UI Proof of your Governance Model */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-black uppercase tracking-tighter w-fit ${getApprovalBadge(event.approvalLevel)}`}
          >
            <ShieldCheck size={10} />
            {event.approvalLevel} Verified
          </div>

          <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
            <Clock size={12} /> {new Date(event.date).toLocaleDateString()}
          </div>
        </div>

        {/* Priority Indicator */}
        {event.priority === "high" && (
          <div className="flex items-center gap-1 text-red-500 text-[9px] font-black animate-pulse">
            <AlertCircle size={10} /> URGENT
          </div>
        )}
      </div>

      {/* 2. CENTER: CONTENT */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-2  transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
          {event.description}
        </p>
      </div>

      {/* 3. BOTTOM: RATINGS & ACTION */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          {/* AI Training: Star Ratings */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(event._id, star);
                }}
                className="hover:scale-125 transition-transform"
              >
                <Star
                  size={14}
                  className="text-neutral-700 hover:text-yellow-500 transition-colors"
                />
              </button>
            ))}
          </div>
          <span className="text-[10px] font-bold text-neutral-600 uppercase">
            Rate Pulse
          </span>
        </div>

        <button
          onClick={() => onDetails(event._id)}
          className="p-2 rounded-lg bg-white/5 hover:text-white text-neutral-400 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Subtle Background Glow for High Level approvals */}
      {event.approvalLevel === "college" && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full" />
      )}
    </motion.div>
  );
}
