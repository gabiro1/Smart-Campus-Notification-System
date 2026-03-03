/**
 * @component StaffPerformance
 * @description Tracks lecturer communication frequency and student satisfaction within the department.
 */
export default function StaffPerformance() {
  const staff = [
    { name: "Dr. Jean", broadcasts: 45, rating: 4.9 },
    { name: "Prof. Mutoni", broadcasts: 12, rating: 3.5 },
  ];

  return (
    <div className="glass p-6 rounded-3xl border border-white/5">
      <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6">
        Staff Engagement
      </h3>
      <div className="space-y-6">
        {staff.map((s) => (
          <div key={s.name} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-white">{s.name}</p>
              <p className="text-[10px] text-neutral-500">
                {s.broadcasts} Alerts sent this semester
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-lg text-xs font-bold ${s.rating > 4 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}
            >
              ★ {s.rating}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
