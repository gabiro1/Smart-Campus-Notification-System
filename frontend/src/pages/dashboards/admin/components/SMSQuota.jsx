/**
 * @component SMSQuota
 * @description Monitors the SMS fallback budget.
 * Essential for managing costs related to offline critical alerts.
 */

export default function SMSQuota() {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-neutral-900 to-black">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
          SMS Fallback Budget
        </h4>
        <span className="text-xs text-blue-400">Monthly Reset</span>
      </div>
      <div className="text-3xl font-black text-white mb-2">
        1,240 <span className="text-xs text-neutral-600">/ 5,000</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="w-[25%] h-full bg-blue-600" />
      </div>
      <p className="text-[10px] text-neutral-500 mt-4 leading-relaxed">
        Offline alerts are sent automatically when a critical message is unread
        for 30 minutes.
      </p>
    </div>
  );
}
