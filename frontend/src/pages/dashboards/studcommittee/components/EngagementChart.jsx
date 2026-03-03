/**
 * @component EngagementChart
 * @description Visualizes how students are responding to specific portfolio updates.
 */
export default function EngagementChart() {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5">
      <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">
        Interaction Impact
      </h4>
      <div className="flex items-end justify-around h-32 gap-2">
        {[40, 70, 90, 50].map((h, i) => (
          <div
            key={i}
            className="w-full bg-white/5 rounded-t-lg relative group"
          >
            <div
              style={{ height: `${h}%` }}
              className="bg-blue-600 rounded-t-lg transition-all group-hover:bg-blue-400"
            />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-neutral-600 uppercase font-bold">
              {["Mon", "Tue", "Wed", "Thu"][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
