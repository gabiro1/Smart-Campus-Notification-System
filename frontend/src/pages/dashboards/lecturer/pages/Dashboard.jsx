import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Users, Calendar, Megaphone, ArrowRight, Clock,
  RefreshCw, Loader2, Sparkles, TrendingUp, MessageSquare,
  Bell, PlusCircle, AlertTriangle, ExternalLink
} from "lucide-react";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import { useAuth } from "../../../../context/AuthContext";
import classService from "../../../../services/classService";
import announcementService from "../../../../services/announcementService";
import adminService from "../../../../services/adminService";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
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

const priorityStyles = {
  high: "bg-red-500/10 text-red-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-blue-500/10 text-blue-400",
};

const statCardsConfig = [
  { label: "My Classes", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", link: "/lecturer/classes", key: "classes", detail: "Assigned courses" },
  { label: "Students", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10", link: "/lecturer/classes", key: "students", detail: "Total enrolled" },
  { label: "Messages", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10", link: "/lecturer/messages", key: "announcements", detail: "Broadcast & Q&A" },
  { label: "Weekly Sessions", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10", link: "/lecturer/timetable", key: "sessions", detail: "On your timetable" },
];

const quickActions = [
  { label: "Create Announcement", desc: "AI-assisted drafting", icon: PlusCircle, color: "text-blue-400", path: "/lecturer/create" },
  { label: "My Classes", desc: "View roster & schedule", icon: Users, color: "text-emerald-400", path: "/lecturer/classes" },
  { label: "Messages", desc: "Chat with students", icon: MessageSquare, color: "text-purple-400", path: "/lecturer/messages" },
  { label: "Timetable", desc: "Weekly lecture plan", icon: Clock, color: "text-amber-400", path: "/lecturer/timetable" },
];

export default function LecturerOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "Lecturer";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [classesRes, timetableRes, statsRes] = await Promise.allSettled([
        classService.getMyClasses().catch(() => ({ data: [] })),
        adminService.getTimetable({ lecturerId: user?._id }).catch(() => ({ data: [] })),
        announcementService.getDashboardStats().catch(() => null),
      ]);

      const classes = classesRes.status === "fulfilled" ? (classesRes.value?.data || classesRes.value || []) : [];
      const timetable = timetableRes.status === "fulfilled" ? (timetableRes.value?.data || []) : [];
      const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || c.students?.length || 0), 0);
      const announcementCount = statsRes.status === "fulfilled" ? (statsRes.value?.total || statsRes.value?.count || 0) : 0;

      setStats({
        classes: classes.length,
        students: totalStudents,
        announcements: announcementCount,
        sessions: timetable.length,
      });

    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) fetchDashboard();
    else setLoading(false);
  }, [fetchDashboard, user?._id]);

  const s = stats || {};
  const displayStats = statCardsConfig.map((card) => ({ ...card, value: s[card.key] ?? "-" }));

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => fetchDashboard()} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 px-4 lg:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground text-sm mt-1">Lecturer dashboard · Manage your classes and communications</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchDashboard(true)} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <Link to="/lecturer/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            <Sparkles size={15} /> New Announcement
          </Link>
        </div>
      </header>

      <WidgetErrorBoundary name="StatCards">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <GlassCard key={i} className="flex flex-col gap-3 h-[140px]">
                <Skeleton className="w-12 h-12" />
                <Skeleton className="w-2/3 h-6" />
                <Skeleton className="w-1/2 h-4" />
              </GlassCard>
            ))}
          </div>
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

      <WidgetErrorBoundary name="QuickActions">
        <GlassCard delay={0.5} padding="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.path}
                className="p-3 rounded-xl bg-accent/50 border border-border hover:bg-accent transition-all text-left group">
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
