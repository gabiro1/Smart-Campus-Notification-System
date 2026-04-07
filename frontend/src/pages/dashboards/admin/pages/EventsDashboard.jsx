// src/pages/dashboards/admin/pages/EventsDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  CalendarDays,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Clock,
  Users,
  Tag,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import adminService from "../../../../services/adminService";
import eventService from "../../../../services/eventService";
import EventsTable from "../components/EventsTable";
import AttendanceScanner from "../../../../components/dashboards/AttendanceScanner";

export default function EventsDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State for Viewing
  const [viewingEvent, setViewingEvent] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (filterCollege) filters.targetCollege = filterCollege;

      const data = await adminService.getAllEvents(page, 10, filters);
      setEvents(data.events || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filterCollege, page]);

  const handleDelete = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    )
      return;
    try {
      await adminService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete event.");
    }
  };

  // Navigate to edit page and pass the event data via React Router state
  const handleEdit = (event) => {
    navigate(`/admin/events/edit/${event._id || event.id}`, {
      state: { event },
    });
  };

  // Open the view modal
  const handleView = async (event) => {
    try {
      const stats = await eventService.getStats(event._id);
      setEventStats(stats);
    } catch (error) {
      console.error("Failed to fetch event stats:", error);
      setEventStats(null);
    }
    setViewingEvent(event);
  };

  return (
    <div className="min-h-screen bg-background text-white p-8 lg:p-12 relative">
      <Toaster theme="dark" position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <CalendarDays className="text-blue-500" size={36} /> Event
            Management
          </h1>
          <p className="text-neutral-500 mt-1">
            Manage the global campus calendar and schedules.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/admin/events/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} /> Create Event
        </motion.button>
      </div>

      {/* Action Bar (Search & Filters) */}
      {/* ... (Keep your existing Action Bar code here) ... */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search events by title or location..."
            className="w-full bg-card border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 focus:bg-[#111] outline-none transition-all text-sm"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            size={18}
          />
          <select
            value={filterCollege}
            onChange={(e) => {
              setFilterCollege(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 bg-card border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="">All Colleges</option>
            <option value="College of Science and Technology (CST)">CST</option>
            <option value="College of Business and Economics (CBE)">CBE</option>
            <option value="College of Medicine and Health Sciences (CMHS)">
              CMHS
            </option>
          </select>
        </div>
      </motion.div>

      {/* Main Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-white/5 rounded-[24px] overflow-hidden shadow-2xl"
      >
        <EventsTable
          events={events}
          loading={loading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onView={handleView}
        />

        {/* Pagination Footer */}
        {!loading && totalPages > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider pl-4">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2 pr-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* --- VIEW EVENT MODAL --- */}
      <AnimatePresence>
        {viewingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card p-8 rounded-[24px] border border-white/10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setViewingEvent(null)}
                className="absolute top-6 right-6 text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6 pr-10">
                <h2 className="text-3xl font-black text-white mb-2">
                  {viewingEvent.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-blue-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />{" "}
                    {new Date(viewingEvent.date).toLocaleDateString()} at{" "}
                    {viewingEvent.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} /> {viewingEvent.location}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">
                    Description
                  </h4>
                  <p className="text-neutral-300 text-sm leading-relaxed bg-[#111] p-4 rounded-xl border border-white/5">
                    {viewingEvent.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2 flex items-center gap-1.5">
                      <Users size={14} /> Target Audience
                    </h4>
                    <p className="text-sm text-white font-medium">
                      {viewingEvent.targetCollege || "All Colleges"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {viewingEvent.targetSchool || "All Schools"} •{" "}
                      {viewingEvent.targetDept || "All Departments"}
                    </p>
                    {viewingEvent.targetLevel > 0 && (
                      <p className="text-[10px] text-blue-400 font-bold mt-2 uppercase tracking-wider">
                        Level {viewingEvent.targetLevel}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2 flex items-center gap-1.5">
                      <Tag size={14} /> AI Match Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingEvent.tags && viewingEvent.tags.length > 0 ? (
                        viewingEvent.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white/5 text-neutral-300 text-xs font-medium rounded-lg border border-white/10"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-500">
                          No tags assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attendance & RSVP Stats */}
                {eventStats && (
                  <div className="bg-[#111] p-5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white">Attendance Overview</h4>
                      <button
                        onClick={() => setShowScanner(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors"
                      >
                        <Users size={16} />
                        Scan Attendance
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-xs text-neutral-400 uppercase">RSVP'd</p>
                        <p className="text-2xl font-bold text-blue-400">{eventStats.goingCount}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-xs text-neutral-400 uppercase">Maybe</p>
                        <p className="text-2xl font-bold text-amber-400">{eventStats.maybeCount}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-xs text-neutral-400 uppercase">Attended</p>
                        <p className="text-2xl font-bold text-emerald-400">{eventStats.attendedCount}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-xs text-neutral-400 uppercase">Total RSVP</p>
                        <p className="text-2xl font-bold text-purple-400">{eventStats.totalRSVP}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendance Scanner Overlay */}
      <AnimatePresence>
        {showScanner && viewingEvent && (
          <AttendanceScanner
            eventId={viewingEvent._id}
            onClose={() => setShowScanner(false)}
            onScanSuccess={() => {
              // Refresh stats after successful scan
              eventService.getStats(viewingEvent._id)
                .then(setEventStats)
                .catch(err => console.error("[Stats refresh] Failed:", err));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
