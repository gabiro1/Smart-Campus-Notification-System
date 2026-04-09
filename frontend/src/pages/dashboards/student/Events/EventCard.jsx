import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  Bookmark,
  Sparkles,
} from "lucide-react";
import eventService from "../../../../services/eventService";
import toast from "react-hot-toast";

export default function EventCard({ event, onRate, onBookmark, initialBookmark = false }) {
  const navigate = useNavigate();

  // Local state for immediate UI feedback — syncs with server state on re-render
  const [isBookmarked, setIsBookmarked] = useState(initialBookmark);

  // Keep in sync when parent passes fresh data (e.g. after page reload)
  useEffect(() => {
    setIsBookmarked(initialBookmark);
  }, [initialBookmark]);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Styling helper for the school/college badge
  const getBadgeStyle = (school) => {
    if (school?.toLowerCase().includes("college"))
      return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    if (school?.toLowerCase().includes("school"))
      return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  // Handlers
  const handleCardClick = () => {
    navigate(`/student/events/${event._id || event.id}`);
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation(); // Prevents the card click (navigation) from firing
    
    // Optimistic UI Update
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    
    try {
      await eventService.toggleBookmark(event._id || event.id);
      if (newState) {
        toast.success("Event saved to bookmarks", { style: { background: '#171717', color: '#fff', border: '1px solid #333' }});
      }
      if (onBookmark) onBookmark(event._id || event.id, newState);
    } catch (err) {
      // Revert if API fails
      setIsBookmarked(!newState);
      toast.error("Failed to save event");
    }
  };

  const handleRateClick = (e, star) => {
    e.stopPropagation(); // Prevents the card click (navigation) from firing
    if (onRate) onRate(event, star);
  };

  return (
    <motion.div
      whileHover={{ y: -2, backgroundColor: "#121212" }}
      onClick={handleCardClick}
      className={`relative p-5 md:p-6 rounded-[15px] border border-white/5 bg-background transition-all group flex flex-col justify-between h-full w-full cursor-pointer hover:shadow-xl hover:shadow-black/50 ${
        event.priority === "high" || event.priority === "urgent"
          ? "border-red-500/20"
          : ""
      }`}
    >
      <div>
        {/* --- Top Row: Badges & Bookmark --- */}
        <div className="flex justify-between items-start mb-5 md:mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-black uppercase tracking-tighter ${getBadgeStyle(
                event.school || event.approvalLevel,
              )}`}
            >
              <ShieldCheck size={10} />{" "}
              {event.school || event.approvalLevel || "Department"} Verified
            </div>

            {(event.priority === "high" || event.priority === "urgent") && (
              <div className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                <AlertCircle size={12} /> Urgent
              </div>
            )}
            
            {/* AI Match Score Badge */}
            {event.aiMatchScore > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                <Sparkles size={10} className="text-blue-400" />
                <span className="text-blue-400 text-[9px] font-black uppercase">
                  {Math.round(event.aiMatchScore)}% Match
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleBookmarkClick}
            className="p-1 -mt-1 -mr-1 text-neutral-500 hover:text-white transition-colors focus:outline-none"
          >
            <Bookmark
              size={18}
              className={isBookmarked ? "text-blue-500" : ""}
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* --- Meta Details (Date & Location) --- */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {new Date(event.date).toLocaleDateString()}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {event.location}
            </span>
          )}
        </div>

        {/* --- Text Content --- */}
        <h3 className="text-base md:text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {event?.title || 'Untitled Event'}
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-6">
          {event?.description || "No description available."}
        </p>
      </div>

        {/* --- Footer: Rating & Action Button --- */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-3">
          <div
            className="flex gap-0.5"
            onClick={(e) => e.stopPropagation()}
            onMouseLeave={() => setHoveredStar(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              // Calculate average rating from ratings array
              const avgRating = event.ratings && event.ratings.length > 0
                ? event.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / event.ratings.length
                : 0;
              
              return (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onClick={(e) => handleRateClick(e, star)}
                  className="hover:scale-125 transition-transform focus:outline-none p-0.5"
                >
                  <Star
                    size={14}
                    className={`transition-colors duration-200 ${
                      star <= (hoveredStar || Math.round(avgRating))
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-neutral-700 hover:text-yellow-500"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {event.ratings && event.ratings.length > 0 && (
            <span className="text-[9px] md:text-[10px] text-neutral-500 hidden sm:inline">
              ({event.ratings.length})
            </span>
          )}
        </div>

        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 text-neutral-400 group-hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
