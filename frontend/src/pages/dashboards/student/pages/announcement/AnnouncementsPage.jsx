import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Search, Megaphone, Loader2 } from "lucide-react";
import announcementService from "../../../../../services/announcementService";

const priorityColors = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  High: "bg-red-500/10 text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await announcementService.getAllAnnouncements();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = announcements.filter((a) => {
    const title = a.title || "";
    const dept = a.lecturer?.name || a.department || "";
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || dept.toLowerCase().includes(search.toLowerCase());
    const priority = (a.priority || "medium").toLowerCase();
    const matchPriority = filter === "All" || priority === filter.toLowerCase();
    return matchSearch && matchPriority;
  });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Announcements</h1>
        <p className="text-muted-foreground text-sm mt-1">Stay informed with the latest updates</p>
      </div>

      <GlassCard padding="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {["All", "High", "Medium", "Low"].map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === p
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {p}
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
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <GlassCard key={item._id || i} delay={i * 0.05} padding="p-4" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityColors[item.priority] || priorityColors.medium}`}>
                      {item.priority || "Medium"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.content || item.body || ""}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{item.lecturer?.name || item.department || "Academic Office"}</span>
                    <span className="text-xs text-border">·</span>
                    <span className="text-xs text-muted-foreground/60">{item.createdAt ? formatDate(item.createdAt) : ""}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
          {filtered.length === 0 && (
            <GlassCard padding="p-8">
              <p className="text-center text-sm text-muted-foreground">No announcements match your search</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
