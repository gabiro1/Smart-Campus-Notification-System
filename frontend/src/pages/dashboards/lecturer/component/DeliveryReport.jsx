/**
 * @component DeliveryReport
 * @description Real-time tracking of broadcast success.
 * WHY: Provides the lecturer with proof that the class was notified.
 */
export default function DeliveryReport({ totalStudents, deliveredCount }) {
  const failed = totalStudents - deliveredCount;

  return (
    <div className="glass p-6 rounded-3xl border border-white/5 mt-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-xs text-neutral-500 font-bold uppercase">
            Delivery Success
          </p>
          <p className="text-2xl font-black text-white">
            {Math.round((deliveredCount / totalStudents) * 100)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-red-400 font-bold">
            {failed} Pending/Failed
          </p>
          <button className="text-[10px] text-blue-400 underline hover:text-blue-300">
            Resend to Pending
          </button>
        </div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-blue-600"
          style={{ width: `${(deliveredCount / totalStudents) * 100}%` }}
        />
        <div
          className="h-full bg-red-500/50"
          style={{ width: `${(failed / totalStudents) * 100}%` }}
        />
      </div>
    </div>
  );
}
