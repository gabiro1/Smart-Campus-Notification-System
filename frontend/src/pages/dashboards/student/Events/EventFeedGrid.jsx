import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard from "./EventCard";
import { AlertCircle, Search, Filter, Loader2, Sparkles } from "lucide-react";


export default function EventFeedGrid({
  events = [],
  loading,
  onRate,
  onDetails,
  onLoadMore,
  searchQ = "",
  setSearchQ,
  eventFilter = "all",
  setEventFilter,
}) {
  // --- STATE ---
  const [localSearch, setLocalSearch] = useState(searchQ);
  const [activeFilter, setActiveFilter] = useState(eventFilter);
  const [isSpinning, setIsSpinning] = useState(false);

  // Sync with props
  useState(() => {
    if (searchQ !== undefined) setLocalSearch(searchQ);
  }, [searchQ]);

  useState(() => {
    if (eventFilter !== undefined) setActiveFilter(eventFilter);
  }, [eventFilter]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (setSearchQ) setSearchQ(value);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setActiveFilter(value);
    if (setEventFilter) setEventFilter(value);
  };

  // Handle the Load More click
  const handleLoadMore = () => {
    setIsSpinning(true);

    if (onLoadMore) {
      onLoadMore();
      setTimeout(() => setIsSpinning(false), 1500);
    } else {
      setTimeout(() => {
        setIsSpinning(false);
      }, 1500);
    }
  };

  // 1. Initial Loading State (Skeleton)
  if (loading && (!events || events.length === 0)) {
    return (
      <div className=" transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 w-full bg-card border border-border rounded-[8px] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Base Data — real events only
  const baseEvents = events || [];

  // 3. Search and Filter Logic
  const filteredEvents = baseEvents.filter((event) => {
    if (!event) return false;
    const matchesSearch =
      !localSearch ||
      event.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
      event.description?.toLowerCase().includes(localSearch.toLowerCase()) ||
      event.tags?.some(t => t.toLowerCase().includes(localSearch.toLowerCase()));

    const matchesFilter =
      activeFilter === "all" ||
      event.priority === activeFilter ||
      event.approvalLevel === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 transition-all duration-300 min-h-screen overflow-x-hidden">
      {/* Centering Wrapper for Ultrawide Screens */}
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER: TITLE, SEARCH & FILTER --- */}
        <div className="mb-8 md:mb-10 space-y-5 md:space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Sparkles className="text-blue-500" />
              Campus Events
            </h1>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                placeholder="Search events, tags, or keywords..."
                value={localSearch}
                onChange={handleSearchChange}
                className="w-full bg-card border border-border rounded-xl py-3 md:py-3.5 pl-12 pr-4 text-sm focus:outline-none transition-all text-foreground placeholder:text-muted-foreground focus:border-border"
              />
            </div>

            {/* AI-Powered Filter Dropdown */}
            <div className="relative w-full md:w-auto md:min-w-[200px]">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <select
                value={activeFilter}
                onChange={handleFilterChange}
                className="appearance-none w-full bg-card border border-border rounded-xl py-3 md:py-3.5 pl-11 pr-10 text-sm text-foreground focus:outline-none cursor-pointer focus:border-border"
              >
                <option value="all">All Events</option>
                <option value="top">Top AI Matches</option>
                <option value="interested">My Interests</option>
                <option value="high">High Priority</option>
                <option value="college">College Verified</option>
                <option value="school">School Verified</option>
                <option value="department">Dept Verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Match Info */}
        {activeFilter === "top" && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-400 text-xs flex items-center gap-2">
              <Sparkles size={14} />
              Showing events ranked by AI relevance to your interests and attendance history.
            </p>
          </div>
        )}
        {activeFilter === "interested" && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-xs flex items-center gap-2">
              <Sparkles size={14} />
              Events matching your saved interests and AI-detected preferences.
            </p>
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 md:p-20 border border-border rounded-[15px] bg-card"
          >
            <AlertCircle size={40} className="text-muted-foreground mb-4" />
            <h4 className="text-foreground font-bold text-lg md:text-xl">
              No Matches Found
            </h4>
            <p className="text-muted-foreground text-xs md:text-sm mt-2 text-center max-w-sm">
              Try adjusting your search terms or clearing your filters to see
              more events.
            </p>
          </motion.div>
        ) : (
          <>
            {/* --- RESULTS COUNT --- */}
            <p className="text-muted-foreground text-xs mb-4">
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </p>

            {/* --- THE ANIMATED GRID --- */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="col-span-1 flex"
                  >
                    <EventCard
                      event={event}
                      onRate={onRate}
                      onDetails={onDetails}
                      initialBookmark={event.isBookmarked}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* --- LOAD MORE BUTTON --- */}
            {onLoadMore && (
              <motion.div layout className="flex justify-center w-full pb-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isSpinning}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 bg-card border border-border rounded-lg text-xs md:text-sm font-bold text-muted-foreground hover:text-foreground hover:border-border hover:bg-card transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  {isSpinning ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Syncing Database...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
