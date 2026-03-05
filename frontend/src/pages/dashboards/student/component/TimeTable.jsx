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
// iOS-style Glass Panel
// ─────────────────────────────────────────────
const GlassPanel = ({ children, className = "", active = false }) => (
  <div
    className={`
      relative overflow-hidden rounded-2xl
      bg-white/[0.03] backdrop-blur-2xl
      border border-white/[0.06]
      shadow-[0_2px_20px_rgba(0,0,0,0.3)]
      ${active ? "bg-white/[0.07] border-white/[0.12] shadow-[0_4px_30px_rgba(59,130,246,0.08)]" : ""}
      ${className}
    `}
  >
    {/* iOS-style top highlight */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    {children}
  </div>
);

// ─────────────────────────────────────────────
// Floating Time Indicator (iOS widget style)
// ─────────────────────────────────────────────
const TimeChip = ({ time, isNow = false }) => (
  <div
    className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
      ${
        isNow
          ? "bg-green-500/15 text-green-400 ring-1 ring-green-500/20"
          : "bg-white/[0.04] text-white/40 ring-1 ring-white/[0.06]"
      }
    `}
  >
    <Clock size={11} />
    {time}
  </div>
);

// ─────────────────────────────────────────────
// Schedule Card
// ─────────────────────────────────────────────
const ScheduleCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        delay: index * 0.08,
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <GlassPanel
        className={`
          group cursor-pointer
          transition-all duration-500 ease-out
          hover:bg-white/[0.06] hover:border-white/[0.12]
          hover:shadow-[0_8px_40px_rgba(59,130,246,0.06)]
          hover:translate-y-[-2px]
        `}
      >
        <div
          className="p-5 md:p-6"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-start gap-5">
            {/* Left — Icon Block (iOS widget style) */}
            <div className="relative flex-shrink-0">
              <div
                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center
                  bg-gradient-to-br from-blue-500/15 to-blue-600/5
                  border border-blue-500/10
                  transition-all duration-500
                  ${isHovered ? "from-blue-500/25 to-blue-600/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.12)]" : ""}
                `}
              >
                <BookOpen size={20} className="text-blue-400" />
              </div>
              {/* Subtle glow behind icon */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>

            {/* Center — Content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Course Name */}
              <h3
                className={`
                  text-[15px] font-semibold tracking-tight leading-snug
                  transition-colors duration-300
                  ${isHovered ? "text-white" : "text-white/85"}
                `}
              >
                {item.course}
              </h3>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-3">
                <TimeChip time={item.time} />

                <span className="flex items-center gap-1.5 text-[11px] text-white/30 font-medium">
                  <MapPin size={12} className="text-white/20" />
                  {item.room}
                </span>

                <span className="flex items-center gap-1.5 text-[11px] text-white/30 font-medium">
                  <User size={12} className="text-white/20" />
                  {item.lecturer}
                </span>
              </div>
            </div>

            {/* Right — Arrow */}
            <div
              className={`
                hidden md:flex items-center justify-center
                w-9 h-9 rounded-xl
                bg-white/[0.03] border border-white/[0.05]
                transition-all duration-300
                ${isHovered ? "bg-white/[0.08] border-white/[0.1] text-white/60" : "text-white/15"}
              `}
            >
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function TimeTable() {
  const [selectedDay, setSelectedDay] = useState("Monday");

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

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayAbbrev = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
  };
  const totalClasses = scheduleData[selectedDay]?.length || 0;

  return (
    <div className="min-h-screen bg-[#000000] text-white relative overflow-hidden ml-70">
      {/* ── Ambient Background ── */}
      {/* <div className="fixed inset-0 pointer-events-none z-0"> */}
      {/* Soft gradient orbs */}
      {/* <div className="absolute top-[-15%] left-[5%] w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-violet-600/[0.025] rounded-full blur-[100px]" />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-cyan-500/[0.015] rounded-full blur-[80px]" /> */}

      {/* Subtle noise texture */}
      {/* <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        /> */}
      {/* </div> */}

      {/* ── Content ── */}
      <main className="relative z-10 flex-1 p-6 md:p-12 pt-28 max-w-4xl mx-auto w-full pl-66">
        {/* ── Header ── */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/15 flex items-center justify-center">
              <GraduationCap size={18} className="text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-[0.25em]">
              Official Schedule
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white/95 leading-tight">
            Academic Timetable
          </h1>
          <p className="text-sm text-white/25 mt-2 leading-relaxed">
            Shared by the Head of Department — Level 4 Information Technology
          </p>

          {/* Divider */}
          <div className="mt-8 h-px bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent" />
        </header>

        {/* ── Day Selector (iOS Segmented Control) ── */}
        <div className="mb-8">
          <GlassPanel className="p-1.5 inline-flex gap-1">
            {days.map((day) => {
              const isActive = selectedDay === day;
              const classCount = scheduleData[day]?.length || 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className="relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDay"
                      className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.1]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <div
                    className={`
                      relative z-10 flex flex-col items-center gap-0.5
                      px-4 md:px-6 py-2.5 rounded-xl
                      transition-all duration-200
                      ${isActive ? "text-white" : "text-white/25 hover:text-white/50"}
                    `}
                  >
                    <span className="text-xs font-semibold tracking-wide">
                      <span className="hidden md:inline">{day}</span>
                      <span className="md:hidden">{dayAbbrev[day]}</span>
                    </span>
                    {classCount > 0 && (
                      <span
                        className={`
                          text-[9px] font-bold tabular-nums
                          ${isActive ? "text-blue-400" : "text-white/15"}
                        `}
                      >
                        {classCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </GlassPanel>
        </div>

        {/* ── Day Summary ── */}
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-sm font-medium text-white/40">{selectedDay}</h2>
          <span className="text-xs text-white/20 font-mono tabular-nums">
            {totalClasses} class{totalClasses !== 1 ? "es" : ""}
          </span>
        </div>

        {/* ── Schedule List ── */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {scheduleData[selectedDay]?.map((item, index) => (
                <ScheduleCard key={index} item={item} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* ── Empty State ── */}
          {totalClasses === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassPanel className="py-16 px-8">
                <div className="flex flex-col items-center text-center">
                  {/* iOS-style empty icon */}
                  <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                    <Calendar size={24} className="text-white/10" />
                  </div>
                  <p className="text-sm font-medium text-white/20 mb-1">
                    No classes scheduled
                  </p>
                  <p className="text-xs text-white/10">
                    {selectedDay} is free — enjoy the break.
                  </p>
                </div>
              </GlassPanel>
            </motion.div>
          )}
        </div>

        {/* ── Footer Note ── */}
        <div className="mt-12 px-1">
          <div className="h-px bg-gradient-to-r from-white/[0.04] to-transparent mb-4" />
          <p className="text-[10px] text-white/10 font-mono leading-relaxed">
            Schedule subject to change. Last updated by HoD office.
          </p>
        </div>
      </main>
    </div>
  );
}
