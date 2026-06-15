import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import { Clock, Calendar, BookOpen, FileText, Users, AlertTriangle, CheckCircle, Bell } from "lucide-react";
import reminderService from "@/services/reminderService";

const sourceIcons = {
  event: Calendar,
  exam: BookOpen,
  assignment: FileText,
  meeting: Users,
  admin_deadline: AlertTriangle,
  personal: Bell,
};

const sourceColors = {
  event: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  exam: "text-red-400 bg-red-500/10 border-red-500/20",
  assignment: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  meeting: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  admin_deadline: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  personal: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const priorityStyles = {
  critical: "bg-red-500/15 text-red-400",
  high: "bg-orange-500/15 text-orange-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-blue-500/15 text-blue-400",
};

function getCountdown(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Due now";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

function getRelativeDay(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return `In ${diff} days`;
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function UpcomingActivities() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await reminderService.getReminders({
          completed: false,
          limit: 5,
          sort: "scheduledTime",
        });
        if (mounted) setReminders(res?.reminders || []);
      } catch {
        if (mounted) setReminders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const active = reminders.filter(r => !r.completed && r.status !== "cancelled");
  const overdue = active.filter(r => new Date(r.scheduledTime) < new Date());
  const upcoming = active.filter(r => new Date(r.scheduledTime) >= new Date());

  return (
    <WidgetErrorBoundary name="UpcomingActivities">
      <GlassCard delay={0.2}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Clock size={14} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Upcoming Activities</h2>
              <p className="text-xs text-muted-foreground">
                {active.length > 0 ? `${active.length} active` : "No upcoming activities"}
              </p>
            </div>
          </div>
          <Link
            to="/student/reminders"
            className="text-xs font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-accent/70" />
                <div className="flex-1 space-y-1">
                  <div className="w-2/3 h-3 rounded bg-accent/70" />
                  <div className="w-1/3 h-2 rounded bg-accent/50" />
                </div>
              </div>
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="py-6 text-center">
            <CheckCircle size={32} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {overdue.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5 px-1">Overdue</p>
                {overdue.slice(0, 2).map(r => (
                  <ReminderRow key={r._id} reminder={r} />
                ))}
              </div>
            )}
            {upcoming.slice(0, 3).map(r => (
              <ReminderRow key={r._id} reminder={r} />
            ))}
          </div>
        )}
      </GlassCard>
    </WidgetErrorBoundary>
  );
}

function ReminderRow({ reminder }) {
  const Icon = sourceIcons[reminder.sourceType] || Bell;
  const colorClass = sourceColors[reminder.sourceType] || sourceColors.personal;
  const isOverdue = new Date(reminder.scheduledTime) < new Date();

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{reminder.title}</span>
          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold ${priorityStyles[reminder.priority] || priorityStyles.medium}`}>
            {reminder.priority}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-medium ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}>
            {getRelativeDay(reminder.scheduledTime)}
          </span>
          <span className="text-xs text-border">·</span>
          <span className={`text-xs font-semibold ${isOverdue ? "text-red-400" : "text-emerald-400"}`}>
            {getCountdown(reminder.scheduledTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
