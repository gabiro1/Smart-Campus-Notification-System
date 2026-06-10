import { useState, useEffect } from "react";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import { Clock, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import dashboardService from "../../../../services/dashboardService";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const subjectColors = [
  "border-l-blue-500 bg-blue-500/5",
  "border-l-purple-500 bg-purple-500/5",
  "border-l-emerald-500 bg-emerald-500/5",
  "border-l-amber-500 bg-amber-500/5",
  "border-l-cyan-500 bg-cyan-500/5",
  "border-l-rose-500 bg-rose-500/5",
  "border-l-orange-500 bg-orange-500/5",
  "border-l-teal-500 bg-teal-500/5",
  "border-l-indigo-500 bg-indigo-500/5",
  "border-l-pink-500 bg-pink-500/5",
];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

function timeToSlot(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return timeStr;
}

export default function TimeTable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");

  const fetchTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getStudentTimetable();
      const list = res?.data || res?.timetable || [];
      setTimetable(Array.isArray(list) ? list : []);
    } catch {
      setError("Failed to load timetable");
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const schedule = {};
  days.forEach((day) => { schedule[day] = []; });

  timetable.forEach((entry) => {
    const day = entry.dayOfWeek || entry.day || "";
    const time = timeToSlot(entry.startTime || entry.time || "");
    const course = entry.topic || entry.subject || entry.courseName || "Class";
    const room = entry.venue || entry.room || entry.location || "TBA";

    if (schedule[day]) {
      const existing = schedule[day].find((e) => e.time === time);
      if (!existing) {
        schedule[day].push({ time, course, room });
      }
    }
  });

  Object.keys(schedule).forEach((day) => {
    schedule[day].sort((a, b) => {
      const aH = parseInt(a.time) || 0;
      const bH = parseInt(b.time) || 0;
      return aH - bH;
    });
  });

  function getColor(course) {
    let hash = 0;
    for (let i = 0; i < course.length; i++) {
      hash = course.charCodeAt(i) + ((hash << 5) - hash);
    }
    return subjectColors[Math.abs(hash) % subjectColors.length];
  }

  if (error && timetable.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchTimetable}
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Timetable</h1>
          <p className="text-muted-foreground text-sm mt-1">Your weekly class schedule</p>
        </div>
        <button
          onClick={fetchTimetable}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <WidgetErrorBoundary name="Timetable">
        {loading ? (
          <GlassCard padding="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-16 h-12" />
                  <Skeleton className="flex-1 h-12" />
                </div>
              ))}
            </div>
          </GlassCard>
        ) : (
          <>
            <div className="block lg:hidden">
              <div className="flex gap-1 mb-4 overflow-x-auto custom-scrollbar">
                {days.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedDay === d
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-accent/50 text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {schedule[selectedDay]?.length ? (
                  schedule[selectedDay].map((cls, idx) => {
                    const color = getColor(cls.course);
                    return (
                      <div key={idx} className={`rounded-lg border-l-4 ${color} p-3 flex flex-col gap-1`}>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock size={12} />
                          <span>{cls.time}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground leading-tight">{cls.course}</span>
                        <span className="text-xs text-muted-foreground">{cls.room}</span>
                      </div>
                    );
                  })
                ) : (
                  <GlassCard padding="p-8">
                    <p className="text-sm text-muted-foreground text-center">No classes scheduled</p>
                  </GlassCard>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              <GlassCard padding="p-4 lg:p-6">
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 mb-2">
                      <div />
                      {days.map((d) => (
                        <div key={d} className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground bg-accent/50 rounded-lg">
                          {d.slice(0, 3)}
                        </div>
                      ))}
                    </div>

                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 mb-1">
                        <div className="h-16 flex items-center justify-center text-xs text-muted-foreground/60 font-medium">{hour}</div>
                        {days.map((day) => {
                          const cls = schedule[day]?.find((c) => c.time === hour);
                          if (!cls) return <div key={day} className="h-16 rounded-lg" />;
                          const color = getColor(cls.course);
                          return (
                            <div key={day} className={`h-16 rounded-lg border-l-2 ${color} p-2 flex flex-col justify-center`}>
                              <span className="text-[11px] font-semibold text-foreground leading-tight">{cls.course}</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">{cls.room}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </WidgetErrorBoundary>
    </div>
  );
}
