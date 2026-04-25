import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Star,
  Clock,
  MapPin,
  Bookmark,
  BellPlus,
  Calendar,
  Check,
  X,
  Video,
  Users,
} from "lucide-react";
import eventService from "../../../../services/eventService";
import reminderService from "../../../../services/reminderService";
import toast from "react-hot-toast";

export default function EventCard({ event, onRate, onBookmark, initialBookmark = false }) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmark);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userRatedStar, setUserRatedStar] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    setIsBookmarked(initialBookmark);
  }, [initialBookmark]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser._id && event.ratings) {
      const myRating = event.ratings.find(r => r.studentId?.toString() === storedUser._id.toString());
      if (myRating) setUserRatedStar(myRating.rating);
    }
  }, [event]);

  const getIcon = () => {
    if (event.priority === "high" || event.priority === "urgent") return AlertCircle;
    if (event.eventType === "virtual" || event.eventType === "online") return Video;
    return Calendar;
  };

  const getIconColor = () => {
    if (event.priority === "high") return "bg-red-500/10 text-red-500";
    if (event.eventType === "virtual") return "bg-blue-500/10 text-blue-500";
    return "bg-purple-500/10 text-purple-500";
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    const newState = !isBookmarked;
    setIsBookmarked(newState);
    try {
      await eventService.toggleBookmark(event._id || event.id);
      if (newState) toast.success("Saved", { style: { background: '#111214', color: '#fff', border: '1px solid #1E2023' } });
    } catch (err) {
      setIsBookmarked(!newState);
    }
  };

  const handleSetReminder = async (type) => {
    setReminderLoading(true);
    try {
      const eventDate = new Date(event.date);
      let dueDate;
      switch (type) {
        case "day": dueDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); break;
        case "hour": dueDate = new Date(eventDate.getTime() - 60 * 60 * 1000); break;
        case "week": dueDate = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        default: dueDate = eventDate;
      }
      if (dueDate < new Date()) dueDate = eventDate;

      await reminderService.createReminder({
        title: `Attend: ${event.title}`,
        note: `"${event.title}" at ${event.location || 'TBD'}`,
        dueDate: dueDate.toISOString(),
        priority: event.priority === "high" ? "high" : "medium",
        category: "event",
        referenceId: event._id || event.id,
      });
      setReminderSet(true);
      toast.success("Reminder set!", { style: { background: '#111214', color: '#fff', border: '1px solid #1E2023' } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setReminderLoading(false);
    }
  };

  const avgRating = event.avgRating || (event.ratings?.length > 0 ? event.ratings.reduce((s, r) => s + (r.rating || 0), 0) / event.ratings.length : 0);
  const ratingCount = event.ratingCount ?? event.ratings?.length ?? 0;
  const TypeIcon = getIcon();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        onClick={() => setShowModal(true)}
        className="group bg-card border border-border rounded-xl cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg"
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor()}`}>
              <TypeIcon size={18} />
            </div>
            <button 
              onClick={handleBookmark} 
              className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              event.school?.toLowerCase().includes("college") ? "bg-purple-500/10 text-purple-500" :
              event.school?.toLowerCase().includes("school") ? "bg-blue-500/10 text-blue-500" :
              "bg-emerald-500/10 text-emerald-500"
            }`}>
              {event.school || event.approvalLevel || "Department"}
            </span>
            {event.priority === "high" && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">Urgent</span>
            )}
            {event.aiMatchScore > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                {Math.round(event.aiMatchScore)}% Match
              </span>
            )}
          </div>

          <h3 className="font-medium text-sm text-foreground mb-2 line-clamp-2">{event.title}</h3>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(event.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {event.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
              <MapPin size={12} />
              {event.location}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()} onMouseLeave={() => setHoveredStar(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onMouseEnter={() => setHoveredStar(star)} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setUserRatedStar(star);
                    if (onRate) onRate(event, star); 
                  }}
                  className="hover:scale-125 transition-transform p-0"
                >
                  <Star 
                    size={12} 
                    className={star <= (hoveredStar || userRatedStar || Math.round(avgRating)) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"} 
                  />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowReminder(true); }} 
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <BellPlus size={14} />
              </button>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">View →</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            {event.attendees?.length > 0 && (
              <span className="flex items-center gap-1">
                <Users size={10} />
                {event.attendees.length} going
              </span>
            )}
            {avgRating > 0 && (
              <span className="ml-auto">
                {avgRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              onClick={(e) => e.stopPropagation()} 
              className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    event.school?.toLowerCase().includes("college") ? "bg-purple-500/10 text-purple-500" :
                    "bg-emerald-500/10 text-emerald-500"
                  }`}>{event.school || "Department"}</span>
                  {event.priority === "high" && <span className="text-xs font-medium px-2 py-1 rounded bg-red-500/10 text-red-500">Urgent</span>}
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-accent rounded-lg">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{event.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(event.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {event.location && <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>}
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">{event.description || "No description provided."}</p>
                </div>

                {event.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <motion.button 
                    onClick={() => setShowReminder(true)} 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-sm font-medium"
                  >
                    <BellPlus size={14} /> Set Reminder
                  </motion.button>
                  <motion.button 
                    onClick={handleBookmark} 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    className="p-2 bg-muted border border-border hover:border-primary/50 rounded-lg"
                  >
                    <Bookmark size={14} className={isBookmarked ? "text-primary" : "text-muted-foreground"} fill={isBookmarked ? "currentColor" : "none"} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReminder && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
            onClick={() => { setShowReminder(false); setReminderSet(false); }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              onClick={(e) => e.stopPropagation()} 
              className="w-full max-w-sm bg-card border border-border rounded-xl p-5 shadow-2xl"
            >
              {reminderSet ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check size={20} className="text-green-500" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Reminder Set!</h3>
                  <p className="text-xs text-muted-foreground mb-3">We&apos;ll notify you before the event.</p>
                  <button 
                    onClick={() => { setShowReminder(false); setReminderSet(false); }} 
                    className="px-5 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-sm font-medium"
                  >
                    Got it
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold text-foreground">Set Reminder</h3>
                    <button onClick={() => { setShowReminder(false); setReminderSet(false); }} className="p-1 hover:bg-accent rounded-lg">
                      <X size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Get notified before <span className="text-foreground font-medium">{event.title}</span></p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleSetReminder("day")} 
                      disabled={reminderLoading} 
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-left text-sm text-foreground"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Calendar size={14} className="text-blue-500" />
                      </div>
                      1 day before
                    </button>
                    <button 
                      onClick={() => handleSetReminder("hour")} 
                      disabled={reminderLoading} 
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-left text-sm text-foreground"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Clock size={14} className="text-purple-500" />
                      </div>
                      1 hour before
                    </button>
                    <button 
                      onClick={() => handleSetReminder("week")} 
                      disabled={reminderLoading} 
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-left text-sm text-white"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <BellPlus size={14} className="text-emerald-400" />
                      </div>
                      1 week before
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}