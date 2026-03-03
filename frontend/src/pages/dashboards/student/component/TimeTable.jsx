import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, ChevronRight } from "lucide-react";


export default function TimeTable() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  // This data would be fetched from the HoD's shared collection
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
    ],
    Tuesday: [
      {
        time: "14:00 - 16:00",
        course: "Database Systems",
        room: "Lab 1",
        lecturer: "Mr. Jean",
      },
    ],
    // ... rest of the week
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col pl-66  ">
     
      <main className="flex-1 p-6 md:p-12 pt-32 max-w-5xl mx-auto w-full space-y-5">
        <header>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">
            Official Schedule
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Academic Time Table
          </h1>
          <p className="text-neutral-500 text-sm mt-4">
            Shared by the Head of Department for Level 4 IT.
          </p>
        </header>

        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-sm text-xs font-bold transition-all whitespace-nowrap border ${
                selectedDay === day
                  ? "text-white "
                  : "glass  border-white/5 text-neutral-500 hover:text-white"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {scheduleData[selectedDay]?.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="glass p-6 rounded-sm border border-white/5 bg-white/[0.01] flex flex-col md:flex-row justify-between items-center group hover:border-white/10"
            >
              <div className="flex items-center gap-6 w-full">
                <div className="flex flex-col items-center justify-center bg-blue-600/10 border border-blue-500/20 w-20 h-20 rounded-2xl shrink-0">
                  <Clock className="text-blue-500 mb-1" size={20} />
                  <span className="text-[10px] font-black text-blue-400">
                    CLASS
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">
                    {item.course}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {item.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} /> {item.room}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User size={14} /> {item.lecturer}
                    </span>
                  </div>
                </div>
              </div>

              <button className="hidden md:flex p-4 rounded-2xl glass border-white/5 text-neutral-500 hover:text-white mt-4 md:mt-0 transition-all">
                <ChevronRight size={20} />
              </button>
            </motion.div>
          ))}

          {(!scheduleData[selectedDay] ||
            scheduleData[selectedDay].length === 0) && (
            <div className="glass p-12 rounded-[40px] border border-white/5 text-center italic text-neutral-600">
              No classes scheduled for {selectedDay}.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
