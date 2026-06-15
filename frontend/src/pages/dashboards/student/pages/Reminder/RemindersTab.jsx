import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import {
  Plus, Trash2, Check, Clock, Loader2, RefreshCw, AlertTriangle,
  Calendar, BookOpen, FileText, Users, Bell, X, Search,
  CheckCheck, ArrowRight, ArrowLeft, ChevronDown,
} from "lucide-react";
import reminderService from "../../../../../services/reminderService";
import { useSocket } from "../../../../../context/SocketContext";
import toast from "react-hot-toast";

const sourceMeta = {
  event: { label: "Event", icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  exam: { label: "Exam", icon: BookOpen, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  assignment: { label: "Assignment", icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  meeting: { label: "Meeting", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  admin_deadline: { label: "Deadline", icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  personal: { label: "Personal", icon: Bell, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

const priorityStyles = {
  critical: "bg-red-500/15 text-red-400",
  high: "bg-orange-500/15 text-orange-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-blue-500/15 text-blue-400",
};

const statusStyles = {
  pending: "bg-zinc-500/15 text-zinc-400",
  scheduled: "bg-blue-500/15 text-blue-400",
  processing: "bg-amber-500/15 text-amber-400",
  sent: "bg-emerald-500/15 text-emerald-400",
  failed: "bg-red-500/15 text-red-400",
  cancelled: "bg-zinc-500/10 text-zinc-500",
};

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

function getCountdown(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
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
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const TIMELINE_TABS = [
  { key: "overdue", label: "Overdue", icon: AlertTriangle, color: "text-red-400" },
  { key: "today", label: "Today", icon: Clock, color: "text-amber-400" },
  { key: "tomorrow", label: "Tomorrow", icon: ArrowRight, color: "text-blue-400" },
  { key: "upcoming", label: "Upcoming", icon: Calendar, color: "text-purple-400" },
  { key: "completed", label: "Completed", icon: CheckCheck, color: "text-emerald-400" },
  { key: "all", label: "All", icon: Bell, color: "text-zinc-400" },
];

function getDefaultDateTime() {
  const now = new Date();
  return {
    month: now.getMonth(),
    day: now.getDate(),
    year: now.getFullYear(),
    hour: now.getHours() % 12 || 12,
    minute: now.getMinutes(),
    ampm: now.getHours() >= 12 ? "PM" : "AM",
  };
}

function buildIsoString({ month, day, year, hour, minute, ampm }) {
  const hh = ampm === "PM" ? (hour % 12) + 12 : hour % 12;
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  const h = String(hh).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  return `${year}-${m}-${d}T${h}:${min}`;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function RemindersTab() {
  const { socket } = useSocket();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineTab, setTimelineTab] = useState("overdue");
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "", description: "", sourceType: "personal", priority: "medium",
    dateTime: getDefaultDateTime(),
  });
  const [selected, setSelected] = useState(new Set());
  const [stats, setStats] = useState(null);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.allSettled([
        reminderService.getReminders({ limit: 100 }),
        reminderService.getReminderStats(),
      ]);
      if (listRes.status === "fulfilled") {
        setReminders(Array.isArray(listRes.value?.reminders) ? listRes.value.reminders : []);
      } else {
        setReminders([]);
      }
      if (statsRes.status === "fulfilled") setStats(statsRes.value?.stats || null);
    } catch {
      setError("Failed to load reminders");
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  useEffect(() => {
    if (!socket) return;
    const handleReminderFired = (notif) => {
      if (notif?.type !== "reminder") return;
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full mx-3 bg-[#111] shadow-2xl rounded-[15px] pointer-events-auto flex ring-1 ring-white/10 overflow-hidden border border-blue-500/30`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber-500/20 border border-amber-500/30">
                  <Bell size={16} className="text-amber-400" />
                </div>
              </div>
              <div className="ml-3 flex-1 text-left">
                <p className="text-sm font-bold text-white uppercase tracking-tight">⏰ Reminder</p>
                <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{notif.title || notif.message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/5">
            <button onClick={() => toast.dismiss(t.id)} className="px-6 border border-transparent rounded-none rounded-r-[15px] flex items-center justify-center text-xs font-black text-neutral-500 hover:text-white transition-colors">CLOSE</button>
          </div>
        </div>
      ), { duration: 5000 });
      fetchReminders();
    };
    socket.on("notification:new", handleReminderFired);
    return () => { socket.off("notification:new", handleReminderFired); };
  }, [socket]);

  const filtered = reminders.filter(r => {
    if (timelineTab === "all") return true;
    if (timelineTab === "completed") return r.completed;
    if (r.completed) return false;

    const now = new Date();
    const sched = new Date(r.scheduledTime);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);
    const startOfTomorrow = new Date(endOfDay.getTime());
    const endOfTomorrow = new Date(startOfTomorrow.getTime() + 86400000);

    if (timelineTab === "overdue" && sched < startOfDay) return true;
    if (timelineTab === "today" && sched >= startOfDay && sched < endOfDay) return true;
    if (timelineTab === "tomorrow" && sched >= startOfTomorrow && sched < endOfTomorrow) return true;
    if (timelineTab === "upcoming" && sched >= endOfDay) return true;
    return false;
  }).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const prio = { critical: 0, high: 1, medium: 2, low: 3 };
    const pa = prio[a.priority] ?? 2;
    const pb = prio[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    return new Date(a.scheduledTime) - new Date(b.scheduledTime);
  });

  const createReminder = async () => {
    const iso = buildIsoString(newReminder.dateTime);
    if (!newReminder.title.trim()) return;
    try {
      await reminderService.createReminder({
        title: newReminder.title.trim(),
        description: newReminder.description,
        sourceType: newReminder.sourceType,
        priority: newReminder.priority,
        scheduledTime: iso,
      });
      setNewReminder({
        title: "", description: "", sourceType: "personal", priority: "medium",
        dateTime: getDefaultDateTime(),
      });
      setShowNewForm(false);
      fetchReminders();
    } catch {}
  };

  const toggleComplete = async (r) => {
    try {
      if (r.completed) await reminderService.uncompleteReminder(r._id);
      else await reminderService.completeReminder(r._id);
      setReminders(prev =>
        prev.map(x =>
          x._id === r._id
            ? { ...x, completed: !x.completed, completedAt: x.completed ? null : new Date().toISOString() }
            : x
        )
      );
    } catch {}
  };

  const deleteReminder = async (id) => {
    try {
      await reminderService.deleteReminder(id);
      setReminders(prev => prev.filter(x => x._id !== id));
    } catch {}
  };

  const bulkComplete = async () => {
    try {
      await reminderService.bulkCompleteReminders(Array.from(selected));
      setSelected(new Set());
      fetchReminders();
    } catch {}
  };

  const bulkDelete = async () => {
    try {
      await reminderService.bulkDeleteReminders(Array.from(selected));
      setSelected(new Set());
      fetchReminders();
    } catch {}
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeCount = reminders.filter(r => !r.completed).length;
  const overdueCount = reminders.filter(
    r => !r.completed && new Date(r.scheduledTime) < new Date()
  ).length;

  if (error && reminders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchReminders}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const timelineColorMap = {
    overdue: "from-red-500",
    today: "from-amber-500",
    tomorrow: "from-blue-500",
    upcoming: "from-purple-500",
    completed: "from-emerald-500",
    all: "from-zinc-500",
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 lg:px-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">
            Reminders
          </h1>
          <p className="text-sm text-muted-foreground">
            {overdueCount > 0
              ? <span className="text-red-400 font-medium">{overdueCount} overdue</span>
              : activeCount > 0
                ? `${activeCount} active`
                : "No active reminders"}
            {activeCount > 0 && <span className="text-muted-foreground"> · {activeCount} total active</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <button
                onClick={bulkComplete}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <CheckCheck size={13} /> Complete {selected.size}
              </button>
              <button
                onClick={bulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={13} /> Delete {selected.size}
              </button>
            </>
          )}
          <button
            onClick={fetchReminders}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 bg-black/40 border border-white/10 rounded-lg"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} /> <span className="hidden sm:inline">New Reminder</span>
          </button>
        </div>
      </header>

      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-full sm:w-fit mx-4 lg:mx-6 overflow-x-auto">
        {TIMELINE_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setTimelineTab(tab.key)}
            className={`relative px-4 sm:px-5 py-2 text-sm font-medium transition-colors z-10 capitalize flex items-center gap-2 whitespace-nowrap ${
              timelineTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-neutral-300"
            }`}
          >
            {timelineTab === tab.key && (
              <motion.div
                layoutId="reminder-timeline-tabs"
                className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon size={14} className={tab.color} />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.key === "overdue" && overdueCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold leading-none">
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 lg:px-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reminders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {showNewForm && (
        <div className="px-4 lg:px-6">
          <GlassCard padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">New Reminder</h3>
              <button onClick={() => setShowNewForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Title *</label>
                  <input
                    type="text"
                    placeholder="What do you need to remember?"
                    value={newReminder.title}
                    onChange={e => setNewReminder(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Date & Time *</label>
                  <div className="flex flex-wrap gap-1.5">
                    <select
                      value={newReminder.dateTime.month}
                      onChange={e => setNewReminder(p => ({ ...p, dateTime: { ...p.dateTime, month: Number(e.target.value) } }))}
                      className="flex-1 min-w-[70px] bg-background border border-border rounded-lg px-2 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                    >
                      {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select
                      value={newReminder.dateTime.day}
                      onChange={e => setNewReminder(p => ({ ...p, dateTime: { ...p.dateTime, day: Number(e.target.value) } }))}
                      className="w-[56px] bg-background border border-border rounded-lg px-1 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer text-center"
                    >
                      {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                    </select>
                    <select
                      value={newReminder.dateTime.year}
                      onChange={e => setNewReminder(p => ({ ...p, dateTime: { ...p.dateTime, year: Number(e.target.value) } }))}
                      className="w-[80px] bg-background border border-border rounded-lg px-1 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer text-center"
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const y = new Date().getFullYear() + i;
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                    <span className="text-muted-foreground self-center text-xs px-0.5">·</span>
                    <select
                      value={newReminder.dateTime.hour}
                      onChange={e => setNewReminder(p => ({ ...p, dateTime: { ...p.dateTime, hour: Number(e.target.value) } }))}
                      className="w-[52px] bg-background border border-border rounded-lg px-1 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer text-center"
                    >
                      {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                    </select>
                    <span className="text-muted-foreground self-center text-xs">:</span>
                    <select
                      value={newReminder.dateTime.minute}
                      onChange={e => setNewReminder(p => ({ ...p, dateTime: { ...p.dateTime, minute: Number(e.target.value) } }))}
                      className="w-[52px] bg-background border border-border rounded-lg px-1 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer text-center"
                    >
                      {Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}</option>)}
                    </select>
                    <select
                      value={newReminder.dateTime.ampm}
                      onChange={e => setNewReminder(p => ({ ...p, dateTime: { ...p.dateTime, ampm: e.target.value } }))}
                      className="w-[56px] bg-background border border-border rounded-lg px-1 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer text-center font-semibold"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Optional note..."
                  value={newReminder.description}
                  onChange={e => setNewReminder(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={newReminder.sourceType}
                    onChange={e => setNewReminder(p => ({ ...p, sourceType: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
                  >
                    {Object.entries(sourceMeta).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Priority</label>
                  <select
                    value={newReminder.priority}
                    onChange={e => setNewReminder(p => ({ ...p, priority: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowNewForm(false); setNewReminder(p => ({ ...p, dateTime: getDefaultDateTime() })); }}
                  className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createReminder}
                  disabled={!newReminder.title.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus size={14} /> Create
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {stats && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground px-4 lg:px-6">
          <span>{stats.total} total</span>
          <span className="text-blue-400">{stats.scheduled} scheduled</span>
          <span className="text-emerald-400">{stats.sent} sent</span>
          {stats.failed > 0 && <span className="text-red-400">{stats.failed} failed</span>}
          {stats.cancelled > 0 && <span className="text-zinc-400">{stats.cancelled} cancelled</span>}
          {stats.completed > 0 && <span className="text-emerald-400">{stats.completed} completed</span>}
          {stats.overdue > 0 && <span className="text-red-400">{stats.overdue} overdue</span>}
        </div>
      )}

      <WidgetErrorBoundary name="RemindersList">
        {loading ? (
          <div className="px-4 lg:px-6">
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-4">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-muted-foreground text-sm">Loading reminders...</p>
            </div>
          </div>
        ) : (
          <div className="relative pt-4 px-4 lg:px-6">
            <div className={`absolute left-6 md:left-8 top-8 bottom-0 w-px bg-gradient-to-b ${timelineColorMap[timelineTab]} via-white/10 to-transparent`} />

            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence mode="popLayout">
                {sorted.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pl-12 sm:pl-16 md:pl-20 py-10"
                  >
                    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-border rounded-2xl bg-muted/20">
                      <Bell size={28} className="text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-medium">
                        {timelineTab === "overdue"
                          ? "You're all caught up!"
                          : "No reminders yet"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {timelineTab !== "overdue"
                          ? "Add a reminder to get started"
                          : "No overdue reminders — nice work!"}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  sorted.map((r, i) => {
                    const meta = sourceMeta[r.sourceType] || sourceMeta.personal;
                    const Icon = meta.icon;
                    const isOverdue = !r.completed && new Date(r.scheduledTime) < new Date();
                    const now = new Date();
                    const sched = new Date(r.scheduledTime);
                    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const isToday = sched >= startOfDay && sched < new Date(startOfDay.getTime() + 86400000);
                    const isUnread = isOverdue || (isToday && !r.completed);

                    return (
                      <motion.div
                        key={r._id || i}
                        initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                        transition={{
                          duration: 0.4,
                          delay: i * 0.05,
                          ease: "easeOut",
                        }}
                        className="relative pl-12 sm:pl-16 md:pl-20 pr-1 sm:pr-2 group"
                      >
                        <div
                          className={`absolute left-1 sm:left-2 md:left-4 top-3 sm:top-4 w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center border z-10 transition-transform duration-300 group-hover:scale-110 ${meta.bg} ${meta.border} ${isUnread ? "shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "shadow-lg"}`}
                        >
                          <Icon size={14} className={meta.color} />
                        </div>

                        <GlassCard
                          delay={0}
                          hover={false}
                          className={`p-3 sm:p-5 transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/20 ${isUnread ? "border-blue-500/30 bg-blue-500/[0.02]" : ""}`}
                        >
                          {isUnread && (
                            <span className="absolute top-3 sm:top-5 right-3 sm:right-5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                            </span>
                          )}

                          <div className="flex items-start gap-2 sm:gap-3">
                            <label className="flex items-center cursor-pointer mt-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selected.has(r._id)}
                                onChange={() => toggleSelect(r._id)}
                                className="w-4 h-4 rounded border-border bg-background text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0"
                              />
                            </label>

                            <button
                              onClick={() => toggleComplete(r)}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                r.completed
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-border hover:border-blue-500/50"
                              }`}
                            >
                              {r.completed && <Check size={12} />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 mb-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className={`font-semibold text-sm sm:text-base ${r.completed ? "line-through text-muted-foreground" : isUnread ? "text-foreground" : "text-neutral-200"}`}>
                                    {r.title}
                                  </h3>
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priorityStyles[r.priority] || priorityStyles.medium}`}>
                                    {r.priority}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusStyles[r.status] || statusStyles.pending}`}>
                                    {r.status}
                                  </span>
                                  {r.sourceType && r.sourceType !== "personal" && (
                                    <span className="text-[10px] text-muted-foreground bg-accent/50 px-1.5 py-0.5 rounded">
                                      {meta.label}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-black/40 px-2 py-1 rounded-md border border-border w-fit shrink-0">
                                  <Clock size={10} />
                                  <span className={isOverdue ? "text-red-400" : ""}>
                                    {getRelativeDay(r.scheduledTime)}
                                  </span>
                                </div>
                              </div>

                              {r.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed mb-1.5">
                                  {r.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatDate(r.scheduledTime)}</span>
                                {getCountdown(r.scheduledTime) && !r.completed && (
                                  <>
                                    <span className="text-border">·</span>
                                    <span className="font-semibold text-emerald-400">
                                      {getCountdown(r.scheduledTime)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleComplete(r)}
                              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                r.completed
                                  ? "bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              }`}
                            >
                              <Check size={12} />
                              <span className="hidden sm:inline">{r.completed ? "Uncomplete" : "Complete"}</span>
                            </button>
                            {r.status === "scheduled" && (
                              <button
                                onClick={async () => { await reminderService.cancelReminder(r._id); fetchReminders(); }}
                                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs hover:bg-amber-500/20 transition-colors"
                              >
                                <X size={12} />
                                <span className="hidden sm:inline">Cancel</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteReminder(r._id)}
                              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 size={12} />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </GlassCard>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </WidgetErrorBoundary>
    </div>
  );
}
