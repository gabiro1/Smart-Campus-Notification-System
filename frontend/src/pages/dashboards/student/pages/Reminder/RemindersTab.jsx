import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Plus, Trash2, Check, Clock, Loader2 } from "lucide-react";
import reminderService from "../../../../../services/reminderService";

const priorityStyles = {
  High: "bg-red-500/10 text-red-400",
  Medium: "bg-amber-500/10 text-amber-400",
  Low: "bg-blue-500/10 text-blue-400",
};

function formatDate(dateStr) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function RemindersTab() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchReminders = async () => {
    try {
      const res = await reminderService.getReminders(1, 100);
      const list = res?.reminders || res?.data || res || [];
      setReminders(Array.isArray(list) ? list : []);
    } catch {
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
      const res = await reminderService.createReminder({ title: newTitle.trim(), priority: "Medium" });
      if (res?.reminder || res?.data) {
        setReminders((prev) => [...prev, res.reminder || res.data]);
      } else {
        await fetchReminders();
      }
      setNewTitle("");
    } catch {
      setReminders((prev) => [...prev, { _id: Date.now().toString(), title: newTitle.trim(), dueDate: null, priority: "Medium", completed: false }]);
      setNewTitle("");
    }
  };

  const toggleDone = async (id, current) => {
    try {
      if (current) {
        await reminderService.uncompleteReminder(id);
      } else {
        await reminderService.completeReminder(id);
      }
      setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, completed: !r.completed, status: r.completed ? "pending" : "completed" } : r)));
    } catch {}
  };

  const deleteReminder = async (id) => {
    try {
      await reminderService.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch {}
  };

  const filtered = reminders.filter((r) => {
    const done = r.completed || r.status === "completed";
    if (filter === "active") return !done;
    if (filter === "done") return done;
    return true;
  });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Reminders</h1>
        <p className="text-muted-foreground text-sm mt-1">Stay on top of your tasks</p>
      </div>

      <GlassCard padding="p-4">
        <div className="flex items-center gap-1.5">
          {["all", "active", "done"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard padding="p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a reminder..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addReminder()}
            className="flex-1 max-w-sm bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50"
          />
          <button
            onClick={addReminder}
            disabled={!newTitle.trim()}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r, i) => {
            const done = r.completed || r.status === "completed";
            return (
              <GlassCard key={r._id || i} delay={i * 0.05} padding="p-4" hover={false}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDone(r._id, done)}
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                      done ? "bg-primary border-primary" : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {done && <Check size={11} className="text-primary-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${done ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>
                      {r.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                        <Clock size={10} /> {r.dueDate ? formatDate(r.dueDate) : r.due || "No date"}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityStyles[r.priority] || priorityStyles.Medium}`}>
                        {r.priority || "Medium"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => deleteReminder(r._id)} className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </GlassCard>
            );
          })}
          {filtered.length === 0 && (
            <GlassCard padding="p-8">
              <p className="text-center text-sm text-muted-foreground">No reminders</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
