import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Clock,
  Users,
  Tag,
  CalendarDays,
  MoreVertical,
  Edit2,
  Eye,
  Trash2,
  Download,
  LayoutGrid,
  List,
  Calendar,
  AlertCircle,
  CheckCircle,
  Send,
  Building,
} from "lucide-react";
import GlassCard from "@/components/cards/GlassCard";
import adminService from "../../../services/adminService";
import toast from "react-hot-toast";

const EVENTS_STATUS = {
  upcoming: { color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30", label: "Upcoming" },
  ongoing: { color: "text-green-400", bg: "bg-green-500/15", border: "border-green-500/30", label: "Ongoing" },
  completed: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-muted", label: "Completed" },
  cancelled: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", label: "Cancelled" },
};

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
    <div className="p-4 lg:p-6 w-full text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <CalendarDays className="text-blue-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Event Management</h1>
              <p className="text-sm text-muted-foreground">Manage and monitor all campus events</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/admin/events/create")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Create Event</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Events", value: stats.total, icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-500/15" },
            { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/15" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/15" },
            { label: "Cancelled", value: 0, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/15" },
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search events..."
            className="w-full bg-card border border-border rounded-xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-card border border-border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-foreground focus:outline-none whitespace-nowrap"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterCollege}
          onChange={(e) => { setFilterCollege(e.target.value); setPage(1); }}
          className="bg-card border border-border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-foreground focus:outline-none whitespace-nowrap"
        >
          <option value="">All Colleges</option>
          <option value="CST">CST</option>
          <option value="CBE">CBE</option>
          <option value="CMHS">CMHS</option>
        </select>

        <div className="flex bg-card border border-border rounded-xl overflow-hidden shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 sm:p-3 ${viewMode === "grid" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 sm:p-3 ${viewMode === "list" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List size={16} />
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-accent rounded w-1/2 mb-4" />
              <div className="h-3 bg-accent rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CalendarDays size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Events Found</h3>
          <p className="text-muted-foreground">Adjust your filters or create a new event.</p>
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
                  className="group bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-blue-500/30 transition-all cursor-pointer"
                  onClick={() => handleView(event)}
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${status.bg} ${status.color} border ${status.border}`}>
                      {status.label}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }} className="p-1.5 sm:p-2 rounded-lg hover:bg-accent"><Edit2 size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(event._id || event.id); }} className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base">{event.title}</h3>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-blue-400" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-amber-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-purple-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                    <div className="flex-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Target</p>
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        {event.targetSchool || event.targetCollege || "All Campus"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs sm:text-sm hover:bg-blue-500/30 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <GlassCard padding="p-0" className="min-w-[600px]">
            <table className="w-full">
              <thead className="bg-card border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="p-3 sm:p-4 text-left">Event</th>
                  <th className="p-3 sm:p-4 text-left">Date & Time</th>
                  <th className="p-3 sm:p-4 text-left">Location</th>
                  <th className="p-3 sm:p-4 text-left hidden sm:table-cell">Target</th>
                  <th className="p-3 sm:p-4 text-left">Status</th>
                  <th className="p-3 sm:p-4 text-right">Actions</th>
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
                        className="hover:bg-accent/50 transition-colors"
                      >
                        <td className="p-3 sm:p-4">
                          <p className="font-medium text-foreground text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-foreground">{new Date(event.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </td>
                        <td className="p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-foreground truncate max-w-[120px]">{event.location}</p>
                        </td>
                        <td className="p-3 sm:p-4 hidden sm:table-cell">
                          <p className="text-xs sm:text-sm text-foreground">{event.targetSchool || event.targetCollege || "All"}</p>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${status.bg} ${status.color} border ${status.border}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button onClick={() => handleView(event)} className="p-1.5 sm:p-2 rounded-lg hover:bg-accent"><Eye size={14} /></button>
                            <button onClick={() => handleEdit(event)} className="p-1.5 sm:p-2 rounded-lg hover:bg-accent"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(event._id || event.id)} className="p-1.5 sm:p-2 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={14} /></button>
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
              className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl p-4 sm:p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase ${EVENTS_STATUS[selectedEvent.computedStatus]?.bg} ${EVENTS_STATUS[selectedEvent.computedStatus]?.color} border ${EVENTS_STATUS[selectedEvent.computedStatus]?.border}`}>
                    {EVENTS_STATUS[selectedEvent.computedStatus]?.label}
                  </span>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-accent">
                  <X size={18} />
                </button>
              </div>

              <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{selectedEvent.title}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-accent/50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar size={12} />
                    <span className="text-[10px] uppercase">Date</span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                </div>
                <div className="bg-accent/50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock size={12} />
                    <span className="text-[10px] uppercase">Time</span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{selectedEvent.time}</p>
                </div>
                <div className="bg-accent/50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin size={12} />
                    <span className="text-[10px] uppercase">Location</span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{selectedEvent.location}</p>
                </div>
                <div className="bg-accent/50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users size={12} />
                    <span className="text-[10px] uppercase">Target</span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{selectedEvent.targetSchool || selectedEvent.targetCollege || "All Campus"}</p>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h4 className="text-[10px] uppercase text-muted-foreground mb-1 sm:mb-2">Description</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed bg-accent/30 rounded-xl p-3 sm:p-4">
                  {selectedEvent.description || "No description provided."}
                </p>
              </div>

              {selectedEvent.tags?.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-[10px] uppercase text-muted-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map((tag, i) => (
                      <span key={i} className="px-2 sm:px-3 py-1 bg-accent rounded-lg text-xs text-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
                <button
                  onClick={() => { setShowModal(false); handleEdit(selectedEvent); }}
                  className="flex-1 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => { setShowModal(false); handleDelete(selectedEvent._id || selectedEvent.id); }}
                  className="flex-1 py-2.5 sm:py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
