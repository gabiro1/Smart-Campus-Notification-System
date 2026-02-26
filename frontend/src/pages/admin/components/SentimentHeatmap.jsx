/**
 * @component SentimentHeatmap
 * @description Visualizes student satisfaction using data from the Feed Rating Modals.
 * Helps Admins understand the "Value" of their alerts per department.
 */

export default function SentimentHeatmap() {
  const depts = [
    { name: "IT", score: 4.8, status: "High" },
    { name: "CS", score: 4.2, status: "High" },
    { name: "Mech", score: 2.1, status: "Critical" },
  ];

  return (
    <div className="glass p-6 rounded-[32px] border border-white/5">
      <h3 className="text-lg font-bold mb-6">Student Sentiment Heatmap</h3>
      <div className="space-y-4">
        {depts.map((dept) => (
          <div key={dept.name} className="flex items-center gap-4">
            <div className="w-20 text-xs font-bold text-neutral-400">
              {dept.name}
            </div>
            <div className="flex-1 h-8 rounded-xl bg-white/5 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(dept.score / 5) * 100}%` }}
                className={`h-full ${dept.score > 4 ? "bg-green-500/40" : dept.score > 3 ? "bg-blue-500/40" : "bg-red-500/40"}`}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {dept.score} / 5.0 Rating
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
