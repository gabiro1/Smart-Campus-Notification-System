import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard from "./EventCard";
import { AlertCircle, Search, Filter, Loader2 } from "lucide-react";

// --- FALLBACK DATA ---
const fallbackEvents = [
  {
    _id: "fb1",
    title: "URGENT: Advanced Programming Venue Change",
    description:
      "Due to network maintenance in Hall 4, today's session for Level 4 IT has been relocated to Computer Lab 2.",
    date: new Date().toISOString(),
    priority: "high",
    aiMatchScore: 98,
    approvalLevel: "department",
    tags: ["urgent", "venue"],
  },
  {
    _id: "fb2",
    title: "Campus-Wide Wi-Fi Upgrade",
    description:
      "The IT Directorate will be upgrading core routers across the CST campus this weekend. Expect outages.",
    date: new Date().toISOString(),
    priority: "medium",
    aiMatchScore: 82,
    approvalLevel: "college",
    tags: ["network", "campus"],
  },
  {
    _id: "fb3",
    title: "Guest Lecture: AI in Agriculture",
    description:
      "Join us for a seminar discussing how AI models predict farming risks. Highly recommended for IT final years.",
    date: new Date().toISOString(),
    priority: "low",
    aiMatchScore: 95,
    approvalLevel: "school",
    tags: ["ai", "seminar"],
  },
  {
    _id: "fb4",
    title: "Reminder: Submit Feedback for Last Week's IT Seminar",
    description:
      "Your feedback helps us improve future events. Please take a moment to share your thoughts on the recent seminar.",
    date: new Date().toISOString(),
    priority: "urgent",
    aiMatchScore: 88,
    approvalLevel: "school",
    tags: ["feedback", "seminar"],
  },
];

export default function EventFeedGrid({
  events = [],
  loading,
  onRate,
  onDetails,
  onLoadMore, // Backend function for loading next page
}) {
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isSpinning, setIsSpinning] = useState(false);

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
  // Adjusted to match the responsive sidebar and grid
  if (loading && (!events || events.length === 0)) {
    return (
      <div className="ml-20 md:ml-72 p-4 sm:p-6 md:p-8 transition-all duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-12">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 w-full bg-[#141414] border border-white/5 rounded-[15px] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Base Data
  const baseEvents = events && events.length > 0 ? events : fallbackEvents;

  // 3. Search and Filter Logic
  const filteredEvents = baseEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      event.priority === activeFilter ||
      event.approvalLevel === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="ml-20 md:ml-72 p-4 sm:p-6 md:p-8 transition-all duration-300 min-h-screen overflow-x-hidden">
      {/* Centering Wrapper for Ultrawide Screens */}
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER: TITLE, SEARCH & FILTER --- */}
        <div className="mb-8 md:mb-10 space-y-5 md:space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Events
          </h1>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search pulses, tags, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 md:py-3.5 pl-12 pr-4 text-sm focus:outline-none transition-all text-white placeholder:text-neutral-600 focus:border-white/20"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full md:w-auto md:min-w-[200px]">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                size={16}
              />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="appearance-none w-full bg-[#111111] border border-white/10 rounded-xl py-3 md:py-3.5 pl-11 pr-10 text-sm text-white focus:outline-none cursor-pointer focus:border-white/20"
              >
                <option value="all">All Pulses</option>
                <option value="high">High Priority</option>
                <option value="college">College Verified</option>
                <option value="school">School Verified</option>
                <option value="department">Dept Verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- EMPTY STATE --- */}
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 md:p-20 border border-white/5 rounded-[15px] bg-[#141414]"
          >
            <AlertCircle size={40} className="text-neutral-600 mb-4" />
            <h4 className="text-white font-bold text-lg md:text-xl">
              No Matches Found
            </h4>
            <p className="text-neutral-500 text-xs md:text-sm mt-2 text-center max-w-sm">
              Try adjusting your search terms or clearing your filters to see
              more events.
            </p>
          </motion.div>
        ) : (
          <>
            {/* --- THE ANIMATED GRID --- 
                Updated to flow elegantly: 1 col (Mobile) -> 2 cols (Tablet) -> 3 cols (Desktop)
            */}
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
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* --- LOAD MORE BUTTON --- */}
            <motion.div layout className="flex justify-center w-full pb-12">
              <button
                onClick={handleLoadMore}
                disabled={isSpinning}
                className="flex items-center gap-2 px-6 md:px-8 py-3 bg-[#111111] border border-white/5 rounded-lg text-xs md:text-sm font-bold text-neutral-400 hover:text-white hover:border-white/20 hover:bg-[#141414] transition-all disabled:opacity-50 disabled:cursor-wait"
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
          </>
        )}
      </div>
    </div>
  );
}
