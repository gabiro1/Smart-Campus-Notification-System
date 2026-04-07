import React from "react";
import { Users, Megaphone, MapPin, Clock, ArrowRight, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function ClassCard({ cls, onClick, isSelected }) {
  const navigate = useNavigate();

  // Simulated metrics and metadata if not fully provided by backend yet
  const {
    _id,
    name = "Unnamed Class",
    code = "GEN-01",
    isActive = true,
    studentCount = 0,
    activeAnnouncements = 0, // Fallback if missing
    schedule = "TBD",
    location = "TBD",
  } = cls || {};

  return (
    <div 
      onClick={onClick}
      className={`group relative border rounded-[24px] p-6 transition-all duration-300 flex flex-col h-full overflow-hidden ${
        onClick ? "cursor-pointer" : ""
      } ${
        isSelected 
        ? "border-blue-500 bg-input shadow-[0_4px_30px_rgba(59,130,246,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" 
        : "bg-input border-border hover:border-[#3A3F4D] hover:shadow-[0_4px_20px_rgb(0,0,0,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
      }`}
    >
      {/* Soft Ambient Radial Glow Effect on Hover */}
      <div className={`absolute -top-10 -left-10 w-40 h-40 bg-blue-500/0 ${isSelected ? "bg-blue-500/10" : "group-hover:bg-blue-500/5"} blur-3xl rounded-full transition-all duration-700 pointer-events-none`} />
      <div className={`absolute inset-x-0 -top-px h-px w-1/2 mx-auto bg-gradient-to-r from-transparent via-blue-500/0 ${isSelected ? "via-blue-500/80" : "group-hover:via-blue-500/50"} to-transparent transition-all duration-500 pointer-events-none`} />

      {/* Header: Title and Badge */}
      <div className="flex items-start justify-between mb-4">
        <h3
          className={`text-xl font-bold leading-tight line-clamp-2 transition-colors ${isSelected ? "text-blue-400" : "text-white group-hover:text-blue-400"}`}
          title={name}
        >
          {name}
        </h3>
        {isActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </div>
        )}
      </div>

      {/* Academic Context (Metadata Row) */}
      <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
        <span className="px-2.5 py-1 bg-muted rounded-lg text-xs font-bold text-muted-foreground border border-[#3A3F4D]">
          {code}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <Clock size={12} className={isSelected ? "text-blue-400" : "text-muted-foreground"} /> {schedule}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <MapPin size={12} className={isSelected ? "text-blue-400" : "text-muted-foreground"} /> {location}
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className={`border rounded-[16px] p-4 transition-colors ${isSelected ? "bg-blue-500/5 border-blue-500/20" : "bg-[#14161C] border-border shadow-inner"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className={isSelected ? "text-blue-400" : "text-muted-foreground"} />
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              Enrolled
            </span>
          </div>
          <p className="text-2xl font-black text-white">{studentCount}</p>
        </div>
        <div className={`border rounded-[16px] p-4 transition-colors ${isSelected ? "bg-red-500/5 border-red-500/20" : "bg-[#14161C] border-border shadow-inner"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={14} className={isSelected ? "text-red-400" : "text-muted-foreground"} />
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              Alerts
            </span>
          </div>
          <p className="text-2xl font-black text-white">{activeAnnouncements}</p>
        </div>
      </div>

      {/* Spacer to push footer to bottom */}
      <div className="flex-grow" />

      {/* Footer Actions - With Stop Propagation so we don't trigger the card's onClick */}
      <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/lecturer/classes/${_id || "demo"}`);
          }}
          className="flex-1 bg-input hover:bg-muted border border-border text-muted-foreground hover:text-white py-2.5 px-4 rounded-[12px] text-[13px] font-bold transition-all flex items-center justify-center gap-2 group/btn"
        >
          View Course
          <ArrowRight
            size={16}
            className="group-hover/btn:translate-x-1 transition-transform"
          />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/lecturer/dashboard?modal=urgent`); // Open the urgent dispatch externally if needed
          }}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 border border-blue-500 hover:border-blue-400 text-white rounded-[12px] transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] tooltip-trigger group/alert active:scale-95"
          title="Post Alert"
        >
          <Plus size={18} strokeWidth={2.5} className="group-hover/alert:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
