import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Bookmark,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import apiClient from "../../../../services/apiClient";
import eventService from "../../../../services/eventService";
import toast from "react-hot-toast";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await apiClient.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Event not found");
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  const handleBookmark = async () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    try {
      await eventService.toggleBookmark(eventId);
      toast.success(newState ? "Saved to bookmarks!" : "Removed from bookmarks", {
        style: { background: '#171717', color: '#fff', border: '1px solid #333' }
      });
    } catch {
      setIsBookmarked(!newState);
      toast.error("Failed to update bookmark");
    }
  };

  const handleRate = async (star) => {
    try {
      await apiClient.post(`/events/${eventId}/rate`, { rating: star });
      toast.success("Rating submitted!");
    } catch {
      toast.error("Rating failed");
    }
  };

  const getBadgeStyle = (level) => {
    if (level?.toLowerCase().includes("college")) return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    if (level?.toLowerCase().includes("school")) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-8 min-h-screen bg-background">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-400 mb-6 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 flex items-center gap-3">
          <AlertCircle size={20} /> {error || "Event not found"}
        </div>
      </div>
    );
  }

  const eventDate = event.date ? new Date(event.date) : null;
  const isUrgent = event.priority === "high" || event.priority === "urgent";

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Events</span>
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getBadgeStyle(event.approvalLevel)}`}>
                <ShieldCheck size={12} /> {event.approvalLevel || "Department"} Verified
              </div>
              {isUrgent && (
                <div className="flex items-center gap-1 text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Zap size={12} /> Urgent
                </div>
              )}
              {event.aiMatchScore > 0 && (
                <div className="flex items-center gap-1 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                  {Math.round(event.aiMatchScore)}% AI Match
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{event.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-5 text-sm text-neutral-400">
              {eventDate && (
                <span className="flex items-center gap-2">
                  <Calendar size={15} className="text-blue-500" />
                  {eventDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-2">
                  <MapPin size={15} className="text-blue-500" /> {event.location}
                </span>
              )}
            </div>

            {/* Poster */}
            {event.posterUrl && (
              <img src={event.posterUrl} alt={event.title} className="w-full rounded-2xl object-cover max-h-72 border border-white/5" />
            )}

            {/* Description */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3">About this Event</h3>
              <p className="text-neutral-300 leading-relaxed">{event.description || "No description provided."}</p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Sidebar Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-card border border-white/5 rounded-[24px] p-6 sticky top-6 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Quick Actions</h3>

              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all ${
                  isBookmarked
                    ? "bg-blue-600/20 border-blue-500 text-blue-400"
                    : "bg-white/[0.03] border-white/5 text-neutral-400 hover:text-white hover:border-white/20"
                }`}
              >
                <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                {isBookmarked ? "Saved" : "Save Event"}
              </button>

              {/* Rating */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3">Rate this Event</p>
                <div className="flex gap-1.5 justify-center" onMouseLeave={() => setHoveredStar(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredStar(star)}
                      onClick={() => handleRate(star)}
                      className="hover:scale-125 transition-transform focus:outline-none"
                    >
                      <Star
                        size={22}
                        className={`transition-colors ${
                          star <= hoveredStar ? "fill-yellow-400 text-yellow-400" : "text-neutral-700 hover:text-yellow-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {event.ratings?.length > 0 && (
                  <p className="text-[10px] text-center text-neutral-600 mt-2 font-bold">
                    {(event.ratings.reduce((s, r) => s + r.rating, 0) / event.ratings.length).toFixed(1)} / 5 ({event.ratings.length} ratings)
                  </p>
                )}
              </div>

              {/* Created By */}
              {event.createdBy?.name && (
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-black mb-1">Posted by</p>
                  <p className="text-sm font-bold text-white">{event.createdBy.name}</p>
                  {event.createdBy.department && (
                    <p className="text-xs text-neutral-500">{event.createdBy.department}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
