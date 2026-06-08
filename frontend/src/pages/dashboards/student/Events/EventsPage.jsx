import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Search, Calendar, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import eventService from "../../../../services/eventService";

function formatEventDate(dateStr) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    const fetch = async () => {
      try {
        const list = await eventService.getFeed(1, 50);
        setEvents(Array.isArray(list) ? list : []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const categories = ["All", ...new Set(events.map((e) => e.category || e.type || "Other").filter(Boolean))];

  const filtered = events.filter((e) => {
    const matchSearch = (e.title || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || (e.category || e.type || "Other") === cat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Events</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and discover campus events</p>
      </div>

      <GlassCard padding="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  cat === c ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((event, i) => (
            <Link key={event._id || i} to={`/student/events/${event._id}`}>
              <GlassCard delay={i * 0.06} padding="p-4" hoverOffset={-3}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-background border border-border shrink-0">
                    <span className="text-sm font-bold text-foreground leading-none">
                      {event.startDate ? formatEventDate(event.startDate).split(" ")[0] : "—"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {event.startDate ? formatEventDate(event.startDate).split(" ")[1] : ""}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{event.title}</h3>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent text-muted-foreground shrink-0">
                        {event.category || event.type || "Event"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} /> {event.startDate ? formatTime(event.startDate) : ""}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={11} /> {event.location || event.venue || "TBA"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-1.5 line-clamp-1">
                      {event.description || ""}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground shrink-0 mt-1" />
                </div>
              </GlassCard>
            </Link>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full">
              <GlassCard padding="p-8">
                <p className="text-center text-sm text-muted-foreground">No events found</p>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
