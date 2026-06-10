import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Sparkles, Clock, MapPin, User, Tag,
  X, Trash2, Edit3, ExternalLink, AlertCircle, CheckCircle2,
  Send, Ban, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EventForm from "../../../../features/events/pages/EventForm";
import eventService from "../../../../services/eventService";
import toast from "react-hot-toast";

const STATUS_STYLE = {
  DRAFT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PENDING_REVIEW: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  UNDER_REVIEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  NEEDS_REVISION: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  SCHEDULED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  PUBLISHED: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-muted",
};

function formatStatus(status) {
  if (!status) return "";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr) {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export default function MyEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchMyEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.getMyEvents({ page: 1, limit: 50 });
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyEvents(); }, [fetchMyEvents]);

  const handleCreate = async (data) => {
    try {
      const res = await eventService.createDraft(data);
      const eventId = res.event?._id || res._id;
      if (eventId) {
        await eventService.submitForReview(eventId);
      }
      toast.success("Event application submitted for review!");
      fetchMyEvents();
      return eventId;
    } catch {
      toast.error("Failed to submit event application");
    }
  };

  const handleUpdate = async (data) => {
    if (!editingEvent) return;
    try {
      await eventService.updateEvent(editingEvent._id, data);
      setEditingEvent(null);
      setShowForm(false);
      setSelectedEvent(null);
      toast.success("Event updated successfully!");
      fetchMyEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event permanently? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await eventService.deleteEvent(id);
      toast.success("Event deleted");
      setSelectedEvent(null);
      fetchMyEvents();
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this event?")) return;
    try {
      await eventService.cancelEvent(id);
      toast.success("Event cancelled");
      setSelectedEvent(null);
      fetchMyEvents();
    } catch {
      toast.error("Failed to cancel event");
    }
  };

  const handleSubmit = async (id) => {
    try {
      await eventService.submitForReview(id);
      toast.success("Submitted for review");
      setSelectedEvent(null);
      fetchMyEvents();
    } catch {
      toast.error("Failed to submit");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 lg:px-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate("/student/events")}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={16} className="text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              Apply for Event
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-[4.25rem]">
            Submit your event request for review
          </p>
        </div>
      </header>

      <div className="px-4 lg:px-6">
        <EventForm
          initialData={null}
          isDirectPublish={false}
          onSubmit={handleCreate}
          onCancel={() => navigate("/student/events")}
        />
      </div>

      <section className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-muted-foreground" />
          Your Requests
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-[#0B121F] border border-white/[0.06] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-muted/20">
            <Calendar size={24} className="text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">No requests yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map((event) => (
              <motion.button
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground truncate group-hover:text-emerald-400 transition-colors">
                      {event.title}
                    </span>
                    {event.status && (
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                        STATUS_STYLE[event.status] || "bg-white/5 text-muted-foreground border-white/10"
                      }`}>
                        {formatStatus(event.status)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatDate(event.startDate)}{event.venue ? ` · ${event.venue}` : ""}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 sm:p-5 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                    STATUS_STYLE[selectedEvent.status] || "bg-white/5 text-muted-foreground border-white/10"
                  }`}>
                    {formatStatus(selectedEvent.status)}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{selectedEvent.category}</span>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors shrink-0"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Poster */}
              {selectedEvent.posterUrl && (
                <div className="w-full aspect-video overflow-hidden">
                  <img
                    src={selectedEvent.posterUrl}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                {/* Title & Description */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                    {selectedEvent.title}
                  </h2>
                  {selectedEvent.description && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5 p-3 bg-accent/30 rounded-xl">
                    <Calendar size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(selectedEvent.startDate)}
                        {selectedEvent.endDate && ` - ${formatDate(selectedEvent.endDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 bg-accent/30 rounded-xl">
                    <Clock size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Time</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedEvent.startTime || "N/A"}
                        {selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 bg-accent/30 rounded-xl">
                    <MapPin size={14} className="text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Venue</p>
                      <p className="text-sm font-medium text-foreground">{selectedEvent.venue || "TBD"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 bg-accent/30 rounded-xl">
                    <User size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Organizer</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedEvent.organizerName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes / Feedback */}
                {selectedEvent.rejectionReason && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-300">
                      <span className="font-medium">Rejected: </span>
                      {selectedEvent.rejectionReason}
                    </p>
                  </div>
                )}
                {selectedEvent.revisionNotes && (
                  <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <AlertCircle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-orange-300">
                      <span className="font-medium">Revision requested: </span>
                      {selectedEvent.revisionNotes}
                    </p>
                  </div>
                )}

                {/* External Links */}
                {selectedEvent.externalRegistrationLink && (
                  <a
                    href={selectedEvent.externalRegistrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={14} /> Registration Link
                  </a>
                )}
                {selectedEvent.livestreamLink && (
                  <a
                    href={selectedEvent.livestreamLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={14} /> Livestream
                  </a>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                  {selectedEvent.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => { setEditingEvent(selectedEvent); setShowForm(true); }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleSubmit(selectedEvent._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <Send size={14} /> Submit for Review
                      </button>
                    </>
                  )}
                  {selectedEvent.status === "NEEDS_REVISION" && (
                    <button
                      onClick={() => { setEditingEvent(selectedEvent); setShowForm(true); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Edit3 size={14} /> Edit & Resubmit
                    </button>
                  )}
                  {["DRAFT", "PENDING_REVIEW", "APPROVED", "SCHEDULED"].includes(selectedEvent.status) && (
                    <button
                      onClick={() => handleCancel(selectedEvent._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Ban size={14} /> Cancel Event
                    </button>
                  )}
                  {["DRAFT", "CANCELLED", "REJECTED"].includes(selectedEvent.status) && (
                    <button
                      onClick={() => handleDelete(selectedEvent._id)}
                      disabled={deleting === selectedEvent._id}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      {deleting === selectedEvent._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form Modal */}
      <AnimatePresence>
        {(showForm && editingEvent) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-8 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => { setShowForm(false); setEditingEvent(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="w-full max-w-4xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <EventForm
                initialData={editingEvent}
                isDirectPublish={false}
                onSubmit={handleUpdate}
                onCancel={() => { setShowForm(false); setEditingEvent(null); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
