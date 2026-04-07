import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import notificationService from "../../services/notificationService";
import toast from "react-hot-toast";

/**
 * Emergency Alert Banner
 * Displays at the top of the student app when there are unacknowledged emergency notifications.
 * Sticky, red, with an acknowledgment button.
 */
const EmergencyBanner = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(false);

  // Fetch unacknowledged emergencies on mount and periodically
  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const response = await notificationService.getUnacknowledgedEmergencies();
        setEmergencies(response.notifications || []);
        setCount(response.count || 0);
      } catch (error) {
        console.error("Failed to fetch emergencies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencies();
    // Poll every 30 seconds
    const interval = setInterval(fetchEmergencies, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (notificationId) => {
    try {
      setDismissing(true);
      await notificationService.acknowledgeNotification(notificationId);
      toast.success("Alert acknowledged");

      // Remove from local state
      setEmergencies(prev => prev.filter(e => e._id !== notificationId));
      setCount(prev => Math.max(0, prev - 1));

      // If no more emergencies, hide banner after a brief delay
      if (emergencies.length <= 1) {
        setTimeout(() => {
          setEmergencies([]);
          setCount(0);
        }, 300);
      }
    } catch (error) {
      toast.error("Failed to acknowledge alert");
      console.error("Acknowledge error:", error);
    } finally {
      setDismissing(false);
    }
  };

  // Don't render if no emergencies or still loading
  if (loading || count === 0) return null;

  // Show the most recent emergency (highest priority)
  const latestEmergency = emergencies[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-700 to-red-600 text-white shadow-2xl animate-pulse-slow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-white/20 rounded-full">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-red-100">
              Campus Emergency Alert
            </div>
            <div className="text-sm font-medium line-clamp-1">
              {latestEmergency?.title || "Important notification requires your attention"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-xs text-red-100 font-medium shrink-0">
            {count} unacknowledged alert{count > 1 ? 's' : ''}
          </div>
          <button
            onClick={() => handleAcknowledge(latestEmergency._id)}
            disabled={dismissing}
            className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition-all shrink-0 flex items-center gap-2"
          >
            {dismissing ? (
              "Processing..."
            ) : (
              <>
                <X size={14} />
                I Understand
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;
