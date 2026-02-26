import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../../../hooks";
import { Star, Heart, ChevronRight, Loader } from "lucide-react";

export default function StudentFeed() {
  const navigate = useNavigate();
  const { events, loading, error, getEvents, rateEvent, markInterested } =
    useEvents();
  const [selectedRating, setSelectedRating] = useState({});

  useEffect(() => {
    getEvents(1, 10);
  }, []);

  const handleRate = async (eventId, rating) => {
    try {
      await rateEvent(eventId, rating);
      setSelectedRating({ ...selectedRating, [eventId]: rating });
    } catch (err) {
      console.error("Rating failed:", err);
    }
  };

  const handleMarkInterested = async (eventId) => {
    try {
      await markInterested(eventId);
    } catch (err) {
      console.error("Failed to mark interest:", err);
    }
  };

  const handleViewDetails = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400">Error loading events: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Top Picks for You</h2>
        <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md font-bold">
          AI RANKED
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass p-6 rounded-[32px] h-44 bg-neutral-900 animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No events available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {events.map((event) => (
            <motion.div
              key={event._id}
              layout
              className={`glass p-6 rounded-[32px] border border-white/5 relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-blue-500/30 transition-all ${
                event.aiMatchScore > 80
                  ? "col-span-2 h-52 bg-gradient-to-br from-blue-600/10 to-transparent"
                  : "col-span-1 h-44"
              }`}
              onClick={() => handleViewDetails(event._id)}
            >
              {/* Match Badge - The visual proof of ML */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-blue-400">
                  {Math.round(event.aiMatchScore)}% MATCH
                </span>
              </div>

              <div>
                <div className="flex gap-2 mb-2">
                  {event.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] text-neutral-500 uppercase font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3
                  className={`font-bold text-white ${
                    event.aiMatchScore > 80 ? "text-2xl" : "text-md"
                  }`}
                >
                  {event.title}
                </h3>
              </div>

              <div className="space-y-3">
                {/* Rating */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRate(event._id, star);
                      }}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={16}
                        className={
                          selectedRating[event._id] &&
                          selectedRating[event._id] >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-neutral-600"
                        }
                      />
                    </button>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkInterested(event._id);
                    }}
                    className="flex-1 text-xs text-blue-400 font-bold flex items-center justify-center gap-1 hover:gap-2 transition-all"
                  >
                    <Heart size={14} />
                    Interested
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(event._id);
                    }}
                    className="flex-1 text-xs text-blue-400 font-bold flex items-center justify-center gap-1 hover:gap-2 transition-all"
                  >
                    Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
