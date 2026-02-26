export default function NotificationInbox() {
  const notifications = [
    {
      id: 1,
      title: "Venue Changed",
      body: "Level 4 IT Exam moved to Lab 2",
      type: "urgent",
    },
    {
      id: 2,
      title: "New Forum",
      body: "Cybersecurity talk tomorrow",
      type: "standard",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <h2 className="text-2xl font-bold mb-8">Alert Inbox</h2>
      <div className="space-y-4 max-w-2xl mx-auto">
        {notifications.map((n) => (
          <motion.div
            whileHover={{ scale: 1.01 }}
            key={n.id}
            className={`p-5 rounded-2xl glass border ${n.type === "urgent" ? "border-red-500/30" : "border-white/5"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4
                  className={`font-bold ${n.type === "urgent" ? "text-red-400" : "text-white"}`}
                >
                  {n.title}
                </h4>
                <p className="text-neutral-400 text-sm mt-1">{n.body}</p>
              </div>
              <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">
                {n.type}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
