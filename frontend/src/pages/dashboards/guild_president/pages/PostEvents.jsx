import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Filter, ChevronLeft, ChevronRight, X,
  MapPin, Clock, Users, Tag, CalendarDays, MoreVertical,
  Edit2, Eye, Trash2, LayoutGrid, List, Calendar,
  AlertCircle, CheckCircle, Send, ShieldCheck, Ban, FileText,
  Loader2, MessageSquare
} from "lucide-react";
import GlassCard from "@/components/cards/GlassCard";
import eventService from "../../../../services/eventService";
import EventForm from "../../../../features/events/pages/EventForm";
import toast from "react-hot-toast";

const STATUS_STYLE = {
  DRAFT: { color: "text-muted-foreground", bg: "bg-muted", border: "border-muted", label: "Draft" },
  PENDING_REVIEW: { color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", label: "Pending" },
  UNDER_REVIEW: { color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30", label: "Under Review" },
  NEEDS_REVISION: { color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", label: "Needs Revision" },
  APPROVED: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", label: "Approved" },
  REJECTED: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", label: "Rejected" },
  SCHEDULED: { color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30", label: "Scheduled" },
  PUBLISHED: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", label: "Published" },
  CANCELLED: { color: "text-muted-foreground", bg: "bg-muted", border: "border-muted", label: "Cancelled" },
};

export default function GuildPostEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (filterStatus !== "all") params.status = filterStatus;
      const res = await eventService.getEvents(params);
      const list = res.events || res.data || [];
      setEvents(list);
      setTotalPages(res.pagination?.pages || 1);
      setTotalEvents(res.pagination?.total || list.length);
    } catch {
      toast.error("Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(), 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus, page]);

  const handleCreatePublish = async (data) => {
    try {
      await eventService.createAndPublish(data);
      setShowForm(false);
      toast.success("Event published successfully!");
      fetchEvents();
    } catch (err) {
      const serverErrors = err.response?.data;
      if (serverErrors?.errors?.length) {
        toast.error(serverErrors.errors.map(e => e.message).join(', '));
      } else {
        toast.error(serverErrors?.message || "Failed to publish event");
      }
      throw err;
    }
  };

  const handleUpdate = async (data) => {
    if (!editingEvent) return;
    try {
      await eventService.updateEvent(editingEvent._id, data);
      setEditingEvent(null);
      toast.success("Event updated successfully!");
      fetchEvents();
    } catch (err) {
      const serverErrors = err.response?.data;
      if (serverErrors?.errors?.length) {
        toast.error(serverErrors.errors.map(e => e.message).join(', '));
      } else {
        toast.error(serverErrors?.message || "Failed to update event");
      }
      throw err;
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) return;
    try {
      await eventService.deleteEvent(eventId);
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete event");
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm("Cancel this event?")) return;
    try {
      await eventService.cancelEvent(eventId);
      toast.success("Event cancelled");
      fetchEvents();
    } catch {
      toast.error("Failed to cancel event");
    }
  };

  const handleSubmitForReview = async (eventId) => {
    try {
      await eventService.submitForReview(eventId);
      toast.success("Submitted for review");
      fetchEvents();
    } catch {
      toast.error("Failed to submit");
    }
  };

  const stats = useMemo(() => ({
    total: totalEvents,
    published: events.filter(e => e.status === "PUBLISHED").length,
    pending: events.filter(e => e.status === "PENDING_REVIEW" || e.status === "UNDER_REVIEW").length,
  }), [events, totalEvents]);

  return (
    <div className="p-4 lg:p-6 w-full text-foreground">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CalendarDays className="text-emerald-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Event Management</h1>
              <p className="text-sm text-muted-foreground">Create, manage and oversee all campus events</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingEvent(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Publish Event</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Total Events", value: stats.total, icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-500/15" },
            { label: "Published", value: stats.published, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/15" },
            { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/15" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={14} className={stat.color} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search events..."
            className="w-full bg-card border border-border rounded-xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-card border border-border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-foreground focus:outline-none whitespace-nowrap"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_REVIEW">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <div className="flex bg-card border border-border rounded-xl overflow-hidden shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 sm:p-3 ${viewMode === "grid" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 sm:p-3 ${viewMode === "list" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List size={16} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {(showForm || editingEvent) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-8 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => { setShowForm(false); setEditingEvent(null); }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="w-full max-w-4xl mx-4"
            >
              <EventForm
                initialData={editingEvent}
                isDirectPublish={true}
                onSubmit={editingEvent ? handleUpdate : handleCreatePublish}
                onCancel={() => { setShowForm(false); setEditingEvent(null); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-accent rounded w-1/2 mb-4" />
              <div className="h-3 bg-accent rounded w-3/4" />
              <div className="h-3 bg-accent rounded w-1/3 mt-2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CalendarDays size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Events Found</h3>
          <p className="text-muted-foreground">Adjust your filters or publish a new event.</p>
        </GlassCard>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {events.map((event, i) => {
              const s = STATUS_STYLE[event.status] || STATUS_STYLE.DRAFT;
              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${s.bg} ${s.color} border ${s.border}`}>
                      {s.label}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingEvent(event); setShowForm(true); }} className="p-1.5 sm:p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(event._id)} className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base">{event.title}</h3>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-emerald-400" />
                      <span>{new Date(event.startDate || event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-amber-400" />
                      <span>{event.startTime || event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-purple-400" />
                      <span className="truncate">{event.venue || event.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                    {event.status === "DRAFT" && (
                      <>
                        <button onClick={() => handleSubmitForReview(event._id)} className="flex-1 px-2 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-1">
                          <Send size={11} /> Submit
                        </button>
                        <button onClick={() => handleCancel(event._id)} className="px-2 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors">
                          <Ban size={11} />
                        </button>
                      </>
                    )}
                    {event.status === "CANCELLED" && (
                      <button onClick={() => handleDelete(event._id)} className="flex-1 px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
                        Delete Permanently
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <GlassCard padding="p-0" className="min-w-0">
            <table className="w-full">
              <thead className="bg-card border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="p-3 sm:p-4 text-left">Event</th>
                  <th className="p-3 sm:p-4 text-left">Date & Time</th>
                  <th className="p-3 sm:p-4 text-left hidden sm:table-cell">Venue</th>
                  <th className="p-3 sm:p-4 text-left">Status</th>
                  <th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {events.map((event, i) => {
                    const s = STATUS_STYLE[event.status] || STATUS_STYLE.DRAFT;
                    return (
                      <motion.tr
                        key={event._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        <td className="p-3 sm:p-4">
                          <p className="font-medium text-foreground text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.category}</p>
                        </td>
                        <td className="p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-foreground">{new Date(event.startDate || event.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{event.startTime || event.time}</p>
                        </td>
                        <td className="p-3 sm:p-4 hidden sm:table-cell">
                          <p className="text-xs sm:text-sm text-foreground truncate max-w-[120px]">{event.venue || event.location || "-"}</p>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${s.bg} ${s.color} border ${s.border}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => { setEditingEvent(event); setShowForm(true); }}
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            {event.status === "DRAFT" && (
                              <button
                                onClick={() => handleSubmitForReview(event._id)}
                                className="p-1.5 sm:p-2 rounded-lg hover:bg-amber-500/20 text-amber-400"
                                title="Submit for review"
                              >
                                <Send size={14} />
                              </button>
                            )}
                            {event.status !== "CANCELLED" && event.status !== "REJECTED" && (
                              <button
                                onClick={() => handleCancel(event._id)}
                                className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                                title="Cancel"
                              >
                                <Ban size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(event._id)}
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <span className="text-sm text-muted-foreground order-2 sm:order-1">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 sm:p-3 bg-card border border-border rounded-xl hover:bg-accent disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 sm:p-3 bg-card border border-border rounded-xl hover:bg-accent disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
