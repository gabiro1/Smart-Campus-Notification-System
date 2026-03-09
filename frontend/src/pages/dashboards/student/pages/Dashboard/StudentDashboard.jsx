import { useState, useEffect } from "react";
import StudentSidebar from "../../component/StudentNav";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Sparkles,
  Star,
  Heart,
  ArrowRight,
  Clock,
  Zap,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useEvents } from "../../../../../hooks";

// --- FALLBACK DATA: Keeps the UI beautiful even if the database is empty ---
const fallbackEvents = [
  {
    _id: "fb1",
    title: "URGENT: Advanced Programming Venue Change",
    description:
      "Due to network maintenance in Hall 4, today's session for Level 4 IT has been relocated to Computer Lab 2.",
    date: new Date().toISOString(),
    priority: "high",
    aiMatchScore: 98,
    tags: ["urgent", "venue"],
  },
  {
    _id: "fb2",
    title: "Campus-Wide Wi-Fi Upgrade",
    description:
      "The IT Directorate will be upgrading core routers across the CST campus this weekend. Expect outages.",
    date: new Date().toISOString(),
    priority: "medium",
    aiMatchScore: 82,
    tags: ["network", "campus"],
  },
  {
    _id: "fb3",
    title: "Guest Lecture: AI in Agriculture",
    description:
      "Join us for a seminar discussing how AI models predict farming risks. Highly recommended for IT final years.",
    date: new Date().toISOString(),
    priority: "low",
    aiMatchScore: 95,
    tags: ["ai", "seminar"],
  },
];

export default function StudentDashboard() {
  const { events, loading, error, getEvents, rateEvent, markInterested } =
    useEvents();
  const [selectedRating, setSelectedRating] = useState({});

  useEffect(() => {
    getEvents(1, 10);
  }, []);

  // Use real events if they exist, otherwise use the fallback data
  const displayEvents = events && events.length > 0 ? events : fallbackEvents;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* 1. Sidebar - Persistent on the left */}
      <StudentSidebar />

      {/* 2. Main Content */}
      <main className="flex-1 ml-[280px] p-8 min-h-screen">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 tracking-widest mb-1">
              <span>STUDENT</span>
              <span>/</span>
              <span className="text-white uppercase">Personal Pulse</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Academic Dashboard
            </h1>
          </div>

          <div className="flex gap-3">
            <div className="glass px-4 py-2 rounded-[7px] border border-white/5 flex items-center gap-2">
              <Zap size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase text-neutral-400">
                AI Synced
              </span>
            </div>
          </div>
        </header>

        {/* Action Row */}
        <div className="flex items-center mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600"
              size={16}
            />
            <input
              type="text"
              placeholder="Search announcements, tags, or lecturers..."
              className="w-full bg-[#111111] border border-white/10 rounded-[7px] py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-800"
            />
          </div>
          <button className="bg-[#111111] border border-white/5 px-4 py-2.5 rounded-[7px] text-xs font-bold text-neutral-300 flex items-center gap-2 hover:border-white/20">
            <Filter size={14} /> Filter View
          </button>
        </div>

        {/* Top Personal Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <StatCard
            title="Relevant Pulses"
            value={displayEvents.length}
            change="New today"
            color="text-blue-500"
            icon={<Sparkles size={16} />}
          />
          <StatCard
            title="Attendance Rate"
            value="94%"
            change="L4 IT Avg"
            color="text-green-500"
          />
          <StatCard
            title="AI Match Accuracy"
            value="98.2%"
            change="Based on interactions"
            color="text-purple-500"
          />
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* LEFT: AI RANKED FEED */}
          <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[10px] p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-lg font-bold">Recommended for You</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  AI-ranked pulses from your department
                </p>
              </div>
              <span className="text-[9px] bg-blue-600/20 text-blue-500 px-2 py-1 rounded font-black tracking-tighter uppercase">
                AI Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading && (!events || events.length === 0) ? (
                <div className="flex items-center gap-2 text-neutral-600 text-sm italic">
                  Syncing...
                </div>
              ) : (
                displayEvents.map((event) => (
                  <motion.div
                    key={event._id}
                    whileHover={{ y: -2, backgroundColor: "#121212" }}
                    className={`p-6 rounded-[15px] border border-white/5 bg-[#141414] transition-all relative group flex flex-col justify-between ${
                      event.aiMatchScore > 85
                        ? "md:col-span-2 border-blue-500/20"
                        : "col-span-1"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">
                          {Math.round(event.aiMatchScore)}% Match
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={
                                selectedRating[event._id] >= star
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-neutral-700 hover:text-yellow-500 transition-colors"
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRating({
                                  ...selectedRating,
                                  [event._id]: star,
                                });
                                // rateEvent(event._id, star);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <h4
                        className={`font-bold text-white mb-2 ${
                          event.aiMatchScore > 85 ? "text-xl" : "text-md"
                        }`}
                      >
                        {event.title}
                      </h4>
                      <p className="text-xs text-neutral-500 line-clamp-2 mb-6">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
                      <button className="text-[10px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors">
                        <Heart size={12} /> Save
                      </button>
                      <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: MESSAGES & TIMETABLE STACK */}
          <div className="flex flex-col gap-3">
            {/* MESSAGES BENTO BOX */}
            <motion.div
              whileHover={{ backgroundColor: "#0F0F0F" }}
              className="bg-[#0D0D0D] border border-white/5 rounded-[10px] p-7"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-500" /> Faculty
                  Messages
                </h3>
                <span className="bg-blue-500/10 text-blue-500 text-[9px] px-2 py-0.5 rounded font-black">
                  2 NEW
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    sender: "Dr. Kamali",
                    role: "HoD",
                    text: "Please review the updated syllabus.",
                  },
                  {
                    sender: "Prof. Agnes",
                    role: "Lecturer",
                    text: "Lab 2 is reserved for your class today.",
                  },
                ].map((msg, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#141414] border border-white/5 rounded-[10px] hover:border-blue-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{msg.sender}</span>
                      <span className="text-[8px] font-black text-neutral-600 uppercase">
                        {msg.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 italic">
                      "{msg.text}"
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">
                Open All Messages
              </button>
            </motion.div>

            {/* TIMETABLE BOX */}
            <div className="bg-[#0D0D0D] border border-white/5 rounded-[10px] p-7 flex-1">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Clock size={16} className="text-emerald-500" /> Today's Class
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    time: "08:00",
                    subject: "Advanced Programming",
                    room: "Lab 2",
                  },
                  { time: "11:00", subject: "Cybersecurity", room: "Hall 4" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-center p-4 bg-[#141414] rounded-[10px] border border-white/5"
                  >
                    <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                      {item.time}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{item.subject}</span>
                      <span className="text-[10px] text-neutral-600 uppercase font-bold">
                        {item.room}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, color, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: "#0F0F0F" }}
      className="bg-[#0D0D0D] p-7 rounded-[10px] border border-white/5 transition-all shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-white font-black text-xs uppercase tracking-widest opacity-60">
          {title}
        </p>
        <div className={color}>{icon}</div>
      </div>
      <h2 className={`text-4xl font-bold tracking-tighter ${color} mb-4`}>
        {value}
      </h2>
      <div className="bg-white/5 text-[9px] font-bold px-2 py-1 rounded-md text-neutral-400 border border-white/5 w-fit">
        {change}
      </div>
    </motion.div>
  );
}
