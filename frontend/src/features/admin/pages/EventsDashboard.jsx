import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, ChevronLeft, ChevronRight, X,
  MapPin, Clock, Users, CalendarDays,
  Edit2, Trash2, LayoutGrid, List, Calendar,
  AlertCircle, CheckCircle, Send, ShieldCheck, Ban, FileText,
  Loader2, MessageSquare
} from "lucide-react";
import GlassCard from "@/components/cards/GlassCard";
import eventService from "../../../services/eventService";
import EventForm from "../../../features/events/pages/EventForm";
import toast from "react-hot-toast";

const STATUS_STYLE = {
  DRAFT: { color: "text-neutral-400", bg: "bg-neutral-500/15", border: "border-neutral-500/30", label: "Draft" },
  PENDING_REVIEW: { color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", label: "Pending" },
  UNDER_REVIEW: { color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30", label: "Under Review" },
  NEEDS_REVISION: { color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", label: "Needs Revision" },
  APPROVED: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", label: "Approved" },
  REJECTED: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", label: "Rejected" },
  SCHEDULED: { color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30", label: "Scheduled" },
  PUBLISHED: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", label: "Published" },
  CANCELLED: { color: "text-neutral-400", bg: "bg-neutral-500/15", border: "border-neutral-500/30", label: "Cancelled" },
};

export default function EventsDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCollege, setFilterCollege] = useState("");
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
      if (filterCollege) params.school = filterCollege;
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
  }, [search, filterStatus, filterCollege, page]);

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
    <div className="p-8 w-full text-white space-y-6">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl border border-white/5 bg-blue-500/10">
              <CalendarDays className="text-blue-400" size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Event Management</h1>
              <p className="text-sm text-neutral-400 mt-1">Create, manage and oversee all campus events</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingEvent(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Publish Event</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Total Events", value: stats.total, icon: CalendarDays, color: "text-blue-400", iconBg: "bg-blue-500/10" },
            { label: "Published", value: stats.published, icon: CheckCircle, color: "text-emerald-400", iconBg: "bg-emerald-500/10" },
            { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-400", iconBg: "bg-amber-500/10" },
            { label: "Drafts", value: events.filter(e => e.status === "DRAFT").length, icon: FileText, color: "text-neutral-400", iconBg: "bg-neutral-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative z-10 flex items-center gap-3">
                <div className={`p-3 rounded-xl border border-white/5 ${stat.iconBg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search events..."
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 transition-colors backdrop-blur-xl"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 backdrop-blur-xl"
        >
          <option value="all" className="bg-neutral-900">All Status</option>
          <option value="DRAFT" className="bg-neutral-900">Draft</option>
          <option value="PENDING_REVIEW" className="bg-neutral-900">Pending</option>
          <option value="APPROVED" className="bg-neutral-900">Approved</option>
          <option value="PUBLISHED" className="bg-neutral-900">Published</option>
          <option value="SCHEDULED" className="bg-neutral-900">Scheduled</option>
          <option value="REJECTED" className="bg-neutral-900">Rejected</option>
          <option value="CANCELLED" className="bg-neutral-900">Cancelled</option>
        </select>

        <select
          value={filterCollege}
          onChange={(e) => { setFilterCollege(e.target.value); setPage(1); }}
          className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 backdrop-blur-xl"
        >
          <option value="" className="bg-neutral-900">All Colleges</option>
          <option value="CST" className="bg-neutral-900">CST</option>
          <option value="CBE" className="bg-neutral-900">CBE</option>
          <option value="CMHS" className="bg-neutral-900">CMHS</option>
        </select>

        <div className="flex bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden shrink-0 backdrop-blur-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 ${viewMode === "grid" ? "bg-blue-500/20 text-blue-400" : "text-neutral-500 hover:text-neutral-300"} transition-colors`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-3 ${viewMode === "list" ? "bg-blue-500/20 text-blue-400" : "text-neutral-500 hover:text-neutral-300"} transition-colors`}
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
            <div key={i} className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-pulse shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative z-10">
                <div className="h-4 bg-white/5 rounded w-1/2 mb-4" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CalendarDays size={48} className="text-neutral-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
          <p className="text-neutral-400">Adjust your filters or publish a new event.</p>
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
                  className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden hover:border-blue-500/30 transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${s.bg} ${s.color} border ${s.border}`}>
                        {s.label}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingEvent(event); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-white/5"><Edit2 size={12} className="text-neutral-400" /></button>
                        <button onClick={() => handleDelete(event._id)} className="p-1.5 rounded-lg hover:bg-red-500/20"><Trash2 size={12} className="text-red-400" /></button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-2 line-clamp-2 text-sm">{event.title}</h3>
                    <div className="space-y-2 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-emerald-400 shrink-0" />
                        <span>{new Date(event.startDate || event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-amber-400 shrink-0" />
                        <span>{event.startTime || event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-purple-400 shrink-0" />
                        <span className="truncate">{event.venue || event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                      {event.status === "DRAFT" && (
                        <>
                          <button onClick={() => handleSubmitForReview(event._id)} className="flex-1 px-2 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-1">
                            <Send size={11} /> Submit
                          </button>
                          <button onClick={() => handleCancel(event._id)} className="px-2 py-1.5 rounded-lg bg-white/5 text-neutral-400 text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors">
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
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden min-w-0">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="relative z-10">
              <table className="w-full">
                <thead className="border-b border-white/5 text-xs uppercase text-neutral-500 tracking-wider">
                  <tr>
                    <th className="p-4 text-left font-medium">Event</th>
                    <th className="p-4 text-left font-medium">Date & Time</th>
                    <th className="p-4 text-left font-medium hidden sm:table-cell">Venue</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-right font-medium">Actions</th>
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
                          className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <td className="p-4">
                            <p className="font-medium text-white text-sm">{event.title}</p>
                            <p className="text-xs text-neutral-500">{event.category}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-white">{new Date(event.startDate || event.date).toLocaleDateString()}</p>
                            <p className="text-xs text-neutral-400">{event.startTime || event.time}</p>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <p className="text-sm text-white truncate max-w-[120px]">{event.venue || event.location || "-"}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${s.bg} ${s.color} border ${s.border}`}>
                              {s.label}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingEvent(event); setShowForm(true); }} className="p-2 rounded-lg hover:bg-white/5" title="Edit">
                                <Edit2 size={14} className="text-neutral-400" />
                              </button>
                              {event.status === "DRAFT" && (
                                <button onClick={() => handleSubmitForReview(event._id)} className="p-2 rounded-lg hover:bg-amber-500/20" title="Submit for review">
                                  <Send size={14} className="text-amber-400" />
                                </button>
                              )}
                              {event.status !== "CANCELLED" && event.status !== "REJECTED" && (
                                <button onClick={() => handleCancel(event._id)} className="p-2 rounded-lg hover:bg-red-500/20" title="Cancel">
                                  <Ban size={14} className="text-red-400" />
                                </button>
                              )}
                              <button onClick={() => handleDelete(event._id)} className="p-2 rounded-lg hover:bg-red-500/20" title="Delete">
                                <Trash2 size={14} className="text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-neutral-400 order-2 sm:order-1">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-3 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 transition-colors backdrop-blur-xl text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-3 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 transition-colors backdrop-blur-xl text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
