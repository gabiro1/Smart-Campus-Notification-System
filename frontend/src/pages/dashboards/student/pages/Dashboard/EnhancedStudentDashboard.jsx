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
  Megaphone,
  CheckCircle2,
  Eye,
  Users,
} from "lucide-react";

// Existing custom components and helpers
import Toast from "../../../../../components/ui/Toast";
import StudentNav from "../../component/StudentNav";
import api from "../../../../../services/apiClient";

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

  // --- API Calls (STRICTLY BACKEND DATA) ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/events/feed", {}, token);
      // Strictly use data from the backend
      setEvents(data.events || data.data || data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setEvents([]); // No static fallbacks. It will show empty state.
      addToast("Failed to load events from the server.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, addToast]);

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
      addToast("Failed to submit rating.", "error");
    }
  };

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
      setEvents((prev) =>
        prev.map((x) =>
          x._id === ev._id ? { ...x, interested: !x.interested } : x,
        ),
      );
      addToast("Failed to save event.", "error");
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

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans overflow-x-hidden">
      <StudentNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 min-h-screen overflow-y-auto">
        {/* Main Wrapper matching the new design */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 tracking-widest mb-1">
                <span>STUDENT</span>
                <span>/</span>
                <span className="text-white uppercase">Personal Pulse</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                Academic Dashboard
              </h1>
              <p className="text-neutral-400 text-sm">
                Track your announcements, classes, and engagement.
              </p>
            </div>
            <div className="bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 w-full sm:w-auto justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Zap size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-neutral-200">
                AI Synced
              </span>
            </div>
          </header>

          {/* STATS GRID (Updated to 4 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              label="Relevant Pulses"
              value={filteredEvents.length}
              icon={Sparkles}
              trend="Based on filters"
            />
            <StatCard
              label="Attendance Rate"
              value="94%"
              icon={CheckCircle2}
              trend="L4 IT Avg"
            />
            <StatCard
              label="AI Match Accuracy"
              value="98.2%"
              icon={Eye}
              trend="Based on clicks"
            />
            <StatCard
              label="Saved Events"
              value={events.filter((e) => e.interested).length}
              icon={Bookmark}
              trend="Your Watchlist"
            />
          </div>

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
            {/* LEFT SIDE (Span 2): Feed & Search */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search & Filters */}
              <GlassCard className="!p-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                      size={16}
                    />
                    <input
                      type="text"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      placeholder="Search announcements or tags..."
                      className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600 text-white"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setEventFilter(eventFilter === "all" ? "top" : "all")
                    }
                    className={`border px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all w-full md:w-auto ${
                      eventFilter === "top"
                        ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                        : "bg-[#111111] border-white/5 text-neutral-300 hover:border-white/20"
                    }`}
                  >
                    <Filter size={16} />
                    {eventFilter === "top" ? "Top Matches" : "Filter Top"}
                  </button>
                </div>
              </GlassCard>

              {/* Event Feed */}
              <GlassCard className="min-h-[400px] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Recommended for You
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      AI-ranked pulses from your department
                    </p>
                  </div>
                  <span className="text-[10px] bg-blue-600/20 text-blue-500 px-2 py-1 rounded font-black tracking-widest uppercase">
                    AI Active
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 flex-1">
                  {loading ? (
                    <div className="flex items-center justify-center h-full gap-2 text-neutral-600 text-sm italic py-10">
                      <Zap size={16} className="animate-pulse text-blue-500" />
                      Fetching real-time data...
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm py-10">
                      No events found from the server.
                    </div>
                  ) : (
                    filteredEvents.map((event) => {
                      const matchScore = Math.round(
                        event.matchScore || event.aiMatchScore || 85,
                      );
                      const isHighMatch = matchScore >= 85;

                      return (
                        <motion.div
                          key={event._id}
                          whileHover={{ y: -2 }}
                          className={`p-5 rounded-xl border transition-all relative group flex flex-col ${
                            isHighMatch
                              ? "bg-white/[0.03] border-blue-500/20 hover:border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.03)]"
                              : "bg-white/[0.01] border-white/5 hover:border-white/10"
                          }`}
                        >
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
                                    size={14}
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

                          <h4 className="font-semibold text-white mb-2 text-lg">
                            {event.title}
                          </h4>
                          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                            {event.description}
                          </p>

                          <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleInterest(event);
                              }}
                              className={`text-sm font-semibold flex items-center gap-2 transition-all ${
                                event.interested
                                  ? "text-red-400"
                                  : "text-neutral-500 hover:text-red-400"
                              }`}
                            >
                              {event.interested ? (
                                <BookmarkCheck size={16} />
                              ) : (
                                <Bookmark size={16} />
                              )}
                              {event.interested ? "Saved" : "Save"}
                            </button>

                            <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors text-neutral-400 hover:text-white">
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </GlassCard>
            </div>

            {/* RIGHT SIDE (Span 1): Sidebar Activity */}
            <div className="space-y-6">
              {/* Messages */}
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-500" />
                    Messages
                  </h3>
                  <span className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                    View All
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      sender: "Dr. Kamali",
                      role: "HoD",
                      text: "Please review the syllabus.",
                    },
                    {
                      sender: "Prof. Agnes",
                      role: "Lecturer",
                      text: "Lab 2 is reserved today.",
                    },
                  ].map((msg, i) => (
                    <div
                      key={i}
                      className="group p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
                          {msg.sender}
                        </span>
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                          {msg.role}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        "{msg.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Schedule */}
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock size={18} className="text-emerald-500" />
                    Today's Class
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      time: "08:00",
                      subject: "Advanced Programming",
                      room: "Lab 2",
                    },
                    { time: "11:00", subject: "Data Science", room: "Hall 4" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-center p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all"
                    >
                      <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <div>
                        <p className="text-sm text-neutral-200 font-medium transition-colors">
                          {item.subject}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {item.time} • {item.room}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

// --- HELPER COMPONENTS (Inline to match your new styling) ---

function StatCard({ label, value, trend, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-[#0D0D0D] p-6 rounded-2xl border border-white/5 transition-all shadow-sm flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-neutral-400 font-medium text-sm">{label}</p>
        {Icon && (
          <div className="p-2 bg-white/5 rounded-lg text-neutral-300">
            <Icon size={18} />
          </div>
        )}
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">{value}</h2>
      <div className="text-xs font-medium text-neutral-500">{trend}</div>
    </motion.div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-[#0D0D0D] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-sm ${className}`}
    >
      {/* Very subtle glow effect in the corner to match the premium feel */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      {children}
    </motion.div>
  );
}
