import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, Loader2, Send, Sparkles, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CreatorDashboard from "../../../../features/events/pages/CreatorDashboard";
import EventForm from "../../../../features/events/pages/EventForm";
import eventService from "../../../../services/eventService";

const STATUS_STYLE = {
  DRAFT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PENDING_REVIEW: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  UNDER_REVIEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  NEEDS_REVISION: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  PUBLISHED: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-muted",
};

function formatStatus(status) {
  return status ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Draft";
}

function formatDate(date) {
  if (!date) return "Date pending";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EventApplicationPanel() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.getMyEvents({ page: 1, limit: 20 });
      setRequests(data.events || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      const res = await eventService.createDraft(data);
      const eventId = res.event?._id || res._id;
      if (eventId) await eventService.submitForReview(eventId);
      toast.success("Event application submitted to Guild President review");
      fetchRequests();
      return eventId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit event application");
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Apply for Event</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Submit departmental event requests for Guild President approval
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
          <Send size={14} />
          Guild review queue
        </div>
      </div>

      <EventForm
        initialData={null}
        isDirectPublish={false}
        onSubmit={handleCreate}
        onCancel={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar size={18} className="text-muted-foreground" />
            Your Event Applications
          </h3>
          {submitting && (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={13} className="animate-spin" />
              Submitting
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <div key={item} className="h-20 bg-[#0B121F] border border-white/[0.06] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-muted/20">
            <Calendar size={24} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">No event applications yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {requests.map((event, index) => {
              const StatusIcon = event.status === "APPROVED" || event.status === "PUBLISHED"
                ? CheckCircle2
                : event.status === "REJECTED"
                ? XCircle
                : Clock;

              return (
                <motion.button
                  key={event._id}
                  onClick={() => navigate(`/hod/events/${event._id}`)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-start gap-3 bg-[#0B121F] border border-white/[0.06] rounded-xl p-4 hover:border-emerald-500/30 transition-all group text-left w-full"
                >
                  {event.posterUrl ? (
                    <img src={event.posterUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate group-hover:text-emerald-400 transition-colors">
                        {event.title}
                      </span>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                        STATUS_STYLE[event.status] || "bg-white/5 text-muted-foreground border-white/10"
                      }`}>
                        <StatusIcon size={10} />
                        {formatStatus(event.status)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDate(event.startDate)}{event.venue ? ` - ${event.venue}` : ""}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DepartmentEvents() {
  const [activeTab, setActiveTab] = useState("applications");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Apply for departmental events and track your submitted requests.
          </p>
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto">
          {[
            { id: "applications", label: "Apply for Event" },
            { id: "manage", label: "My Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-white/[0.08] text-foreground border border-white/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "applications" ? <EventApplicationPanel /> : <CreatorDashboard />}
    </div>
  );
}
