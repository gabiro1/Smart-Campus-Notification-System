import { useState } from "react";

const defaultAnnouncements = [
  {
    id: 1,
    sender: "Academic Affairs",
    time: "2h ago",
    body: "Semester exams timetable has been released. Check the academic portal.",
  },
  {
    id: 2,
    sender: "Student Affairs",
    time: "Yesterday",
    body: "Campus ID card collection open. Visit Admin Block, Room 12.",
  },
];

export default function AnnouncementsPanel({ announcements: propAnnouncements }) {
  const [acknowledged, setAcknowledged] = useState({});
  const items = propAnnouncements && propAnnouncements.length > 0 ? propAnnouncements : defaultAnnouncements;

  const handleAcknowledge = (id) => {
    setAcknowledged((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div>
      <h3 className="text-[15px] font-medium text-foreground mb-3">Announcements</h3>
      <div className="space-y-2">
        {items.map((item) => {
          const ack = acknowledged[item.id];
          return (
            <div
              key={item.id}
              className="bg-card rounded-lg p-4 border-l-2 border-l-border"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[13px] font-medium text-foreground">{item.sender}</span>
                <span className="text-[12px] text-muted-foreground shrink-0">{item.time}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-2 mb-2">{item.body}</p>
              <button
                onClick={() => handleAcknowledge(item.id)}
                disabled={ack}
                className={`text-[12px] px-3 py-1.5 rounded-md border transition-all duration-150 cursor-pointer ${
                  ack
                    ? "border-success text-success"
                    : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                }`}
              >
                {ack ? "\u2713 Acknowledged" : "Acknowledge"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
