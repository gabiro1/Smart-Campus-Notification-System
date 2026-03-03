/**
 * @page AuditLogs
 * @description Provides a transparent history of every administrative action.
 * Essential for accountability in a large institution.
 */
const LOGS = [
  {
    action: "Role Elevated",
    actor: "Super-Admin",
    target: "Mutoni K.",
    date: "Feb 15, 14:20",
  },
  {
    action: "Emergency Broadcast",
    actor: "HoD IT",
    target: "All Students",
    date: "Feb 14, 09:00",
  },
];

export default function AuditLogs() {
  return (
    <div className="glass p-8 rounded-[40px] border border-white/5">
      <h2 className="text-xl font-bold mb-6">System Audit Trail</h2>
      <div className="space-y-4">
        {LOGS.map((log, i) => (
          <div
            key={i}
            className="flex justify-between p-4 bg-white/5 rounded-2xl text-sm"
          >
            <span className="text-blue-400 font-bold">{log.actor}</span>
            <span className="text-white">{log.action}</span>
            <span className="text-neutral-500">{log.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
