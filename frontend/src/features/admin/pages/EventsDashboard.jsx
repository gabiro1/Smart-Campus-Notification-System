import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Clock,
  Users,
  CalendarDays,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import GlassCard from "@/components/cards/GlassCard";
import adminService from "../../../services/adminService";
import toast from "react-hot-toast";

const EVENTS_STATUS = {
  upcoming: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "Upcoming" },
  ongoing: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", label: "Ongoing" },
  completed: { color: "text-neutral-400", bg: "bg-neutral-500/10", border: "border-neutral-500/30", label: "Completed" },
  cancelled: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "Cancelled" },
};

function GlassCardWrapper({ children, className = "" }) {
  return (
    <div
      className={`bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function EventsDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCollege, setFilterCollege] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (filterCollege) filters.school = filterCollege;

      const data = await adminService.getAllEvents(page, 12, filters);
      const allEvents = data.events || [];
      
      // Enrich with computed status based on dates
      const now = new Date();
      let enriched = allEvents.map(e => {
        const eventDate = new Date(e.date);
        if (e.status === "cancelled") return { ...e, computedStatus: "cancelled" };
        if (eventDate > now) return { ...e, computedStatus: "upcoming" };
        return { ...e, computedStatus: "completed" };
      });
      
      // Filter by computed status client-side
      if (filterStatus !== "all") {
        enriched = enriched.filter(e => e.computedStatus === filterStatus);
      }
      
      setEvents(enriched);
      setTotalPages(data.pagination?.pages || 1);
      setTotalEvents(data.pagination?.total || 0);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filterCollege, filterStatus, page]);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await adminService.deleteEvent(eventId);
      toast.success("Event deleted");
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleEdit = (event) => {
    navigate(`/admin/events/edit/${event._id || event.id}`, { state: { event } });
  };

  const handleView = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const stats = useMemo(() => ({
    total: totalEvents,
    upcoming: events.filter(e => e.computedStatus === "upcoming").length,
    completed: events.filter(e => e.computedStatus === "completed").length,
  }), [events, totalEvents]);

  return (
    <div className="p-8 w-full text-white space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl border border-white/5 bg-blue-500/10">
              <CalendarDays className="text-blue-400" size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Event Management</h1>
              <p className="text-sm text-neutral-400 mt-1">Manage and monitor all campus events</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/admin/events/create")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Create Event</span>
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Total Events", value: stats.total, icon: CalendarDays, color: "text-blue-400", iconBg: "bg-blue-500/10" },
            { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-amber-400", iconBg: "bg-amber-500/10" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-400", iconBg: "bg-green-500/10" },
            { label: "Cancelled", value: 0, icon: AlertCircle, color: "text-red-400", iconBg: "bg-red-500/10" },
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

      {/* Filters */}
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
          <option value="upcoming" className="bg-neutral-900">Upcoming</option>
          <option value="completed" className="bg-neutral-900">Completed</option>
          <option value="cancelled" className="bg-neutral-900">Cancelled</option>
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

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/2 mb-4" />
              <div className="h-3 bg-white/5 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CalendarDays size={48} className="text-neutral-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
          <p className="text-neutral-400">Adjust your filters or create a new event.</p>
        </GlassCard>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {events.map((event, i) => {
              const status = EVENTS_STATUS[event.computedStatus] || EVENTS_STATUS.completed;
              return (
                <motion.div
                  key={event._id || event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden hover:border-blue-500/30 transition-all cursor-pointer"
                  onClick={() => handleView(event)}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${status.bg} ${status.color} border ${status.border}`}>
                        {status.label}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }} className="p-1.5 rounded-lg hover:bg-white/5"><Edit2 size={12} className="text-neutral-400" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(event._id || event.id); }} className="p-1.5 rounded-lg hover:bg-red-500/20"><Trash2 size={12} className="text-red-400" /></button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 text-sm">{event.title}</h3>
                    <div className="space-y-2 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-blue-400 shrink-0" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-amber-400 shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-purple-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                      <div className="flex-1">
                        <p className="text-[10px] text-neutral-500 font-medium">Target</p>
                        <p className="text-sm font-medium text-neutral-300 truncate">
                          {event.targetSchool || event.targetCollege || "All Campus"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <GlassCardWrapper className="min-w-0">
            <table className="w-full">
              <thead className="border-b border-white/5 text-xs uppercase text-neutral-500 tracking-wider">
                <tr>
                  <th className="p-4 text-left font-medium">Event</th>
                  <th className="p-4 text-left font-medium">Date & Time</th>
                  <th className="p-4 text-left font-medium">Location</th>
                  <th className="p-4 text-left font-medium hidden sm:table-cell">Target</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {events.map((event, i) => {
                    const status = EVENTS_STATUS[event.computedStatus] || EVENTS_STATUS.completed;
                    return (
                      <motion.tr
                        key={event._id || event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0"
                      >
                        <td className="p-4">
                          <p className="font-medium text-white text-sm">{event.title}</p>
                          <p className="text-xs text-neutral-500">{new Date(event.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-white">{new Date(event.date).toLocaleDateString()}</p>
                          <p className="text-xs text-neutral-400">{event.time}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-white truncate max-w-[120px]">{event.location}</p>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <p className="text-sm text-white">{event.targetSchool || event.targetCollege || "All"}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${status.bg} ${status.color} border ${status.border}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleView(event)} className="p-2 rounded-lg hover:bg-white/5"><Eye size={14} className="text-neutral-400" /></button>
                            <button onClick={() => handleEdit(event)} className="p-2 rounded-lg hover:bg-white/5"><Edit2 size={14} className="text-neutral-400" /></button>
                            <button onClick={() => handleDelete(event._id || event.id)} className="p-2 rounded-lg hover:bg-red-500/20"><Trash2 size={14} className="text-red-400" /></button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </GlassCardWrapper>
        </div>
      )}

      {/* Pagination */}
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

      {/* Event Detail Modal */}
      <AnimatePresence>
        {showModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl w-full sm:max-w-2xl p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${EVENTS_STATUS[selectedEvent.computedStatus]?.bg} ${EVENTS_STATUS[selectedEvent.computedStatus]?.color} border ${EVENTS_STATUS[selectedEvent.computedStatus]?.border}`}>
                    {EVENTS_STATUS[selectedEvent.computedStatus]?.label}
                  </span>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-neutral-400">
                    <X size={18} />
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{selectedEvent.title}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-neutral-500 mb-1">
                      <Calendar size={12} />
                      <span className="text-[10px] uppercase font-medium">Date</span>
                    </div>
                    <p className="font-medium text-white text-sm">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-neutral-500 mb-1">
                      <Clock size={12} />
                      <span className="text-[10px] uppercase font-medium">Time</span>
                    </div>
                    <p className="font-medium text-white text-sm">{selectedEvent.time}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-neutral-500 mb-1">
                      <MapPin size={12} />
                      <span className="text-[10px] uppercase font-medium">Location</span>
                    </div>
                    <p className="font-medium text-white text-sm">{selectedEvent.location}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-neutral-500 mb-1">
                      <Users size={12} />
                      <span className="text-[10px] uppercase font-medium">Target</span>
                    </div>
                    <p className="font-medium text-white text-sm">{selectedEvent.targetSchool || selectedEvent.targetCollege || "All Campus"}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[10px] uppercase text-neutral-500 font-medium mb-2">Description</h4>
                  <p className="text-sm text-neutral-300 leading-relaxed bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    {selectedEvent.description || "No description provided."}
                  </p>
                </div>

                {selectedEvent.tags?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[10px] uppercase text-neutral-500 font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-white/[0.02] border border-white/5 rounded-lg text-xs text-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => { setShowModal(false); handleEdit(selectedEvent); }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors text-sm"
                  >
                    Edit Event
                  </button>
                  <button
                    onClick={() => { setShowModal(false); handleDelete(selectedEvent._id || selectedEvent.id); }}
                    className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
