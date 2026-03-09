import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Updated styles to match the 'Leads' image (Low opacity bg + Bold text)
const ROLE_STYLES = {
  student: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  lecturer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  hod: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  guild_president: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  admin: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function StatusBadge({ currentRole, options, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize role string for style mapping (lowercase/underscore)
  const styleKey = currentRole?.toLowerCase().replace(" ", "_");

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents row-click navigation
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-tighter transition-all hover:brightness-125 ${
          ROLE_STYLES[styleKey] || ROLE_STYLES.student
        }`}
      >
        {currentRole.replace("_", " ")}
        <ChevronDown
          size={10}
          strokeWidth={3}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay to close when clicking outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute left-0 z-50 w-44 bg-[#111111] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1.5 backdrop-blur-xl"
            >
              <div className="text-[9px] uppercase font-black text-neutral-600 px-3 py-2 tracking-widest">
                Change Role
              </div>
              {options.map((option) => (
                <button
                  key={option}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-between ${
                    currentRole === option
                      ? "bg-blue-600 text-white"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {option.replace("_", " ")}
                  {currentRole === option && (
                    <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
