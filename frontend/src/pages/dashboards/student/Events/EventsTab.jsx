import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, AlertCircle } from "lucide-react";
import EventCard from "./EventCard";

export default function EventsTab({
  events,
  loading,
  searchQ,
  setSearchQ,
  eventFilter,
  setEventFilter,
  onRate,
  onDetails,
}) {
  return (
    <div className="w-full">
      {/* Header & Search/Filter (From Screenshot 3) */}
      <div className="mb-8 space-y-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          University Events
        </h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search announcements, tags, or keywords..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-[10px] py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-neutral-600"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="appearance-none bg-[#111111] border border-white/10 rounded-[10px] py-3 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
            >
              <option value="all">All Pulses</option>
              <option value="top">Top Matches</option>
              <option value="interested">Interested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-48 bg-[#141414] border border-white/5 rounded-[15px] animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-white/5 rounded-[15px] bg-[#141414]">
          <AlertCircle size={40} className="text-neutral-600 mb-4" />
          <h4 className="text-white font-bold text-xl">No Events Found</h4>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12"
        >
          <AnimatePresence mode="popLayout">
            {events.map((event) => (
              <motion.div
                key={event._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
      )}
    </div>
  );
}
