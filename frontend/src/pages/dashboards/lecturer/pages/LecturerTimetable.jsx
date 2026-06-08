import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, MapPin, BookOpen, RefreshCw,
  AlertCircle, Users, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import adminService from "../../../../services/adminService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);
const ROW_HEIGHT = 72;

const DAY_COLORS = [
  { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
  { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
];

function hourToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function LecturerTimetable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(u);
    } catch {}
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    setError(false);
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await adminService.getTimetable({ lecturerId: u._id });
      setEntries(res.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchTimetable();
    else setLoading(false);
  }, [user]);

  const dayEntries = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => {
      map[d] = entries
        .filter((e) => e.dayOfWeek === d)
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    });
    return map;
  }, [entries]);

  const uniqueClasses = new Set(entries.map((e) => e.classId?.name || e.classId || ""));
  const uniqueVenues = new Set(entries.map((e) => e.venue).filter(Boolean));
  const totalHours = entries.reduce((sum, e) => {
    const start = hourToMinutes(e.startTime);
    const end = hourToMinutes(e.endTime);
    return sum + Math.max(0, (end - start) / 60);
  }, 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-accent rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-accent rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => <LoadingCard key={i} />)}
        </div>
        <LoadingCard className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-lg font-semibold text-foreground">Failed to Load Timetable</p>
          <button onClick={fetchTimetable} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm">
            <RefreshCw size={16} /> Retry
          </button>
        </GlassCard>
      </div>
    );
  }

  const weekRange = `${HOURS[0]}:00 – ${HOURS[HOURS.length - 1]}:00`;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Timetable</h1>
        <p className="text-muted-foreground mt-1">View your weekly lecture schedule</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Weekly Entries" value={entries.length} icon={Calendar} iconBgClass="bg-blue-500/10" iconClass="text-blue-500" />
        <StatCard title="Classes" value={uniqueClasses.size} icon={BookOpen} iconBgClass="bg-emerald-500/10" iconClass="text-emerald-500" />
        <StatCard title="Hours/Week" value={totalHours.toFixed(1)} icon={Clock} iconBgClass="bg-violet-500/10" iconClass="text-violet-500" />
        <StatCard title="Venues" value={uniqueVenues.size} icon={MapPin} iconBgClass="bg-amber-500/10" iconClass="text-amber-500" />
      </div>

      {entries.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
          <Calendar className="w-12 h-12 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">No Timetable Entries</p>
          <p className="text-sm text-muted-foreground">Your timetable has not been set up yet. Contact your HOD.</p>
        </GlassCard>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={13} />
              <span>{weekRange}</span>
            </div>
            <span className="text-xs text-muted-foreground">{entries.length} sessions</span>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <div
              className="grid min-w-[720px]"
              style={{
                gridTemplateColumns: `60px repeat(5, 1fr)`,
                gridTemplateRows: `36px repeat(${HOURS.length}, ${ROW_HEIGHT}px)`,
              }}
            >
              <div className="bg-accent/50 border-r border-b border-border" />
              {DAYS.map((day, di) => (
                <div key={day} className={`flex items-center justify-center border-r last:border-r-0 border-b border-border ${DAY_COLORS[di].bg}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${DAY_COLORS[di].text}`}>{day.slice(0, 3)}</span>
                </div>
              ))}
              {HOURS.map((hour) => (
                <div key={hour} className="border-r border-b border-border bg-card flex items-start justify-end pr-2 pt-1">
                  <span className="text-[10px] font-medium text-muted-foreground/60">{String(hour).padStart(2, "0")}:00</span>
                </div>
              ))}
              {HOURS.map((hour) =>
                DAYS.map((day, di) => {
                  const slotEntries = dayEntries[day].filter((e) => {
                    const startH = Math.floor(hourToMinutes(e.startTime) / 60);
                    const endH = Math.ceil(hourToMinutes(e.endTime) / 60);
                    return startH <= hour && endH > hour;
                  });
                  const isFirstRender = slotEntries.filter(
                    (e) => Math.floor(hourToMinutes(e.startTime) / 60) === hour
                  );
                  return (
                    <div key={`${day}-${hour}`} className="relative border-r last:border-r-0 border-b border-border bg-card/50"
                      style={{ gridRow: hour - 7 + 2, gridColumn: di + 2 }}>
                      {isFirstRender.map((entry) => {
                        const startMin = hourToMinutes(entry.startTime);
                        const endMin = hourToMinutes(entry.endTime);
                        const startHour = Math.max(7, Math.floor(startMin / 60));
                        const endHour = Math.min(18, Math.ceil(endMin / 60));
                        const rowSpan = Math.max(1, endHour - startHour);
                        return (
                          <div key={entry._id}
                            className={`absolute inset-x-0.5 top-0.5 rounded-lg border ${DAY_COLORS[di].border} ${DAY_COLORS[di].bg} p-1.5 overflow-hidden z-10`}
                            style={{ height: `${rowSpan * ROW_HEIGHT - 4}px`, minHeight: "52px" }}>
                            <div className="flex flex-col h-full">
                              <div className="flex items-center gap-1">
                                <Clock size={9} className={DAY_COLORS[di].text} />
                                <span className={`text-[10px] font-semibold ${DAY_COLORS[di].text}`}>{entry.startTime} - {entry.endTime}</span>
                              </div>
                              {entry.topic && <p className="text-[11px] font-semibold text-foreground leading-tight line-clamp-1 mt-0.5">{entry.topic}</p>}
                              <p className="text-[10px] text-muted-foreground mt-0.5">{entry.classId?.name || entry.classId}</p>
                              {entry.venue && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-auto">
                                  <MapPin size={9} />
                                  <span className="truncate">{entry.venue}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="block lg:hidden">
            <div className="flex gap-1 p-3 border-b border-border">
              {DAYS.map((day, di) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(di)}
                  className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedDay === di
                      ? `${DAY_COLORS[di].bg} ${DAY_COLORS[di].text} ${DAY_COLORS[di].border} border`
                      : "text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
              {dayEntries[DAYS[selectedDay]].length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No classes on this day</p>
              ) : (
                dayEntries[DAYS[selectedDay]].map((entry) => (
                  <div
                    key={entry._id}
                    className={`rounded-xl border ${DAY_COLORS[selectedDay].border} ${DAY_COLORS[selectedDay].bg} p-4`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={12} className={DAY_COLORS[selectedDay].text} />
                      <span className={`text-xs font-semibold ${DAY_COLORS[selectedDay].text}`}>
                        {entry.startTime} - {entry.endTime}
                      </span>
                    </div>
                    {entry.topic && (
                      <p className="text-sm font-semibold text-foreground mb-1">{entry.topic}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{entry.classId?.name || entry.classId}</p>
                    {entry.venue && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <MapPin size={10} />
                        <span>{entry.venue}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
