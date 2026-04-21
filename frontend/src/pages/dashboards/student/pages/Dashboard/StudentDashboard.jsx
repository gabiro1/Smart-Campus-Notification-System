/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Bookmark,
  Calendar,
  MapPin,
  ChevronRight,
  Activity,
  CheckCircle2,
  Target,
} from "lucide-react";

import { useAuth } from "../../../../context/AuthContext";
import eventService from "../../../../services/eventService";
import dashboardService from "../../../../services/dashboardService";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.3 },
  }),
};

const fallbackEvents = [
  {
    _id: "fb1",
    title: "Advanced Programming Lecture",
    description: "Session on advanced algorithms and data structures for Level 4 IT students.",
    date: new Date(Date.now() + 86400000).toISOString(),
    time: "09:00",
    location: "Lab 2",
    priority: "high",
    aiMatchScore: 98,
  },
  {
    _id: "fb2",
    title: "Guest Lecture: AI in Agriculture",
    description: "Seminar discussing how AI models predict farming risks.",
    date: new Date(Date.now() + 172800000).toISOString(),
    time: "14:00",
    location: "Hall 4",
    priority: "medium",
    aiMatchScore: 95,
  },
  {
    _id: "fb3",
    title: "Campus Networking Event",
    description: "Meet industry professionals and expand your network.",
    date: new Date(Date.now() + 259200000).toISOString(),
    time: "10:00",
    location: "Student Center",
    priority: "low",
    aiMatchScore: 78,
  },
  {
    _id: "fb4",
    title: "Cybersecurity Workshop",
    description: "Hands-on workshop on ethical hacking and network security.",
    date: new Date(Date.now() + 345600000).toISOString(),
    time: "13:00",
    location: "Lab 3",
    priority: "high",
    aiMatchScore: 88,
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    aiMatchAvg: 0,
    savedCount: 0,
    campusPulse: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recommended");
  const [bookmarked, setBookmarked] = useState([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const summaryData = await dashboardService.getStudentSummary();
      if (summaryData?.success) {
        setStats(summaryData.stats || { attendanceRate: 0, aiMatchAvg: 0, savedCount: 0, campusPulse: 0 });
      }
    } catch (err) {
      console.error("Failed to load summary:", err);
    }

    try {
      const feedData = await eventService.getFeed();
      setEvents(feedData?.length > 0 ? feedData : fallbackEvents);
    } catch (err) {
      setEvents(fallbackEvents);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const filteredEvents = React.useMemo(() => {
    const now = new Date();
    if (activeTab === "recommended") return events.filter(e => (e.aiMatchScore || 0) >= 80);
    if (activeTab === "upcoming") return events.filter(e => new Date(e.date) > now);
    return events;
  }, [events, activeTab]);

  const toggleBookmark = (id) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">
                {getGreeting()}, <span className="text-primary">{user?.name?.split(" ")[0] || "Student"}</span>
              </h1>
            </div>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <StatCard index={0} label="Campus Pulse" value={stats.campusPulse || events.length} subtitle="Active events" icon={Activity} color="blue" />
            <StatCard index={1} label="Attendance" value={`${stats.attendanceRate || 94}%`} subtitle="This semester" icon={CheckCircle2} color="emerald" />
            <StatCard index={2} label="AI Relevance" value={`${stats.aiMatchAvg || 85}%`} subtitle="Personalized" icon={Target} color="violet" />
            <StatCard index={3} label="Saved" value={stats.savedCount || 0} subtitle="Bookmarks" icon={Bookmark} color="amber" />
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Recommended Events
            </h3>
            <div className="flex gap-1 p-1 rounded-xl bg-card border border-border">
              {['recommended', 'upcoming', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, i) => (
                <EventCard
                  key={event._id || i}
                  event={event}
                  index={i}
                  isBookmarked={bookmarked.includes(event._id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))
            ) : (
              <div className="bg-card border border-border p-12 rounded-2xl text-center">
                <Sparkles size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No events found.</p>
              </div>
            )}
          </div>

          {events.length > 5 && (
            <button onClick={() => navigate('/student/events')} className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2">
              View all events <ChevronRight size={16} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ index, label, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-500" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-card border border-border rounded-2xl p-4 hover:border-border hover:shadow-md transition-all"
    >
      <div className={`p-2 rounded-xl ${c.bg} w-fit mb-3`}>
        <Icon size={18} className={c.text} />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{value}</h2>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}

function EventCard({ event, index, isBookmarked, onToggleBookmark }) {
  const navigate = useNavigate();
  const match = Math.round(event.aiMatchScore || 85);
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const priorityConfig = {
    urgent: { border: "border-l-red-500", badge: "bg-red-500", badgeText: "text-white" },
    high: { border: "border-l-orange-500", badge: "bg-orange-500", badgeText: "text-white" },
    medium: { border: "border-l-amber-400", badge: "bg-amber-400", badgeText: "text-amber-950" },
    low: { border: "border-l-emerald-400", badge: "bg-emerald-400", badgeText: "text-emerald-950" },
  };
  const priority = priorityConfig[event.priority] || priorityConfig.default;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all border-l-4 ${priority.border} group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1">
          {event.priority === 'urgent' && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priority.badge} ${priority.badgeText}`}>
              Urgent
            </span>
          )}
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Sparkles size={12} className="text-violet-500" /> {match}% Match
          </span>
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            <Calendar size={12} /> {formattedDate}
            {event.time && <> • {event.time}</>}
          </span>
        </div>
        <button
          onClick={() => onToggleBookmark(event._id)}
          className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
        >
          <Bookmark size={16} className={isBookmarked ? "fill-current" : ""} />
        </button>
      </div>

      <h4 className="font-semibold text-base text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-1">
        {event.title}
      </h4>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
        {event.description}
      </p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin size={12} /> {event.location || "TBD"}
        </span>
        <button
          onClick={() => navigate(`/student/events/${event._id}`)}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
        >
          Details <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-48 bg-muted rounded" />
          <div className="h-10 w-72 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-card border border-border rounded-2xl p-4" />)}
        </div>
        <div className="h-8 w-64 bg-muted rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-card border border-border rounded-xl p-4" />)}
        </div>
      </div>
    </div>
  );
}