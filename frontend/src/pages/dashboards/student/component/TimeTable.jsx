import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  User,
  ChevronRight,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";

// ─────────────────────────────────────────────
// Reusable Glass Panel
// ─────────────────────────────────────────────
const GlassPanel = ({ children, className = "" }) => (
  <div
    className={`
      relative overflow-hidden rounded-3xl
      bg-white/[0.02] backdrop-blur-xl
      border border-white/[0.05]
      ${className}
    `}
  >
    {/* Subtle top highlight for depth */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent opacity-50" />
    {children}
  </div>
);

// ─────────────────────────────────────────────
// Schedule Card Component
// ─────────────────────────────────────────────
const ScheduleCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
  >
    <div className="group relative p-4 md:p-6 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-3xl transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-0.5">
      <div className="flex items-start md:items-center gap-4 md:gap-5">
        {/* Icon - Shrinks slightly on mobile */}
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 mt-1 md:mt-0">
          <BookOpen
            size={18}
            className="text-white/40 group-hover:text-white/80 transition-colors"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white/90 font-semibold text-sm md:text-base mb-2 md:mb-1.5 pr-6 md:pr-0 leading-tight">
            {item.course}
          </h3>

          {/* Meta Details - Wraps on mobile */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[11px] md:text-xs text-white/30 font-medium">
            <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full text-white/60">
              <Clock size={12} /> {item.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> {item.room}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={13} /> {item.lecturer}
            </span>
          </div>
        </div>

        {/* Arrow - Hidden on very small screens, visible on hover for desktop */}
        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
          <ChevronRight
            size={16}
            className="text-white/30 group-hover:text-white/80 transition-all transform group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function TimeTable() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  // Day configurations for responsive labels
  const days = [
    { full: "Monday", short: "Mon" },
    { full: "Tuesday", short: "Tue" },
    { full: "Wednesday", short: "Wed" },
    { full: "Thursday", short: "Thu" },
    { full: "Friday", short: "Fri" },
  ];

  const scheduleData = {
    Monday: [
      {
        time: "08:00 - 10:00",
        course: "Advanced Programming",
        room: "Lab 2",
        lecturer: "Dr. Kamali",
      },
      {
        time: "11:00 - 13:00",
        course: "Cybersecurity",
        room: "Hall 4",
        lecturer: "Prof. Agnes",
      },
      {
        time: "14:00 - 16:00",
        course: "Software Engineering",
        room: "Room 12",
        lecturer: "Dr. Mugisha",
      },
    ],
    Tuesday: [
      {
        time: "09:00 - 11:00",
        course: "Database Systems",
        room: "Lab 1",
        lecturer: "Mr. Jean",
      },
      {
        time: "14:00 - 16:00",
        course: "Computer Networks",
        room: "Hall 2",
        lecturer: "Dr. Uwimana",
      },
    ],
    Wednesday: [
      {
        time: "08:00 - 10:00",
        course: "Artificial Intelligence",
        room: "Lab 3",
        lecturer: "Prof. Habimana",
      },
    ],
    Thursday: [],
    Friday: [
      {
        time: "10:00 - 12:00",
        course: "Project Management",
        room: "Hall 1",
        lecturer: "Mrs. Ingabire",
      },
    ],
  };

  const currentClasses = scheduleData[selectedDay] || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* ── Ambient Background Glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      {/* ── Main Layout Wrapper ── 
          Accounts for the Rail Sidebar (w-20 on mobile, w-72 on desktop)
      */}
      <div className="relative z-10 transition-all duration-300 ml-20 md:ml-72">
        {/* ── Centering Container ── */}
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 md:py-20 min-h-screen flex flex-col">
          {/* Header */}
          <header className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-4 opacity-60">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <GraduationCap size={16} />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                Official Schedule
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 md:mb-3">
              Academic Timetable
            </h1>
            <p className="text-white/30 text-xs md:text-sm">
              Level 4 Information Technology
            </p>
          </header>

          {/* Responsive Day Selector */}
          <div className="mb-8 md:mb-12 flex justify-center md:justify-start">
            <div className="inline-flex p-1 md:p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {days.map((day) => {
                const isActive = selectedDay === day.full;
                return (
                  <button
                    key={day.full}
                    onClick={() => setSelectedDay(day.full)}
                    className="relative flex-1 sm:flex-none px-3 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(255,255,255,0.1)]"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${isActive ? "text-black" : "text-white/40 hover:text-white/70"}`}
                    >
                      {/* Short name on mobile, Full name on desktop */}
                      <span className="md:hidden">{day.short}</span>
                      <span className="hidden md:inline">{day.full}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule List */}
          <div className="flex-1 space-y-3 md:space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
                className="space-y-3 md:space-y-4"
              >
                {currentClasses.length > 0 ? (
                  currentClasses.map((item, i) => (
                    <ScheduleCard key={i} item={item} index={i} />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassPanel className="py-20 px-6 text-center mt-4">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <Calendar size={24} className="text-white/20" />
                      </div>
                      <h3 className="text-white/60 font-medium mb-1">
                        No classes scheduled
                      </h3>
                      <p className="text-white/20 text-xs md:text-sm">
                        Enjoy your {selectedDay} off.
                      </p>
                    </GlassPanel>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
