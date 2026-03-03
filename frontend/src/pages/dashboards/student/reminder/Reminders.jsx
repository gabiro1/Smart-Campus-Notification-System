import { Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";

export default function Reminders() {
  const reminders = [
    {
      id: 1,
      title: "Submit Final Year Project Proposal",
      date: "Tomorrow, 23:59",
      type: "AI-Pulse",
      priority: "high",
    },
    {
      id: 2,
      title: "Prepare for Java Presentation",
      date: "Wed, March 4",
      type: "Personal",
      priority: "medium",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">My Reminders</h1>
          <p className="text-neutral-500 text-sm">
            Deadlines and self-assigned tasks.
          </p>
        </div>
        <button className="bg-white text-black px-5 py-3 mr-8 rounded-sm text-xs font-bold flex items-center gap-2 hover:bg-neutral-200 transition-all">
          <Plus size={16} /> Add Task
        </button>
      </header>

      <div className="grid gap-4 ml-70 p-8 flex-1 max-w-[100vw] overflow-x-hidden">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="glass p-6 rounded-sm border border-white/5 flex items-center gap-6"
          >
            <div
              className={`p-4 rounded-sm ${r.priority === "high" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}
            >
              {r.priority === "high" ? (
                <AlertCircle size={24} />
              ) : (
                <Clock size={24} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                  {r.type}
                </span>
              </div>
              <h4 className="font-bold text-lg text-white">{r.title}</h4>
              <p className="text-neutral-500 text-xs font-medium mt-1">
                Due: {r.date}
              </p>
            </div>
            <button className="p-4 rounded-sm bg-white/5 text-neutral-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all">
              <CheckCircle2 size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
