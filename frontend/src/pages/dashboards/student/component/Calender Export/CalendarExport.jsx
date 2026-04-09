/**
 * @component CalendarExport
 * @description Downloads an ICS calendar file for the event.
 * PROFESSIONAL VALUE: Increases "Actionability"—turning a notification into a planned task.
 */
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../../services/apiClient";

export default function CalendarExport({ event }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!event?._id) {
      toast.error("Event information missing");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get(`/events/${event._id}/calendar`, {
        responseType: 'blob' // Important for file download
      });

      // Create blob and download link
      const blob = new Blob([response.data], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-${event._id}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Calendar file downloaded");
    } catch (error) {
      console.error("Calendar export error:", error);
      toast.error(error.response?.data?.message || "Failed to export calendar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-accent hover:bg-primary/10 rounded-xl border border-border text-xs font-bold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <CalendarPlus size={16} className="text-blue-500" />
      {loading ? 'Exporting...' : 'Sync to My Calendar'}
    </button>
  );
}
