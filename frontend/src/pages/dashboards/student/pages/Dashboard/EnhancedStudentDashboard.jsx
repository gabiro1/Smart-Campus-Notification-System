import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Sparkles,
  Star,
  ArrowRight,
  Clock,
  Zap,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

// Existing custom components and helpers
import Toast from "../../../../../components/ui/Toast";
import StudentNav from "../../component/StudentNav";
import api from "../../../../../services/apiClient";
import { MOCK } from "./Data/data";

// --- FALLBACK DATA ---
const fallbackEvents = [
  {
    _id: "fb1",
    title: "URGENT: Advanced Programming Venue Change",
    description:
      "Due to network maintenance in Hall 4, today's session for Level 4 IT has been relocated to Computer Lab 2.",
    date: new Date().toISOString(),
    matchScore: 98,
    interested: false,
  },
  {
    _id: "fb2",
    title: "Campus-Wide Wi-Fi Upgrade",
    description:
      "The IT Directorate will be upgrading core routers across the CST campus this weekend. Expect outages.",
    date: new Date().toISOString(),
    matchScore: 82,
    interested: false,
  },
];

export default function StudentDashboard() {
  // --- STATE ---
  const [token] = useState("auto-logged-in-token");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // UI State
  const [searchQ, setSearchQ] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [selectedRating, setSelectedRating] = useState({});

  // --- Toast Logic ---
  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // --- API Calls ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/events/feed", {}, token);
      setEvents(data.events || data.data || data || MOCK.events);
    } catch {
      setEvents(MOCK.events || fallbackEvents);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- Actions ---
const rateEvent = async (ev, score) => {
  setSelectedRating({ ...selectedRating, [ev._id]: score });
  try {
    await api(
      `/events/${ev._id}/rate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: score }),
      },
      token,
    );
    addToast("Rating submitted!", "success");
  } catch {
    // Error handling
  }
};

  // Save / Toggle Interest logic
  const toggleInterest = async (ev) => {
    setEvents((prev) =>
      prev.map((x) =>
        x._id === ev._id ? { ...x, interested: !x.interested } : x,
      ),
    );

    addToast(
      ev.interested ? "Removed from saved events" : "Event saved!",
      ev.interested ? "info" : "success",
    );

    try {
      await api(`/events/${ev._id}/interest`, { method: "POST" }, token);
    } catch {
      // Revert if API fails
    }
  };

  // --- Filtering Logic ---
  const filteredEvents = events.filter((e) => {
    const q = searchQ.toLowerCase();
    const matchQ =
      !q ||
      e.title?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q);

    const matchF =
      eventFilter === "all" ||
      (eventFilter === "interested" && e.interested) ||
      (eventFilter === "top" && (e.matchScore >= 80 || e.aiMatchScore >= 80));

    return matchQ && matchF;
  });

  const displayEvents = filteredEvents;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <StudentNav />

      <main className="flex-1 ml-[280px] p-8 min-h-screen overflow-y-auto">
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
            <div className="bg-white/5 px-4 py-2 rounded-[7px] border border-white/10 flex items-center gap-2">
              <Zap size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase text-neutral-300 tracking-wider">
                AI Synced
              </span>
            </div>
          </div>
        </header>

        <div className="flex items-center mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search announcements, tags, or lecturers..."
              className="w-full bg-[#111111] border border-white/10 rounded-[7px] py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600 text-white"
            />
          </div>
          <button
            onClick={() =>
              setEventFilter(eventFilter === "all" ? "top" : "all")
            }
            className={`border px-4 py-2.5 rounded-[7px] text-xs font-bold flex items-center gap-2 transition-colors ${
              eventFilter === "top"
                ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                : "bg-[#111111] border-white/5 text-neutral-300 hover:border-white/20"
            }`}
          >
            <Filter size={14} />{" "}
            {eventFilter === "top"
              ? "Showing Top Matches"
              : "Filter Top Matches"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <StatCard
            title="Relevant Pulses"
            value={filteredEvents.length}
            change="Based on search/filters"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pb-10">
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
              {loading ? (
                <div className="col-span-full flex items-center gap-2 text-neutral-600 text-sm italic py-10">
                  <Zap size={16} className="animate-pulse text-blue-500" />{" "}
                  Syncing data...
                </div>
              ) : displayEvents.length === 0 ? (
                <div className="col-span-full text-center py-10 text-neutral-500 text-sm">
                  No events found matching your search.
                </div>
              ) : (
                displayEvents.map((event) => {
                  const matchScore = Math.round(
                    event.matchScore || event.aiMatchScore || 85,
                  );
                  const isHighMatch = matchScore >= 85;

                  return (
                    <motion.div
                      key={event._id}
                      whileHover={{ y: -2, backgroundColor: "#121212" }}
                      className={`p-6 rounded-[15px] border transition-all relative group flex flex-col justify-between ${
                        isHighMatch
                          ? "bg-[#141414] border-blue-500/20 md:col-span-2 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                          : "bg-[#111111] border-white/5 col-span-1"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                              isHighMatch
                                ? "text-blue-400 bg-blue-500/10"
                                : "text-neutral-400 bg-white/5"
                            }`}
                          >
                            {matchScore}% Match
                          </span>

                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const currentRating =
                                selectedRating[event._id] ||
                                event.averageRating ||
                                0;
                              return (
                                <Star
                                  key={star}
                                  size={12}
                                  className={`cursor-pointer transition-colors ${
                                    currentRating >= star
                                      ? "fill-yellow-500 text-yellow-500"
                                      : "text-neutral-700 hover:text-yellow-500"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    rateEvent(event, star);
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>

                        <h4
                          className={`font-bold text-white mb-2 ${isHighMatch ? "text-xl" : "text-md"}`}
                        >
                          {event.title}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-2 mb-6 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
                        {/* --- NEW BOOKMARK BUTTON --- */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleInterest(event);
                          }}
                          className={`text-[10px] font-bold flex items-center gap-1.5 transition-all duration-200 ${
                            event.interested
                              ? "text-red-400"
                              : "text-neutral-500 hover:text-red-400"
                          }`}
                        >
                          {event.interested ? (
                            <BookmarkCheck size={14} />
                          ) : (
                            <Bookmark size={14} />
                          )}
                          {event.interested ? "Saved" : "Save"}
                        </button>

                        <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors text-neutral-400 hover:text-white">
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
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
                      <span className="text-xs font-bold text-neutral-200">
                        {msg.sender}
                      </span>
                      <span className="text-[8px] font-black text-neutral-500 uppercase">
                        {msg.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 italic">
                      "{msg.text}"
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-[10px] font-bold text-neutral-600 hover:text-white transition-colors">
                Open All Messages
              </button>
            </motion.div>

            <div className="bg-[#0D0D0D] border border-white/5 rounded-[10px] p-7 flex-1">
              <div className="flex items-center justify-between mb-6">
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
                    <div className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      {item.time}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-200">
                        {item.subject}
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold mt-0.5">
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

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function StatCard({ title, value, change, color, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: "#0F0F0F" }}
      className="bg-[#0D0D0D] p-6 rounded-[10px] border border-white/5 transition-all shadow-sm flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-white font-black text-[10px] uppercase tracking-widest opacity-60">
          {title}
        </p>
        {icon && <div className={color}>{icon}</div>}
      </div>
      <h2 className={`text-4xl font-bold tracking-tighter ${color} mb-3`}>
        {value}
      </h2>
      <div className="bg-white/5 text-[9px] font-bold px-2 py-1 rounded text-neutral-400 border border-white/5 w-fit uppercase tracking-wide">
        {change}
      </div>
    </motion.div>
  );
}
