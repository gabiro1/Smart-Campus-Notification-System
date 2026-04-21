import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Clock,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  MapPin,
  ChevronRight,
  Activity,
  BookOpen,
  Target,
  Moon,
  Sun,
} from "lucide-react";

import { useAuth } from "../../../../../context/AuthContext";
import { useTheme } from "../../../../../context/ThemeContext";
import eventService from "../../../../../services/eventService";
import dashboardService from "../../../../../services/dashboardService";
import apiClient from "../../../../../services/apiClient";
import toast from "react-hot-toast";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

export default function EnhancedStudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    aiMatchAvg: 0,
    savedCount: 0,
    campusPulse: 0,
  });
  const [schedule, setSchedule] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("recommended");

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const summaryData = await dashboardService.getStudentSummary();
      if (summaryData && summaryData.success) {
        setStats(
          summaryData.stats || {
            attendanceRate: 0,
            aiMatchAvg: 0,
            savedCount: 0,
            campusPulse: 0,
          }
        );
        setSchedule(summaryData.schedule || []);
        setMessages(summaryData.messages || []);
      }
    } catch (error) {
      console.error("Failed to load Student Summary:", error);
      toast.error("Could not load your announcements.");
    }

    try {
      const feedData = await eventService.getFeed();
      
      if (!feedData || feedData.length === 0) {
        try {
          const allEventsResponse = await apiClient.get('/events');
          const allEvents = allEventsResponse.data?.events || allEventsResponse.data || [];
          setEvents(allEvents);
        } catch (fallbackError) {
          setEvents([]);
        }
      } else {
        setEvents(feedData);
      }
    } catch (error) {
      console.error("Failed to load Events Feed:", error);
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
    const interval = setInterval(() => loadDashboardData(true), 300000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const handleCheckIn = async (eventId) => {
    try {
      await dashboardService.logAttendance(eventId);
      toast.success("Attendance verified!");
      loadDashboardData(true);
    } catch (err) {
      toast.error("Check-in failed. Are you in the correct location?");
    }
  };

  const filteredEvents = React.useMemo(() => {
    const now = new Date();
    if (activeTab === "recommended") return events.slice(0, 5);
    if (activeTab === "upcoming") {
      return events.filter(e => {
        const eventDate = e.date ? new Date(e.date) : new Date(e.startTime);
        return eventDate >= now;
      }).slice(0, 5);
    }
    return events.slice(0, 5);
  }, [events, activeTab]);

  if (loading) return <DashboardSkeleton />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {getGreeting()}, <span className="text-primary">{user?.name?.split(" ")[0] || "Student"}</span>
              </h1>
<p className="text-muted-foreground text-sm lg:text-base max-w-lg">
                Here's your personalized campus overview. Stay updated with events, announcements, and your schedule.
              </p>
            </div>

          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              index={0}
              label="Campus Pulse"
              value={stats.campusPulse || 0}
              subtitle="Active events"
              icon={Activity}
              trendValue={12}
              color="blue"
            />
            <StatCard
              index={1}
              label="Attendance"
              value={`${stats.attendanceRate || 0}%`}
              subtitle="This semester"
              icon={CheckCircle2}
              trendValue={5}
              color="emerald"
            />
            <StatCard
              index={2}
              label="AI Relevance"
              value={`${stats.aiMatchAvg || 85}%`}
              subtitle="Personalized match"
              icon={Target}
              trendValue={3}
              color="violet"
            />
            <StatCard
              index={3}
              label="Saved Events"
              value={stats.savedCount || 0}
              subtitle="Watchlist"
              icon={Bookmark}
              trendValue={0}
              color="amber"
            />
          </div>

          {/* Urgent Alert Banner */}
          <AnimatePresence>
            {events.filter((e) => e.isUrgent).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {events
                  .filter((e) => e.isUrgent)
                  .map((urgentEvent) => (
                    <motion.div
                      key={urgentEvent._id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-5 rounded-2xl flex items-center gap-5"
                    >
                      <div className="bg-red-500 p-3 rounded-xl">
                        <AlertCircle size={22} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-0.5">
                          Urgent Announcement
                        </h4>
                        <p className="text-base font-semibold text-foreground">
                          {urgentEvent.title}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {urgentEvent.location}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCheckIn(urgentEvent._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
                      >
                        Acknowledge
                      </button>
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Events Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" /> 
                  Recommended Events
                </h3>
                <div className="w-full overflow-x-auto">
  <div className="flex w-max gap-1 p-1 rounded-xl bg-black/40 border border-white/10 mx-2 sm:mx-4">
    {['recommended', 'upcoming', 'all'].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`relative flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium capitalize transition-colors whitespace-nowrap ${
          activeTab === tab
            ? "text-foreground"
            : "text-muted-foreground hover:text-white/80"
        }`}
      >
        {/* Animated active background */}
        {activeTab === tab && (
          <motion.div
            layoutId="tabs-highlight"
            className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        <span className="relative z-10">
          {tab}
        </span>
      </button>
    ))}
  </div>
</div>
              </div>

              <div className="space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event, i) => (
                    <EventCard key={event._id} event={event} index={i} />
                  ))
                ) : (
                  <div className="bg-card border border-border p-12 rounded-2xl text-center">
                    <Sparkles size={40} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No events found. Check back later!</p>
                  </div>
                )}
              </div>

              {events.length > 5 && (
                <button 
                  onClick={() => navigate('/student/events')}
                  className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2"
                >
                  View all events <ChevronRight size={16} />
                </button>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Schedule Card */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    Today's Schedule
                  </h3>
                  <button 
                    onClick={() => navigate('/student/timetable')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {schedule.length > 0 ? (
                    schedule.slice(0, 4).map((s, i) => (
                      <ScheduleItem key={i} time={s.time} subject={s.subject} room={s.room} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No classes scheduled for today.
                    </p>
                  )}
                </div>
              </div>

              {/* Announcements Card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
  
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-primary/10">
        <MessageSquare size={16} className="text-primary" />
      </div>
      <h3 className="font-semibold text-base text-foreground">
        Recent Broadcasts
      </h3>
    </div>

    <button 
      onClick={() => navigate('/student/announcements')}
      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      See all →
    </button>
  </div>

  {/* Content */}
  <div className="space-y-2">
    {messages.length > 0 ? (
      messages.slice(0, 3).map((m, i) => (
        <div
          key={i}
          className="group p-3 rounded-xl border border-transparent hover:border-border hover:bg-accent/50 transition-all cursor-pointer"
        >
          <AnnouncementItem
            sender={m.sender}
            role={m.role}
            title={m.title}
            text={m.text}
          />
        </div>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageSquare size={20} className="text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          No recent announcements
        </p>
      </div>
    )}
  </div>
</div>

              {/* Quick Actions */}
              <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
  <h3 className="font-semibold mb-3 text-foreground">
    Quick Actions
  </h3>

  <div className="grid grid-cols-2 gap-3">
    {[
      { label: "Search Events", path: "/student/search" },
      { label: "View Profile", path: "/student/profile" },
      { label: "Set Reminder", path: "/student/reminder" },
      { label: "My Summary", path: "/student/summary" },
    ].map((item) => (
      <button
        key={item.label}
        onClick={() => navigate(item.path)}
        className="p-3 rounded-xl text-sm font-medium text-left 
                   bg-muted hover:bg-accent 
                   text-foreground 
                   border border-border
                   transition-all duration-200"
      >
        {item.label}
      </button>
    ))}
  </div>
</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ index, label, value, subtitle, icon: Icon, trendValue, color }) {
  const colorClasses = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", trend: "text-blue-600" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", trend: "text-emerald-600" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-500", trend: "text-violet-600" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500", trend: "text-amber-600" },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-card border border-border rounded-2xl p-5 hover:border-border hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${colors.bg}`}>
          <Icon size={20} className={colors.text} />
        </div>
        {trendValue > 0 && (
          <span className={`flex items-center text-xs font-medium ${colors.trend}`}>
            <TrendingUp size={12} className="mr-1" /> +{trendValue}%
          </span>
        )}
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-1">{value}</h2>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
    </motion.div>
  );
}

function EventCard({ event, index }) {
  const match = Math.round(event.aiMatchScore || 85);
  
  const priorityConfig = {
    urgent: { border: "border-l-red-500", badge: "bg-red-500", badgeText: "text-white" },
    high: { border: "border-l-orange-500", badge: "bg-orange-500", badgeText: "text-white" },
    medium: { border: "border-l-amber-400", badge: "bg-amber-400", badgeText: "text-amber-950" },
    low: { border: "border-l-emerald-400", badge: "bg-emerald-400", badgeText: "text-emerald-950" },
    default: { border: "border-l-blue-500", badge: "bg-blue-500", badgeText: "text-white" },
  };
  
  const priority = priorityConfig[event.priority] || priorityConfig.default;
  const isUrgent = event.isUrgent || event.priority === 'urgent';

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-border transition-all duration-300 border-l-4 ${priority.border} group`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {isUrgent && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priority.badge} ${priority.badgeText}`}>
              Urgent
            </span>
          )}
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Sparkles size={12} className="text-violet-500" /> {match}% Match
          </span>
        </div>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bookmark size={16} />
        </button>
      </div>
      
      <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
        {event.title}
      </h4>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {event.description || "No description available."}
      </p>
      
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {event.date ? new Date(event.date).toLocaleDateString() : "Today"} • {event.time || "TBD"}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {event.location || "TBD"}
          </span>
        </div>
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

function ScheduleItem({ time, subject, room }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group">
      <div className="w-12 text-center shrink-0">
        <p className="text-xs font-bold text-muted-foreground">{time}</p>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{subject}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <BookOpen size={10} /> {room}
        </p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function AnnouncementItem({ sender, role, title, text }) {
  return (
    <div className="p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-xs font-semibold text-foreground">{sender}</span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
          {role}
        </span>
      </div>
      {title && (
        <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
          {title}
        </h4>
      )}
      <p className="text-xs text-muted-foreground line-clamp-2">
        {text}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-48 bg-muted rounded" />
          <div className="h-10 w-72 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-card border border-border rounded-2xl p-5" />
          ))}
        </div>
        
        <div className="h-12 bg-muted rounded-xl" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-card border border-border rounded-2xl p-5" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-card border border-border rounded-2xl p-5" />
            <div className="h-40 bg-card border border-border rounded-2xl p-5" />
            <div className="h-32 bg-primary rounded-2xl p-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
