/**
 * @component TimingOptimizer
 * @description Uses historical data to suggest the best time to broadcast an alert.
 * DEFENSE PITCH: "We optimize delivery for maximum attention, reducing the chance of missed news."
 */
export default function TimingOptimizer() {
  return (
    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-4">
      <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">
        AI
      </div>
      <div>
        <p className="text-xs font-bold text-white">Recommended Posting Time</p>
        <p className="text-[10px] text-neutral-400">
          Optimal engagement predicted at 12:45 PM today.
        </p>
      </div>
    </div>
  );
}
