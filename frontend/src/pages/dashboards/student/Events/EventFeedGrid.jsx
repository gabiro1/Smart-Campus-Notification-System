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
  const [isSpinning, setIsSpinning] = useState(false); // Local state for the button spinner

  // Handle the Load More click
  const handleLoadMore = () => {
    setIsSpinning(true);

    // If you passed a real backend function, call it
    if (onLoadMore) {
      onLoadMore();
      // Assume parent resets the loading state, or reset after a delay
      setTimeout(() => setIsSpinning(false), 1500);
    } else {
      // Presentation Mode: Just spin for 1.5s to show the UI effect
      setTimeout(() => {
        setIsSpinning(false);
      }, 1500);
    }
  };

  // 1. Initial Loading State (Skeleton)
  if (loading && (!events || events.length === 0)) {
    return (
      <div className="ml-64 p-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-48 w-full bg-[#141414] border border-white/5 rounded-[15px] animate-pulse"
            />
          ))}
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
    <div className="ml-70 p-8 flex-1 max-w-[100vw] overflow-x-hidden">
      {/* --- HEADER: TITLE, SEARCH & FILTER --- */}
      <div className="mb-8 space-y-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Events
        </h1>

        <div className="flex flex-col md:flex-row gap-4">
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
              className="w-full bg-[#111111] border border-white/10 rounded-[10px] py-3 pl-12 pr-4 text-sm focus:outline-none  transition-all text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="appearance-none bg-[#111111] border border-white/10 rounded-[10px] py-3 pl-11 pr-10 text-sm text-white focus:outline-none cursor-pointer"
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

      {/* --- EMPTY STATE (If search returns 0 results) --- */}
      {filteredEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-16 border border-white/5 rounded-[15px] bg-[#141414]"
        >
          <AlertCircle size={40} className="text-neutral-600 mb-4" />
          <h4 className="text-white font-bold text-xl">No Matches Found</h4>
          <p className="text-neutral-500 text-sm mt-2 text-center">
            Try adjusting your search terms or clearing your filters.
          </p>
        </motion.div>
      ) : (
        <>
          {/* --- THE ANIMATED GRID --- */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8"
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
              className="flex items-center gap-2 px-6 py-3 bg-[#111111] border border-white/5 rounded-sm text-xs font-bold text-neutral-400 hover:text-white hover:border-white/20 hover:bg-[#141414] transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {isSpinning ? (
                <>
                  <Loader2 size={14} className="animate-spin " />
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
  );
}
