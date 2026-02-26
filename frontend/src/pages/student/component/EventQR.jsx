/**
 * @component EventQR
 * @description Generates a unique check-in code for the student.
 * ROLE: Validates physical presence to improve AI recommendation accuracy.
 */

export default function EventQR({ eventId }) {
  return (
    <div className="glass p-8 rounded-[40px] border border-white/10 flex flex-col items-center text-center">
      <div className="w-48 h-48 bg-white rounded-3xl p-4 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        {/* Placeholder for QR Code library output */}
        <div className="w-full h-full bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-700 font-mono text-xs">
          QR_CODE_GEN_V2
        </div>
      </div>
      <h4 className="text-white font-bold">Check-in at Event</h4>
      <p className="text-neutral-500 text-xs mt-2">
        Show this to the event organizer to confirm your attendance.
      </p>
    </div>
  );
}
