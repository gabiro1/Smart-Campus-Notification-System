import Badge from "../shared/Badge";

export default function DeadlinesCard({ deadlines }) {
  const items = deadlines || [
    { id: 1, title: "AI Project Proposal", dueTime: "23:59", urgent: true },
    { id: 2, title: "Database Assignment", dueTime: "18:00", urgent: false },
  ];
  const urgentCount = items.filter((d) => d.urgent).length;

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <h4 className="text-[14px] font-medium text-foreground">Deadlines</h4>
        <Badge variant="danger">
          {urgentCount} due today
        </Badge>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-muted rounded-md p-3 border-l-2 border-l-destructive"
          >
            <p className="text-[14px] text-foreground">{item.title}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Due: {item.dueTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
