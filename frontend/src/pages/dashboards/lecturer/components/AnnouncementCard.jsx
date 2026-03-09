import GlassCard from "./GlassCard";
import { Megaphone, Clock, BarChart2, MoreVertical } from "lucide-react";

export default function AnnouncementCard({
  title,
  targetClass,
  date,
  status = "Active",
  engagement,
  delay = 0,
}) {
  const isDraft = status === "Draft";

  return (
    <GlassCard
      delay={delay}
      className="group relative flex flex-col cursor-pointer overflow-hidden h-full min-h-[180px]"
    >
      {/* Subtle Liquid Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      {/* Header / Icons */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div
          className={`p-2.5 rounded-xl border ${
            isDraft
              ? "bg-white/5 border-white/10 text-neutral-400"
              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          } group-hover:scale-110 transition-transform duration-300 ease-out`}
        >
          <Megaphone size={18} />
        </div>
        <button className="text-neutral-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-100 transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4 mt-auto">
          <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
            {targetClass}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {date}
          </span>
        </div>
      </div>

      {/* Footer / Status */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10 mt-auto">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-md border ${
            status === "Active"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : status === "Archived"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-white/5 text-neutral-400 border-white/10"
          }`}
        >
          {status}
        </span>

        {engagement && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-white">
            <BarChart2 size={14} className="text-blue-400" />
            {engagement}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
