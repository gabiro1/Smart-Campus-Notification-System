import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  Eye,
  AlertCircle,
  QrCode,
  Filter,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

// --- SYSTEM IMPORTS ---
import { useAuth } from "../../../../../context/AuthContext";
import eventService from "../../../../../services/eventService";
import dashboardService from "../../../../../services/dashboardService";
import apiClient from "../../../../../services/apiClient";
import toast from "react-hot-toast";

export default function EnhancedStudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data State
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    aiMatchAvg: 0,
    savedCount: 0,
    campusPulse: 0, // Added to ensure it exists in initial state
  });
  const [schedule, setSchedule] = useState([]);
  const [messages, setMessages] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- DATA FETCHING ENGINE (BULLETPROOFED) ---
  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    // 1. Fetch Summary Data (Announcements & Stats) FIRST
    try {
      const summaryData = await dashboardService.getStudentSummary();
      if (summaryData && summaryData.success) {
        setStats(
          summaryData.stats || {
            attendanceRate: 0,
            aiMatchAvg: 0,
            savedCount: 0,
            campusPulse: 0,
          },
        );
        setSchedule(summaryData.schedule || []);
        setMessages(summaryData.messages || []);
      }
    } catch (error) {
      console.error("Failed to load Student Summary:", error);
      toast.error("Could not load your announcements.");
    }

    // 2. Fetch Events Feed SEPARATELY (Decoupled so it doesn't break the whole page)
    try {
      const feedData = await eventService.getFeed();
      console.log('[Dashboard] Events received:', feedData?.length || 0);
      
      // If AI feed is empty, try fetching all approved events
      if (!feedData || feedData.length === 0) {
        try {
          const allEventsResponse = await apiClient.get('/events');
          const allEvents = allEventsResponse.data?.events || allEventsResponse.data || [];
          console.log('[Dashboard] Fallback - All events:', allEvents.length);
          setEvents(allEvents);
        } catch (fallbackError) {
          console.log('[Dashboard] Fallback also failed:', fallbackError);
          setEvents([]);
        }
      } else {
        setEvents(feedData);
      }
    } catch (error) {
      console.error("Failed to load Events Feed:", error);
      // Try fallback
      try {
        const allEventsResponse = await apiClient.get('/events');
        const allEvents = allEventsResponse.data?.events || allEventsResponse.data || [];
        setEvents(allEvents);
      } catch (e) {
        setEvents([]);
      }
    }

    setLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
    // OPTIONAL: Auto-refresh every 5 mins to keep "Live" status accurate
    const interval = setInterval(() => loadDashboardData(true), 300000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Handle Attendance Log Action
  const handleCheckIn = async (eventId) => {
    try {
      await dashboardService.logAttendance(eventId);
      toast.success("Attendance verified!");
      loadDashboardData(true); // Refresh stats
    } catch (err) {
      toast.error("Check-in failed. Are you in the correct location?");
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background text-white flex font-sans overflow-x-hidden">
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 1. HEADER: Dynamic Context */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2 mt-2">
                Hey {user?.name?.split(" ")[0] || "Student"},
              </h1>
              <p className="text-neutral-400 text-sm max-w-md">
                Here's what's happening on campus today.
              </p>
            </div>

            <button
              onClick={() => {
                setIsRefreshing(true);
                loadDashboardData(true);
              }}
              className={`bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-500/20 flex items-center gap-2 hover:bg-blue-600/20 transition-all ${isRefreshing ? "animate-pulse" : ""}`}
            >
              <Zap
                size={16}
                className={isRefreshing ? "text-white" : "text-blue-500"}
              />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">
                {isRefreshing ? "Syncing..." : "Real-Time Active"}
              </span>
            </button>
          </header>

          {/* Action Row: Search */}
          <div className="flex items-center mb-2 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600"
                size={16}
              />
              <input
                type="text"
                placeholder="Search events, announcements, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/student/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="w-full bg-background border border-white/10 rounded-[7px] py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-800"
              />
            </div>
            <button className="bg-background border border-white/5 px-4 py-2.5 rounded-[7px] text-xs font-bold text-neutral-300 flex items-center gap-2 hover:border-white/20">
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* 2. URGENT NOTIFICATIONS */}
          <AnimatePresence>
            {events
              .filter((e) => e.isUrgent)
              .map((urgentEvent) => (
                <motion.div
                  key={urgentEvent._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/30 p-5 rounded-3xl flex items-center gap-5"
                >
                  <div className="bg-red-500 p-3 rounded-2xl">
                    <AlertCircle size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">
                      Critical Action Required
                    </h4>
                    <p className="text-md text-white font-bold">
                      {urgentEvent.title}
                    </p>
                    <p className="text-sm text-red-200/60 font-medium">
                      {urgentEvent.location}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckIn(urgentEvent._id)}
                    className="bg-white text-black text-xs font-black px-6 py-3 rounded-2xl hover:scale-105 transition-transform"
                  >
                    ACKNOWLEDGE
                  </button>
                </motion.div>
              ))}
          </AnimatePresence>

          {/* 3. CORE ANALYTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Campus Pulse"
              value={stats.campusPulse || 0} // ✅ Mapped directly to your backend calculation!
              icon={Zap}
              trend="Live announcements"
              color="text-blue-500"
            />
            <StatCard
              label="Attendance"
              value={`${stats.attendanceRate || 0}%`}
              icon={CheckCircle2}
              trend="Verified presence"
              color="text-emerald-500"
            />
            <StatCard
              label="AI Relevance"
              value={`${stats.aiMatchAvg || 85}%`}
              icon={Eye}
              trend="Match accuracy"
              color="text-purple-500"
            />
            <StatCard
              label="Saved"
              value={stats.savedCount || 0}
              icon={Bookmark}
              trend="Watchlist"
              color="text-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 4. RECOMMENDATION ENGINE */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <Sparkles size={20} className="text-blue-500" /> Intelligence
                  Feed
                </h3>
                <button className="text-xs font-bold text-neutral-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg hover:text-white transition-colors">
                  This Week ▾
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {events.length > 0 ? (
                  events.map((event) => (
                    <EventItem key={event._id} event={event} />
                  ))
                ) : (
                  <div className="bg-card border border-white/5 p-20 rounded-[32px] text-center">
                    <p className="text-neutral-600 text-sm italic">
                      The campus is currently quiet. AI is scanning for
                      updates...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. SIDEBAR: CONTEXTUAL DATA */}
            <div className="space-y-6">
              <GlassCard 
                title="Broadcasts" 
                icon={MessageSquare}
                action={
                  <button onClick={() => navigate('/student/announcements')} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">
                    See all →
                  </button>
                }
              >
                <div className="space-y-3">
                  {messages.length > 0 ? (
                    messages.map((m, i) => (
                      <MessageItem
                        key={i}
                        sender={m.sender}
                        role={m.role}
                        title={m.title} // ✅ Fixed: Actually passing the title now
                        text={m.text}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-4">
                      No recent broadcasts.
                    </p>
                  )}
                </div>
              </GlassCard>

              <GlassCard title="Today's Schedule" icon={Clock}>
                <div className="space-y-3">
                  {schedule.length > 0 ? (
                    schedule.map((s, i) => (
                      <ScheduleItem
                        key={i}
                        time={s.time}
                        subject={s.subject}
                        room={s.room}
                      />
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-black">
                        No Lectures Slated
                      </p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => navigate('/student/timetable')}
                  className="w-full mt-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                >
                  View Full Timetable
                </button>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- REUSABLE ATOMIC COMPONENTS ---

function StatCard({ label, value, trend, icon: Icon, color }) {
  return (
    <div className="bg-card p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all cursor-pointer group flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <Icon size={12} className={color} /> {label}
          </span>
          <button className="text-neutral-500 group-hover:text-white transition-colors">
            <ArrowUpRight size={16} />
          </button>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{value}</h2>
      </div>
      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-2">
        <TrendingUp size={12} className={color} /> {trend}
      </p>
    </div>
  );
}

function GlassCard({ children, title, icon: Icon, action }) {
  return (
    <div className="bg-card border border-white/5 rounded-[32px] p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-blue-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EventItem({ event }) {
  const match = Math.round(event.aiMatchScore || 85);
  
  let borderColor = "border-l-blue-500/40";
  if (event.isUrgent || event.priority === 'urgent' || event.priority === 'high') {
    borderColor = "border-l-red-500";
  } else if (event.priority === 'medium') {
    borderColor = "border-l-amber-400";
  } else if (event.priority === 'low') {
    borderColor = "border-l-emerald-400";
  }

  return (
    <div className={`p-5 rounded-[28px] bg-card border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4 group border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
            {match}% AI Match
          </span>
        </div>
        <button className="p-2 bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-colors">
          <Bookmark size={16} />
        </button>
      </div>
      <div>
        <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors mb-1">
          {event.title}
        </h4>
        <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">
          {event.description || "No description available."}
        </p>
      </div>
      <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1.5 uppercase">
            <Clock size={12} /> {event.time || "10:00 AM"}
          </span>
          <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1.5 uppercase">
            <ArrowRight size={12} /> {event.location || "Auditorium"}
          </span>
        </div>
        <button className="text-[10px] font-black text-white bg-blue-600/20 px-4 py-2 rounded-xl border border-blue-500/20 hover:bg-blue-600 transition-all">
          DETAILS
        </button>
      </div>
    </div>
  );
}

// ✅ FIXED: Now accepts and renders the title
function MessageItem({ sender, role, title, text }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-bold text-white tracking-tight">
          {sender}
        </span>
        <span className="text-[8px] font-black text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">
          {role}
        </span>
      </div>
      {title && (
        <h4 className="text-sm font-bold text-white mb-1 leading-tight">
          {title}
        </h4>
      )}
      <p className="text-[11px] text-neutral-500 line-clamp-2 italic leading-relaxed">
        "{text}"
      </p>
    </div>
  );
}

function ScheduleItem({ time, subject, room }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
      <div className="text-[10px] font-black text-blue-500 w-10 shrink-0">
        {time}
      </div>
      <div>
        <p className="text-[11px] font-bold text-white">{subject}</p>
        <p className="text-[9px] text-neutral-500 uppercase font-black mt-0.5 tracking-widest">
          {room}
        </p>
      </div>
    </div>
  );
}

// Loading Skeleton UI
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8 animate-pulse">
      <div className="h-20 w-1/3 bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/5 rounded-[32px]" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-[600px] bg-white/5 rounded-[32px]" />
        <div className="h-[600px] bg-white/5 rounded-[32px]" />
      </div>
    </div>
  );
}
