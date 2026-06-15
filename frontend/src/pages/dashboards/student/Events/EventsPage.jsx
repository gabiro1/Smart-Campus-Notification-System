import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Loader2, Plus, Sparkles, Heart, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import EventShowcaseCard from "@/components/cards/EventShowcaseCard";
import eventService from "../../../../services/eventService";
import { useAuth } from "../../../../context/AuthContext";

const CATEGORIES = [
  "all", "academic", "cultural", "sports", "social",
  "workshop", "seminar", "meeting", "ceremony",
  "competition", "fundraiser", "orientation",
];

function formatEventDate(dateStr) {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SkeletonCard() {
  return (
    <div className="flex flex-col md:flex-row bg-[#0B121F] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full md:w-[35%] h-52 md:h-auto bg-slate-800" />
      <div className="flex-1 p-5 space-y-4">
        <div className="h-5 w-3/4 bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="h-4 w-2/3 bg-slate-800 rounded" />
        <div className="flex gap-5 pt-2">
          <div className="h-3 w-32 bg-slate-800 rounded" />
          <div className="h-3 w-24 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

const INTERESTS_DISMISSED_KEY = "events_interests_prompt_dismissed";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showInterestsPrompt, setShowInterestsPrompt] = useState(
    () => localStorage.getItem(INTERESTS_DISMISSED_KEY) !== "true"
  );

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.getFeed(1, 50);
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = category === "all"
    ? events
    : events.filter((e) => e.category === category);

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-4 lg:px-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              Events
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            {loading
              ? "Loading events..."
              : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`
            }
          </p>
        </div>
        <Link
          to="/student/events/create"
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 rounded-lg text-sm font-medium text-white transition-colors shadow-lg shadow-sky-500/25"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Apply for Event</span>
        </Link>
      </header>

      {showInterestsPrompt && (!user?.interests || user.interests.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 lg:px-6"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-sky-500/20 bg-sky-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                <Heart size={15} className="text-sky-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Personalize your feed</span> — pick your interests
                (e.g. cultural, sports, tech) and matching events will show up first.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/student/settings"
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 rounded-lg text-xs font-medium text-white transition-colors whitespace-nowrap"
              >
                Set Interests
              </Link>
              <button
                onClick={() => {
                  localStorage.setItem(INTERESTS_DISMISSED_KEY, "true");
                  setShowInterestsPrompt(false);
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mx-4 lg:mx-6 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`relative px-4 sm:px-5 py-2 text-sm font-medium transition-colors z-10 capitalize whitespace-nowrap ${
              category === cat
                ? "text-foreground"
                : "text-muted-foreground hover:text-neutral-300"
            }`}
          >
            {category === cat && (
              <motion.div
                layoutId="event-category-tabs"
                className="absolute inset-0 bg-white/[0.08] border border-white/10 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="px-4 lg:px-6 space-y-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 lg:px-6 py-10"
        >
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-muted/20">
            <Calendar size={28} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              {category !== "all"
                ? "No events in this category"
                : "No events yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {category !== "all"
                ? "Try selecting a different category."
                : "Check back later for new events."}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="px-4 lg:px-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((event, index) => {
              const guestsCount = event.expectedAttendance > 0
                ? `${event.expectedAttendance.toLocaleString()}+ Guest`
                : null;

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  className="mb-4"
                >
                  <Link to={`/student/events/${event._id}`} className="block">
                    <EventShowcaseCard
                      image={event.posterUrl}
                      title={event.title}
                      description={event.description}
                      date={formatEventDate(event.startDate)}
                      guests={guestsCount}
                      badge={event.aiMatchScore > 0 ? "For You" : undefined}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
