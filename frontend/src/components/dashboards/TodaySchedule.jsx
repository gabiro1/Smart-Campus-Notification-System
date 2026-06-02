const defaultSchedule = [
  { time: "09:00", course: "Advanced Programming", room: "Lab 4", active: true },
  { time: "11:00", course: "Database Systems", room: "Room 201", active: false },
  { time: "14:00", course: "Software Engineering", room: "Room 305", active: false },
];

export default function TodaySchedule({ schedule: propSchedule }) {
  const items = propSchedule && propSchedule.length > 0 ? propSchedule : defaultSchedule;

  return (
    <div>
      <h3 className="text-[14px] font-medium text-foreground mb-3">Today's Schedule</h3>
      <div className="relative">
        <div className="absolute left-[44px] top-[8px] bottom-[8px] w-px bg-border" />
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-2 relative">
              <span className="text-[13px] text-muted-foreground w-10 text-right pt-0.5 shrink-0">
                {item.time}
              </span>
              <div className="relative z-10 mt-1 shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${
                    item.active
                      ? "bg-[#4ADE80]"
                      : "bg-muted border border-border"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground">{item.course}</p>
                <p className="text-[12px] text-muted-foreground">{item.room}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
