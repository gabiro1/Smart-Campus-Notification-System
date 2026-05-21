import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  ClipboardCheck,
  Calendar,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import governanceService from "../../../../services/governanceService";
import toast from "react-hot-toast";

export default function PrincipalApprovals() {
  const [loading, setLoading] = useState(true);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const [eventsRes, announcementsRes] = await Promise.all([
        governanceService.getPendingEvents().catch(() => ({ events: [] })),
        governanceService.getPendingAnnouncements().catch(() => null),
      ]);
      setPendingEvents(eventsRes.events || []);
      setPendingAnnouncements(announcementsRes?.data || announcementsRes?.announcements || []);
    } catch (error) {
      toast.error("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === "event") {
        await governanceService.approveEvent(id);
        setPendingEvents(prev => prev.filter(e => e._id !== id));
      } else {
        await governanceService.approveAnnouncement(id);
        setPendingAnnouncements(prev => prev.filter(a => a._id !== id));
      }
      toast.success("Approved successfully");
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (id, type) => {
    try {
      if (type === "event") {
        await governanceService.rejectEvent(id);
        setPendingEvents(prev => prev.filter(e => e._id !== id));
      } else {
        await governanceService.rejectAnnouncement(id);
        setPendingAnnouncements(prev => prev.filter(a => a._id !== id));
      }
      toast.success("Rejected");
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  const totalPending = pendingEvents.length + pendingAnnouncements.length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <header className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Approvals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve pending events and announcements.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard delay={0.1} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Pending</p>
              <p className="text-xl font-bold text-foreground">{totalPending}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Events</p>
              <p className="text-xl font-bold text-foreground">{pendingEvents.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Announcements</p>
              <p className="text-xl font-bold text-foreground">{pendingAnnouncements.length}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Pending Events */}
      <GlassCard padding="p-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Pending Events</h3>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="p-6">
                <div className="animate-pulse h-16 bg-white/10 rounded" />
              </div>
            ))
          ) : pendingEvents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p>No pending events.</p>
            </div>
          ) : (
            pendingEvents.map((event) => (
              <div key={event._id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {event.startDate ? new Date(event.startDate).toLocaleDateString() : "No date"} • {event.organizer?.name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(event._id, "event")}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleApprove(event._id, "event")}
                    className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Pending Announcements */}
      <GlassCard padding="p-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Pending Announcements</h3>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="p-6">
                <div className="animate-pulse h-16 bg-white/10 rounded" />
              </div>
            ))
          ) : pendingAnnouncements.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              <p>No pending announcements.</p>
            </div>
          ) : (
            pendingAnnouncements.map((announcement) => (
              <div key={announcement._id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                    <Bell size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground truncate">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {announcement.priority || "Normal"} • {announcement.createdBy?.name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(announcement._id, "announcement")}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleApprove(announcement._id, "announcement")}
                    className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}