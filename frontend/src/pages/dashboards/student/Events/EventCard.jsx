import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Star,
  Clock,
  MapPin,
} from "lucide-react";

export default function EventCard({ event, onRate, onDetails }) {
  const getBadgeStyle = (school) => {
    if (school?.toLowerCase().includes("college"))
      return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    if (school?.toLowerCase().includes("school"))
      return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <motion.div
      whileHover={{ y: -2, backgroundColor: "#121212" }}
      className={`relative p-6 rounded-[15px] border border-white/5 bg-[#141414] transition-all group flex flex-col justify-between h-full w-full ${
        event.priority === "high" ? "border-red-500/20" : ""
      }`}
      onClick={() => onDetails && onDetails(event)}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-black uppercase tracking-tighter ${getBadgeStyle(event.school)}`}
          >
            <ShieldCheck size={10} /> {event.school || "Department"} Verified
          </div>
          {event.priority === "high" && (
            <div className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <AlertCircle size={12} /> Urgent
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {new Date(event.date).toLocaleDateString()}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {event.location}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-6">
          {event.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRate(event, star)}
                className="hover:scale-125 transition-transform"
              >
                <Star
                  size={14}
                  className={
                    star <= (event.averageRating || 0)
                      ? "fill-neutral-500 text-neutral-500"
                      : "text-neutral-700 hover:text-yellow-500"
                  }
                />
              </button>
            ))}
          </div>
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
            Rate
          </span>
        </div>

        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 text-neutral-400 group-hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
