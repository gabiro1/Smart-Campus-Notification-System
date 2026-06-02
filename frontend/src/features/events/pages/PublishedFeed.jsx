import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Users, Star, Bookmark,
  Search, Loader2, Grid, List, RefreshCw, Tag,
  ExternalLink, Sparkles
} from 'lucide-react';
import eventService from '../../../services/eventService';

const CATEGORIES = [
  'all', 'academic', 'cultural', 'sports', 'social',
  'workshop', 'seminar', 'meeting', 'ceremony',
  'competition', 'fundraiser', 'orientation'
];

export default function PublishedFeed({ onEventClick }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.getFeed();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Feed fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const filtered = events.filter(e => {
    if (category !== 'all' && e.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q);
    }
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Events</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base ml-10">
            Discover campus events curated for you
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-accent text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={fetchFeed}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none cursor-pointer"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
              <div className="h-40 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-5 w-3/4 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Calendar size={28} className="text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-1">No events found</p>
          <p className="text-muted-foreground text-sm">
            {search || category !== 'all' ? 'Try adjusting your search or filters.' : 'Check back later for new events.'}
          </p>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(event => (
            <motion.div
              key={event._id}
              variants={cardVariants}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => onEventClick?.(event._id)}
            >
              {event.posterUrl ? (
                <div className="h-40 overflow-hidden">
                  <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Calendar size={36} className="text-muted-foreground/40" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 capitalize">
                    {event.category}
                  </span>
                  {event.avgRating > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                      <Star size={10} className="fill-amber-400" />
                      {event.avgRating}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2 leading-snug">{event.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{event.description}</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-1.5">
                    <Calendar size={11} />
                    {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="inline-flex items-center gap-1.5 ml-0 sm:ml-0">
                    <Clock size={11} />
                    {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
                  </div>
                  {event.venue && (
                    <div className="inline-flex items-center gap-1.5 truncate max-w-full">
                      <MapPin size={11} />
                      {event.venue}
                    </div>
                  )}
                  {event.expectedAttendance > 0 && (
                    <div className="inline-flex items-center gap-1.5">
                      <Users size={11} />
                      {event.expectedAttendance} expected
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {filtered.map(event => (
            <motion.div
              key={event._id}
              variants={cardVariants}
              className="bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-primary/30 transition-all duration-200 cursor-pointer flex items-start gap-3 sm:gap-4"
              onClick={() => onEventClick?.(event._id)}
            >
              {event.posterUrl ? (
                <img src={event.posterUrl} alt="" className="w-10 sm:w-16 h-10 sm:h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 sm:w-16 h-10 sm:h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Calendar size={16} className="sm:size-[22px] text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 capitalize">{event.category}</span>
                </div>
                <h3 className="font-medium text-foreground">{event.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar size={11} />{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={11} />{event.startTime}</span>
                  {event.venue && <span className="inline-flex items-center gap-1"><MapPin size={11} />{event.venue}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {event.avgRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-amber-400">
                    <Star size={10} className="fill-amber-400" />
                    {event.avgRating}
                  </span>
                )}
                <ExternalLink size={14} className="text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
