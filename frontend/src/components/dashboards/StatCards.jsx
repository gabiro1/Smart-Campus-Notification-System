import { Inbox, CheckCircle, Megaphone, Clock } from "lucide-react";

const cards = [
  { icon: Inbox, metric: "3 Unread", label: "Messages", unread: true },
  { icon: CheckCircle, metric: "94%", label: "Attendance", unread: false },
  { icon: Megaphone, metric: "2 New", label: "Announcements", unread: true },
  { icon: Clock, metric: "2 Today", label: "Deadlines", unread: false },
];

export default function StatCards({ stats }) {
  const resolved = cards.map((card) => {
    if (card.label === "Messages") {
      return { ...card, metric: stats?.messages != null ? `${stats.messages} Unread` : card.metric };
    }
    if (card.label === "Attendance") {
      return { ...card, metric: stats?.attendance != null ? `${stats.attendance}%` : card.metric };
    }
    if (card.label === "Announcements") {
      return { ...card, metric: stats?.announcements != null ? `${stats.announcements} New` : card.metric };
    }
    if (card.label === "Deadlines") {
      return { ...card, metric: stats?.deadlines != null ? `${stats.deadlines} Today` : card.metric };
    }
    return card;
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {resolved.map((card, i) => (
        <div
          key={i}
          className="relative bg-card border border-border rounded-lg p-4 sm:p-5"
        >
          {card.unread && (
            <span className="absolute top-3 right-3 w-[6px] h-[6px] rounded-full bg-[#4ADE80]" />
          )}
          <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
            <card.icon size={16} className="text-muted-foreground" />
          </div>
          <p className="text-xl sm:text-[24px] font-semibold text-foreground mt-3">
            {card.metric}
          </p>
          <p className="text-[13px] text-muted-foreground mt-0.5">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
