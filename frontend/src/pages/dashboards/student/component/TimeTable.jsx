import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Clock, Loader2 } from "lucide-react";
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

function timeToSlot(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return timeStr;
}

export default function TimeTable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dashboardService.getStudentTimetable();
        const list = res?.data || res?.timetable || [];
        setTimetable(Array.isArray(list) ? list : []);
      } catch {
        setTimetable([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
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

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Timetable</h1>
        <p className="text-muted-foreground text-sm mt-1">Your weekly class schedule</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
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
      )}
    </div>
  );
}
