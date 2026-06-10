import { useState, useEffect } from "react";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import { Plus, Trash2, Check, Clock, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import reminderService from "../../../../../services/reminderService";

const priorityStyles = {
  High: "bg-red-500/10 text-red-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-blue-500/10 text-blue-400",
  high: "bg-red-500/10 text-red-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-blue-500/10 text-blue-400",
};

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function RemindersTab() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reminderService.getReminders(1, 100);
      const list = res?.reminders || res?.data || res || [];
      setReminders(Array.isArray(list) ? list : []);
    } catch {
      setError("Failed to load reminders");
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const addReminder = async () => {
    if (!newTitle.trim()) return;
    try {
      await reminderService.createReminder({ title: newTitle.trim(), priority: "Medium" });
      setNewTitle("");
      fetchReminders();
    } catch {}
  };

  const toggleReminder = async (id, completed) => {
    try {
      await reminderService.updateReminder(id, { completed: !completed });
      setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, completed: !completed } : r)));
    } catch {}
  };

  const deleteReminder = async (id) => {
    try {
      await reminderService.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch {}
  };

  const filtered = reminders.filter((r) => {
    if (filter === "active") return !r.completed;
    if (filter === "completed") return r.completed;
    return true;
  });

  const activeCount = reminders.filter((r) => !r.completed).length;

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

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Reminders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeCount > 0 ? `${activeCount} active reminder${activeCount > 1 ? "s" : ""}` : "No active reminders"}
          </p>
        </div>
        <button
          onClick={fetchReminders}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <GlassCard padding="p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New reminder..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addReminder()}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50"
          />
          <button
            onClick={addReminder}
            disabled={!newTitle.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </GlassCard>

      <div className="flex items-center gap-1.5">
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <WidgetErrorBoundary name="RemindersList">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} padding="p-4" hover={false}>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="w-1/2 h-4" />
                    <Skeleton className="w-1/3 h-3" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r, i) => (
              <GlassCard key={r._id || i} delay={i * 0.04} padding="p-4" hover={false}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleReminder(r._id, r.completed)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      r.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border hover:border-blue-500/50"
                    }`}
                  >
                    {r.completed && <Check size={12} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${r.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                      {r.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.dueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={10} /> {formatDate(r.dueDate)}
                        </span>
                      )}
                      {r.priority && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priorityStyles[r.priority] || priorityStyles.Medium}`}>
                          {r.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(r._id)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </GlassCard>
            ))}
            {filtered.length === 0 && (
              <GlassCard padding="p-10">
                <div className="text-center">
                  <Clock size={36} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No reminders</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Add a reminder to get started</p>
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </WidgetErrorBoundary>
    </div>
  );
}
