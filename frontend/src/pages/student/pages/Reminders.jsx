/**
 * @page Reminders
 * @description A collection of "pinned" alerts that require student action.
 */
import { BellRing, CheckCircle2, Trash2 } from "lucide-react";

export default function Reminders() {
  const tasks = [
    {
      id: 1,
      title: "Submit IT Assignment",
      deadline: "Tomorrow, 23:59",
      status: "Pending",
    },
    {
      id: 2,
      title: "Register for Sports Gala",
      deadline: "Feb 20",
      status: "Done",
    },
  ];

  return (
    <div className="pt-24 px-6 pb-20 max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-black text-white italic tracking-tighter">
        REMINDERS
      </h2>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="glass p-5 rounded-3xl border border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-xl ${task.status === "Done" ? "bg-green-500/20 text-green-500" : "bg-blue-600/20 text-blue-500"}`}
              >
                {task.status === "Done" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <BellRing size={20} />
                )}
              </div>
              <div>
                <h4
                  className={`text-sm font-bold ${task.status === "Done" ? "text-neutral-600 line-through" : "text-white"}`}
                >
                  {task.title}
                </h4>
                <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5">
                  Due: {task.deadline}
                </p>
              </div>
            </div>
            <button className="text-neutral-700 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
