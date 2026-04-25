import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard from "./EventCard";
import {
  Filter,
  Loader2,
  Sparkles,
  CalendarDays,
  Grid3X3,
  List,
  Clock,
  MapPin,
  Users,
  X,
  BellPlus,
  Bookmark,
  Check,
  Star,
} from "lucide-react";
import eventService from "../../../../services/eventService";
import reminderService from "../../../../services/reminderService";
import toast from "react-hot-toast";

function EventQuickModal({ event, onClose, onRate }) {
  const [isBookmarked, setIsBookmarked] = useState(event?.isBookmarked || false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [userRatedStar, setUserRatedStar] = useState(0);

  const avgRating = event?.avgRating || (event?.ratings?.length > 0 
    ? event.ratings.reduce((s, r) => s + (r.rating || 0), 0) / event.ratings.length : 0);

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    try {
      await eventService.toggleBookmark(event._id || event.id);
      toast.success(isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks", {
        style: { background: '#111214', color: '#fff', border: '1px solid #1E2023' }
      });
    } catch {
      setIsBookmarked(!isBookmarked);
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

  if (!event) return null;

  return (
    <>
<motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
          onClick={onClose}
        >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.95, opacity: 0 }} 
          onClick={(e) => e.stopPropagation()} 
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide bg-card border border-border rounded-xl shadow-2xl"
        >
          <div className="sticky top-0 z-10 bg-card p-4 border-b border-border flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                event.school?.toLowerCase().includes("college") ? "bg-purple-500/10 text-purple-500" :
                "bg-emerald-500/10 text-emerald-500"
              }`}>{event.school || "Department"}</span>
              {event.priority === "high" && <span className="text-xs font-medium px-2 py-1 rounded bg-red-500/10 text-red-500">Urgent</span>}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-lg">
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{event.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays size={12} />{new Date(event.date).toLocaleDateString()}</span>
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

            <div className="flex gap-0.5" onMouseLeave={() => {}}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => { setUserRatedStar(star); if (onRate) onRate(event, star); }}
                  className="hover:scale-125 transition-transform p-0"
                >
                  <Star 
                    size={18} 
                    className={star <= (userRatedStar || Math.round(avgRating)) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"} 
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <motion.button 
                onClick={() => setShowReminder(true)} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-sm font-medium"
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
                  <h3 className="text-base font-semibold text-foreground mb-1">Set Reminder</h3>
                  <p className="text-xs text-muted-foreground mb-3">Get notified before <span className="text-foreground font-medium">{event.title}</span></p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleSetReminder("week")} 
                      disabled={reminderLoading} 
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-left text-sm text-foreground"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <CalendarDays size={14} className="text-emerald-500" />
                      </div>
                      1 week before
                    </button>
                    <button 
                      onClick={() => handleSetReminder("day")} 
                      disabled={reminderLoading} 
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-left text-sm text-foreground"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <CalendarDays size={14} className="text-blue-500" />
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

export default function EventFeedGrid({
  events = [],
  loading,
  onRate,
  onDetails,
  onLoadMore,
  eventFilter = "all",
  setEventFilter,
}) {
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilter, setActiveFilter] = useState(eventFilter);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setActiveFilter(value);
    if (setEventFilter) setEventFilter(value);
  };

  const handleLoadMore = () => {
    setIsSpinning(true);
    if (onLoadMore) {
      onLoadMore();
      setTimeout(() => setIsSpinning(false), 1500);
    } else {
      setTimeout(() => setIsSpinning(false), 1500);
    }
  };

  const filteredEvents = (events || []).filter((event) => event);

  const ListEventCard = ({ event, index }) => (
    <motion.div
      key={event._id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => setSelectedEvent(event)}
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        event.priority === "high" ? "bg-red-500/10 text-red-500" : "bg-purple-500/10 text-purple-500"
      }`}>
        {event.priority === "high" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        ) : (
          <CalendarDays size={18} />
        )}
      </div>

      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            event.school?.toLowerCase().includes("college") ? "bg-purple-500/10 text-purple-500" :
            "bg-emerald-500/10 text-emerald-500"
          }`}>{event.school || "Department"}</span>
          {event.priority === "high" && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">Urgent</span>}
        </div>
        <h3 className="font-medium text-sm text-foreground leading-tight">{event.title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CalendarDays size={10} />{new Date(event.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {event.location && <span className="flex items-center gap-1"><MapPin size={10} />{event.location}</span>}
        </div>
      </div>

      <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
    </motion.div>
  );

  if (loading && (!events || events.length === 0)) {
    return (
      <div className="p-6 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map((n) => (
              <div key={n} className="h-36 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={activeFilter}
                onChange={handleFilterChange}
                className="appearance-none bg-card border border-border rounded-lg py-2 pl-3 pr-8 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All</option>
                <option value="top">Recommended</option>
                <option value="high">Urgent</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
            </div>
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-20 border border-border rounded-xl bg-card"
          >
            <CalendarDays size={40} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No Events</h3>
            <p className="text-sm text-muted-foreground">No events available at the moment</p>
          </motion.div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">{filteredEvents.length} events</p>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
                <AnimatePresence mode="popLayout">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <EventCard event={event} onRate={onRate} onDetails={onDetails} initialBookmark={event.isBookmarked} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-3 pb-6">
                <AnimatePresence>
                  {filteredEvents.map((event, index) => (
                    <ListEventCard key={event._id} event={event} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {onLoadMore && (
              <motion.div layout className="flex justify-center pb-8">
                <button 
                  onClick={handleLoadMore} 
                  disabled={isSpinning} 
                  className="flex items-center gap-2 px-6 py-2.5 bg-card border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all disabled:opacity-50"
                >
                  {isSpinning ? <Loader2 size={16} className="animate-spin" /> : "Load More"}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventQuickModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)}
            onRate={onRate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}