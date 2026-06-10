import { useState, useEffect } from "react";
import { GlassCard, WidgetErrorBoundary } from "@/components/shared";
import { Bookmark, Calendar, MapPin, Clock, ExternalLink, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import eventService from "../../../../services/eventService";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

function formatEventDate(dateStr) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventService.getBookmarks(1, 50);
      const data = res?.data || res?.bookmarks || res?.events || [];
      setBookmarks(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load bookmarks");
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  if (error && bookmarks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchBookmarks}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Bookmarks</h1>
          <p className="text-muted-foreground text-sm mt-1">Events you've saved for later</p>
        </div>
        <button
          onClick={fetchBookmarks}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <WidgetErrorBoundary name="BookmarksList">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} padding="p-4" hover={false}>
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-2/3 h-4" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <GlassCard padding="p-10">
            <div className="text-center">
              <Bookmark size={36} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No bookmarks yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Browse events and bookmark the ones you like</p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((item, i) => {
              const event = item.event || item;
              return (
                <Link key={item._id || i} to={`/student/events/${event._id || item.eventId}`}>
                  <GlassCard delay={i * 0.08} padding="p-4" hoverOffset={-2}>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-background border border-border shrink-0">
                        <span className="text-sm font-bold text-foreground leading-none">
                          {event.startDate ? formatEventDate(event.startDate).split(" ")[0] : "-"}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {event.startDate ? formatEventDate(event.startDate).split(" ")[1] : ""}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground truncate">{event.title}</h3>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                            {event.category || event.type || "Event"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={11} /> {event.time || "-"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={11} /> {event.location || event.venue || "TBA"}
                          </span>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-muted-foreground shrink-0" />
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        )}
      </WidgetErrorBoundary>
    </div>
  );
}
