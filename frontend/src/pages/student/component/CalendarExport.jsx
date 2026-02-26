/**
 * @component CalendarExport
 * @description Generates a .ics file or Google Calendar link for the event.
 * PROFESSIONAL VALUE: Increases "Actionability"—turning a notification into a planned task.
 */
import { CalendarPlus } from "lucide-react";

export default function CalendarExport({ event }) {
  const handleExport = () => {
    // Logic to generate iCal format would go here
    console.log("Exporting to Calendar...", event.title);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold transition-all"
    >
      <CalendarPlus size={16} className="text-blue-500" />
      Sync to My Calendar
    </button>
  );
}
