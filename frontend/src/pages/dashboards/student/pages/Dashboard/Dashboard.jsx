import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import {
  Calendar,
  Bell,
  Bookmark,
  Clock,
  ArrowRight,
  Megaphone,
  ExternalLink,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext";
import dashboardService from "../../../../../services/dashboardService";
import announcementService from "../../../../../services/announcementService";
import eventService from "../../../../../services/eventService";
import notificationService from "../../../../../services/notificationService";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <GlassCard key={i} className="flex flex-col gap-3 h-[140px]">
          <Skeleton className="w-12 h-12" />
          <Skeleton className="w-2/3 h-6" />
          <Skeleton className="w-1/2 h-4" />
        </GlassCard>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <GlassCard className="h-[200px] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </GlassCard>
  );
}

const priorityStyles = {
  high: "bg-red-500/10 text-red-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-blue-500/10 text-blue-400",
};

const statCardsConfig = [
  { label: "Upcoming Events", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10", link: "/student/events", key: "events", detail: "Campus activities" },
  { label: "Messages", icon: Megaphone, color: "text-purple-500", bg: "bg-purple-500/10", link: "/student/messages", key: "announcements", detail: "Latest updates" },
  { label: "Bookmarks", icon: Bookmark, color: "text-amber-500", bg: "bg-amber-500/10", link: "/student/bookmarks", key: "savedCount", detail: "Saved events" },
  { label: "Active Now", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", link: "/student/events", key: "campusPulse", detail: "Campus engagement" },
];

const quickActions = [
  { label: "Browse Events", desc: "Discover campus activities", icon: Calendar, color: "text-blue-400", path: "/student/events" },
  { label: "My Bookmarks", desc: "Saved for later", icon: Bookmark, color: "text-amber-400", path: "/student/bookmarks" },
  { label: "Messages", desc: "Stay informed", icon: Megaphone, color: "text-purple-400", path: "/student/messages" },
  { label: "Timetable", desc: "Class schedule", icon: Clock, color: "text-emerald-400", path: "/student/timetable" },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "Student";

  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [summaryRes, statsRes, announcementsRes, eventsList, notificationsRes] = await Promise.allSettled([
        dashboardService.getStudentSummary(),
        dashboardService.getStudentDashboardStats(),
        announcementService.getAllAnnouncements(),
        eventService.getFeed(1, 5),
        notificationService.getNotifications({ limit: 5 }),
      ]);

      const newStats = {};

      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        const d = summaryRes.value;
        newStats.attendanceRate = d.stats?.attendanceRate ?? 0;
        newStats.aiMatchAvg = d.stats?.aiMatchAvg ?? 0;
        newStats.savedCount = d.stats?.savedCount ?? 0;
        newStats.campusPulse = d.stats?.campusPulse ?? 0;
        if (d.messages?.length) {
          setAnnouncements(
            d.messages.slice(0, 3).map((m) => ({
              title: m.title,
              dept: m.sender || "Lecturer",
              time: formatRelativeTime(m.createdAt),
              priority: "medium",
              _id: m._id,
            }))
          );
        }
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.success) {
        const s = statsRes.value.data;
        if (s) {
          newStats.events = s.events ?? newStats.events ?? 0;
          newStats.announcements = s.announcements ?? newStats.announcements ?? 0;
          newStats.savedCount = s.bookmarks ?? newStats.savedCount ?? 0;
          newStats.campusPulse = s.messages ?? newStats.campusPulse ?? 0;
        }
      }

      const feedItems = [];

      if (announcementsRes.status === "fulfilled" && Array.isArray(announcementsRes.value)) {
        feedItems.push(
          ...announcementsRes.value.map((a) => ({
            _id: a._id,
            title: a.title,
            dept: a.lecturer?.name || a.department || "Academic Office",
            time: formatRelativeTime(a.createdAt),
            priority: a.priority?.toLowerCase?.() || "medium",
            createdAt: a.createdAt,
          }))
        );
      }

      if (notificationsRes.status === "fulfilled" && Array.isArray(notificationsRes.value?.notifications)) {
        feedItems.push(
          ...notificationsRes.value.notifications.map((n) => ({
            _id: n._id,
            title: n.title,
            dept: n.type === "announcement" ? "Announcement" : "Notification",
            time: formatRelativeTime(n.createdAt),
            priority: n.priority?.toLowerCase?.() || "medium",
            createdAt: n.createdAt,
          }))
        );
      }

      if (feedItems.length > 0) {
        const seen = new Set();
        const merged = feedItems
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .filter((item) => {
            const key = `${item.title}|${item.createdAt}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 3);
        setAnnouncements(merged);
      }

      if (Array.isArray(eventsList.value)) {
        setEvents(
          eventsList.value.slice(0, 3).map((e) => ({
            _id: e._id,
            title: e.title,
            date: formatEventDate(e.startDate),
            location: e.location || e.venue || "TBA",
            attendees: e.attendeesCount || e.attendees?.length || 0,
          }))
        );
      }

      setStats(Object.keys(newStats).length > 0 ? newStats : null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const s = stats || {};
  const displayStats = statCardsConfig.map((card) => ({
    ...card,
    value: s[card.key] ?? "-",
  }));

  const hasAnnouncements = announcements.length > 0;
  const hasEvents = events.length > 0;

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => fetchDashboard()}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 px-4 lg:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Welcome back, {firstName}
            </h1>
            {user?.guildPosition && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Crown size={12} />
                {user.guildPosition}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Student dashboard · Stay up to date with campus life
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          {user?.role === "guild_president" && (
            <Link
              to="/guild/overview"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition-colors"
            >
              <Crown size={15} />
              Guild Council
            </Link>
          )}
          <Link
            to="/student/events/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Sparkles size={15} />
            Create Event
          </Link>
        </div>
      </header>

      <WidgetErrorBoundary name="StatCards">
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {displayStats.map((stat, i) => (
              <Link key={i} to={stat.link}>
                <GlassCard delay={i * 0.08} hoverOffset={-3} className="flex flex-col gap-3 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl border border-border ${stat.bg}`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.detail}</p>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </WidgetErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WidgetErrorBoundary name="RecentAnnouncements">
          {loading ? (
            <div className="lg:col-span-1">
              <GlassCard className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </GlassCard>
            </div>
          ) : (
            <GlassCard delay={0.3}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Megaphone size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Recent Announcements</h2>
                    <p className="text-xs text-muted-foreground">Latest updates from departments</p>
                  </div>
                </div>
                <Link to="/student/messages" className="text-xs font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
                  View all <ExternalLink size={11} />
                </Link>
              </div>
              <div className="space-y-2">
                {hasAnnouncements ? (
                  announcements.map((item, i) => (
                    <div key={item._id || i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <Megaphone size={13} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${priorityStyles[item.priority] || priorityStyles.medium}`}>
                            {item.priority || "medium"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{item.dept}</span>
                          <span className="text-xs text-border">·</span>
                          <span className="text-xs text-muted-foreground/60">{item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <Megaphone size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">{loading ? "Loading..." : "No recent announcements"}</p>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </WidgetErrorBoundary>

        <WidgetErrorBoundary name="UpcomingEvents">
          {loading ? (
            <GlassCard className="h-[300px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </GlassCard>
          ) : (
            <GlassCard delay={0.4}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Calendar size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Upcoming Events</h2>
                    <p className="text-xs text-muted-foreground">What's happening on campus</p>
                  </div>
                </div>
                <Link to="/student/events" className="text-xs font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1">
                  View all <ExternalLink size={11} />
                </Link>
              </div>
              <div className="space-y-2">
                {hasEvents ? (
                  events.map((event, i) => (
                    <Link key={event._id || i} to={`/student/events/${event._id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-background border border-border shrink-0">
                          <span className="text-xs font-bold text-foreground leading-none">{event.date?.split(" ")[0] || "-"}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">{event.date?.split(" ")[1] || ""}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate block">{event.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{event.location}</span>
                            <span className="text-xs text-border">·</span>
                            <span className="text-xs text-muted-foreground/60">{event.attendees} attending</span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <Calendar size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">{loading ? "Loading..." : "No upcoming events"}</p>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </WidgetErrorBoundary>
      </div>

      <WidgetErrorBoundary name="QuickActions">
        <GlassCard delay={0.5} padding="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="p-3 rounded-xl bg-accent/50 border border-border hover:bg-accent transition-all text-left group"
              >
                <div className={`flex items-center gap-2 ${action.color} mb-1`}>
                  <action.icon size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">{action.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </Link>
            ))}
          </div>
        </GlassCard>
      </WidgetErrorBoundary>
    </div>
  );
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatEventDate(dateStr) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
