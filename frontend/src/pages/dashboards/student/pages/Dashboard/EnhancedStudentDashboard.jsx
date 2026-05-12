import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Activity,
  GraduationCap,
  Bell,
  Check,
} from "lucide-react";

import { useAuth } from "../../../../../context/AuthContext";
import eventService from "../../../../../services/eventService";
import dashboardService from "../../../../../services/dashboardService";
import toast from "react-hot-toast";

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25 },
  }),
};

const fallbackEvents = [
  {
    _id: "fb1",
    title: "Advanced Programming Lecture",
    description: "Session on advanced algorithms and data structures for Level 4 IT students.",
    date: new Date(Date.now() + 3600000).toISOString(),
    time: "09:00",
    location: "Lab 2",
    priority: "high",
    type: "class",
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
    type: "event",
    aiMatchScore: 88,
  },
  {
    _id: "fb3",
    title: "Campus Networking Event",
    description: "Meet industry professionals and expand your network.",
    date: new Date(Date.now() + 259200000).toISOString(),
    time: "10:00",
    location: "Student Center",
    priority: "low",
    type: "event",
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
    type: "event",
    aiMatchScore: 85,
  },
];

const fallbackPriorities = {
  nextClass: {
    title: "Advanced Programming Lecture",
    time: "09:00",
    location: "Lab 2",
    minutesUntil: 45,
  },
  deadlines: [
    { id: 1, title: "AI Project Proposal", dueTime: "23:59", urgent: true },
    { id: 2, title: "Database Assignment", dueTime: "18:00", urgent: false },
  ],
  criticalAlerts: [
    { id: 1, message: "Low attendance warning for Data Structures", type: "warning" },
  ],
};

export default function EnhancedStudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState(fallbackEvents);
  const [stats, setStats] = useState({
    attendanceRate: 94,
    savedCount: 0,
    upcomingDeadlines: 2,
    newAnnouncements: 0,
    campusPulse: fallbackEvents.length,
  });
  const [schedule, setSchedule] = useState([]);
  const [messages, setMessages] = useState([]);
  const [priorities, setPriorities] = useState(fallbackPriorities);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("recommended");
  const [bookmarked, setBookmarked] = useState([]);

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsInitialLoad(true);

    try {
      const summaryData = await dashboardService.getStudentSummary();
      if (summaryData && summaryData.success) {
        setStats(prev => ({
          ...prev,
          ...(summaryData.stats || {}),
          campusPulse: summaryData.stats?.campusPulse || fallbackEvents.length,
        }));
        setSchedule(summaryData.schedule || []);
        setMessages(summaryData.messages || []);
        if (summaryData.priorities) {
          setPriorities(summaryData.priorities);
        }
      }
    } catch (error) {
      console.error("Failed to load Student Summary:", error);
    }

    try {
      const feedData = await eventService.getFeed();
      if (feedData && feedData.length > 0) {
        setEvents(feedData);
      }
    } catch (error) {
      console.error("Failed to load Events Feed:", error);
    }

    if (!silent) {
      setTimeout(() => setIsInitialLoad(false), 300);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => loadDashboardData(true), 300000);
    const onBookmarkChange = () => loadDashboardData(true);
    window.addEventListener('bookmark-changed', onBookmarkChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('bookmark-changed', onBookmarkChange);
    };
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
    let filtered = events;
    if (activeTab === "recommended") {
      filtered = events.filter(e => (e.aiMatchScore || 0) >= 20);
    } else if (activeTab === "upcoming") {
      filtered = events.filter(e => {
        const eventDate = e.date ? new Date(e.date) : new Date(e.startTime);
        return eventDate >= now;
      });
    }
    if (!filtered || filtered.length === 0) {
      filtered = events;
    }
    return filtered.slice(0, 8);
  }, [events, activeTab]);

  const toggleBookmark = async (id) => {
    const wasBookmarked = bookmarked.includes(id);
    setBookmarked(prev => wasBookmarked ? prev.filter(b => b !== id) : [...prev, id]);
    try {
      await eventService.toggleBookmark(id);
      window.dispatchEvent(new Event('bookmark-changed'));
    } catch {
      setBookmarked(prev => wasBookmarked ? [...prev, id] : prev.filter(b => b !== id));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getActionableInsights = () => {
    const insights = [];
    if (stats.upcomingDeadlines > 0) {
      insights.push({
        type: "deadline",
        message: `You have ${stats.upcomingDeadlines} deadline${stats.upcomingDeadlines > 1 ? 's' : ''} today`,
        urgent: true,
      });
    }
    if ((stats.attendanceRate || 0) < 75) {
      insights.push({
        type: "warning",
        message: "Attendance is below required threshold",
        urgent: true,
      });
    }
    if (stats.newAnnouncements > 0) {
      insights.push({
        type: "info",
        message: `${stats.newAnnouncements} new announcement${stats.newAnnouncements > 1 ? 's' : ''} need attention`,
        urgent: false,
      });
    }
    if (insights.length === 0) {
      insights.push({
        type: "success",
        message: "You're all caught up!",
        urgent: false,
      });
    }
    return insights;
  };

  if (isInitialLoad) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="p-4 sm:p-5 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-5 lg:space-y-6">
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <h1 className="text-xl lg:text-2xl font-semibold">
                {getGreeting()}, <span className="text-foreground">{user?.name?.split(" ")[0] || "Student"}</span>
              </h1>
            </div>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <StatCard index={0} label="Campus Pulse" value={stats.campusPulse || events.length} subtitle="Active events" icon={Activity} color="blue" />
            <StatCard index={1} label="Attendance" value={`${stats.attendanceRate || 94}%`} subtitle="This semester" icon={CheckCircle2} color="emerald" />
            <StatCard index={2} label="Saved" value={stats.savedCount || 0} subtitle="Bookmarks" icon={Bookmark} color="amber" />
            <StatCard index={3} label="Deadlines" value={stats.upcomingDeadlines || 0} subtitle="Today" icon={Clock} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            <div className="lg:col-span-2 space-y-5">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-semibold text-foreground">Today's Priorities</h3>
                </div>
                <PrioritiesCard priorities={priorities} onCheckIn={handleCheckIn} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    Recommended Events
                  </h3>
                  <div className="flex gap-0.5 p-0.5 rounded-lg bg-muted/50">
                    {['recommended', 'upcoming'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          activeTab === tab 
                            ? 'bg-background text-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
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
                    <div className="bg-card border border-border p-8 rounded-xl text-center">
                      <p className="text-sm text-muted-foreground">No events found.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Insights</h3>
                </div>
                <InsightsCard insights={getActionableInsights()} />
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Today's Schedule</h3>
                </div>
                <ScheduleCard schedule={schedule} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Announcements</h3>
                  <button 
                    onClick={() => navigate('/student/announcements')}
                    className="text-xs text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>
                <AnnouncementsCard messages={messages} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ index, label, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
    red: { bg: "bg-red-500/10", text: "text-red-500" },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-card border border-border rounded-xl p-3.5 hover:border-border hover:shadow-sm transition-all"
    >
      <div className={`p-2 rounded-lg ${c.bg} w-fit mb-2.5`}>
        <Icon size={16} className={c.text} />
      </div>
      <h2 className="text-xl font-bold text-foreground">{value}</h2>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}

function PrioritiesCard({ priorities, onCheckIn }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-blue-500">Next Class</span>
          </div>
          <p className="text-sm font-medium text-foreground line-clamp-1">{priorities.nextClass.title}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock size={12} /> {priorities.nextClass.time}</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> {priorities.nextClass.location}</span>
          </div>
          <p className="text-xs text-blue-500/80 mt-1">Starts in {priorities.nextClass.minutesUntil} min</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-xs font-medium text-foreground">Deadlines</span>
          </div>
          {priorities.deadlines.map((deadline) => (
            <div key={deadline.id} className={`rounded-lg p-2.5 border ${deadline.urgent ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/30 border-border'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground line-clamp-1">{deadline.title}</span>
                {deadline.urgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Due: {deadline.dueTime}</p>
            </div>
          ))}
        </div>
      </div>

      {priorities.criticalAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-xs font-medium text-amber-500">Critical Alert</span>
          </div>
          {priorities.criticalAlerts.map((alert) => (
            <p key={alert.id} className="text-sm text-foreground mt-1">{alert.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, index, isBookmarked, onToggleBookmark }) {
  const navigate = useNavigate();
  const eventDate = event.date ? new Date(event.date) : new Date(event.startTime);
  const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isUrgent = event.isUrgent || event.priority === 'urgent';

  const typeConfig = {
    class: { icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
    deadline: { icon: Clock, color: "text-red-500", bg: "bg-red-500/10" },
    event: { icon: Calendar, color: "text-violet-500", bg: "bg-violet-500/10" },
  };
  const type = typeConfig[event.type] || typeConfig.event;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`bg-card border border-border rounded-lg p-3.5 hover:border-border hover:shadow-sm transition-all group ${isUrgent ? 'border-l-2 border-l-red-500' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-md ${type.bg} shrink-0`}>
          <type.icon size={14} className={type.color} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isUrgent && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500 text-white">
                URGENT
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {isToday ? 'Today' : formattedDate} • {event.time || "TBD"}
            </span>
          </div>
          
          <h4 className="text-sm font-medium text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors">
            {event.title}
          </h4>
          
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin size={11} /> {event.location || "TBD"}
            </span>
            {(event.aiMatchScore || 0) >= 80 && (
              <span className="text-xs text-primary font-medium">High relevance</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleBookmark(event._id)}
            className={`p-1.5 rounded-md transition-colors ${
              isBookmarked 
                ? 'text-amber-500' 
                : 'text-muted-foreground hover:text-amber-500'
            }`}
          >
            <Bookmark size={14} className={isBookmarked ? "fill-current" : ""} />
          </button>
          <button
            onClick={() => navigate(`/student/events/${event._id}`)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InsightsCard({ insights }) {
  const config = {
    deadline: { bg: "bg-red-500/10", border: "border-red-500/20", icon: Clock, iconColor: "text-red-500" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertCircle, iconColor: "text-amber-500" },
    info: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Bell, iconColor: "text-blue-500" },
    success: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Check, iconColor: "text-emerald-500" },
  };

  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-2">
      {insights.map((insight, i) => {
        const c = config[insight.type] || config.info;
        return (
          <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg ${c.bg} border ${c.border}`}>
            <c.icon size={14} className={c.iconColor} />
            <span className="text-xs font-medium text-foreground">{insight.message}</span>
          </div>
        );
      })}
    </div>
  );
}

function ScheduleCard({ schedule }) {
  const todaySchedule = schedule.length > 0 ? schedule.slice(0, 5) : [
    { time: "09:00", title: "Advanced Programming", location: "Lab 2" },
    { time: "11:00", title: "Database Systems", location: "Hall 3" },
    { time: "14:00", title: "AI Workshop", location: "Lab 1" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="space-y-1">
        {todaySchedule.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
            <span className="text-xs font-mono text-muted-foreground w-12 shrink-0">{item.time}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground line-clamp-1">{item.subject || item.title}</p>
              <p className="text-[10px] text-muted-foreground">{item.room || item.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsCard({ messages }) {
  const defaultMessages = [
    { title: "Exam schedule released", time: "2h ago", unread: true },
    { title: "Campus maintenance notice", time: "5h ago", unread: false },
  ];
  const displayMessages = messages.length > 0 ? messages.slice(0, 3) : defaultMessages;

  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-1">
      {displayMessages.map((announcement, i) => (
        <div 
          key={i} 
          className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
        >
          {announcement.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className={`text-xs line-clamp-1 ${announcement.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {announcement.title || announcement.text}
            </p>
            <p className="text-[10px] text-muted-foreground">{announcement.time || "recently"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-40 bg-muted rounded" />
          <div className="h-7 w-56 bg-muted rounded" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-card border border-border rounded-xl p-3.5" />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-40 bg-card border border-border rounded-xl p-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-card border border-border rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-24 bg-card border border-border rounded-xl" />
            <div className="h-40 bg-card border border-border rounded-xl" />
            <div className="h-32 bg-card border border-border rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}