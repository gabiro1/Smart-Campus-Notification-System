import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import announcementService from "../../services/announcementService";
import toast from "react-hot-toast";

const defaultAnnouncements = [
  {
    id: 1,
    sender: "Academic Affairs",
    time: "2h ago",
    body: "Semester exams timetable has been released. Check the academic portal.",
  },
  {
    id: 2,
    sender: "Student Affairs",
    time: "Yesterday",
    body: "Campus ID card collection open. Visit Admin Block, Room 12.",
  },
];

export default function AnnouncementsPanel({ announcements: propAnnouncements }) {
  const [acknowledged, setAcknowledged] = useState({});
  const [summarizingId, setSummarizingId] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [expandedSummary, setExpandedSummary] = useState(null);
  const items = propAnnouncements && propAnnouncements.length > 0 ? propAnnouncements : defaultAnnouncements;

  const handleAcknowledge = (id) => {
    setAcknowledged((prev) => ({ ...prev, [id]: true }));
  };

  const handleSummarize = async (id, title, content) => {
    if (summaries[id]) {
      setExpandedSummary(expandedSummary === id ? null : id);
      return;
    }
    setSummarizingId(id);
    try {
      const res = await announcementService.summarizeAnnouncement(title || "", content || "");
      if (res?.success && res?.summary) {
        setSummaries((prev) => ({ ...prev, [id]: res.summary }));
        setExpandedSummary(id);
      } else {
        toast.error("Failed to generate summary");
      }
    } catch {
      toast.error("AI summarization failed");
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div>
      <h3 className="text-[15px] font-medium text-foreground mb-3">Announcements</h3>
      <div className="space-y-2">
        {items.map((item) => {
          const ack = acknowledged[item.id];
          const itemId = item._id || item.id;
          return (
            <div
              key={itemId}
              className="bg-card rounded-lg p-4 border-l-2 border-l-border"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[13px] font-medium text-foreground">{item.sender || item.lecturer?.name || "Academic Office"}</span>
                <span className="text-[12px] text-muted-foreground shrink-0">{item.time || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "")}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-2 mb-2">{item.body || item.content || item.message || ""}</p>

              {expandedSummary === itemId && summaries[itemId] && (
                <div className="mb-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={11} className="text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">AI Summary</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{summaries[itemId]}</p>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleAcknowledge(item.id)}
                  disabled={ack}
                  className={`text-[12px] px-3 py-1.5 rounded-md border transition-all duration-150 cursor-pointer ${
                    ack
                      ? "border-success text-success"
                      : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  }`}
                >
                  {ack ? "\u2713 Acknowledged" : "Acknowledge"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSummarize(itemId, item.title, item.body || item.content || item.message || "")}
                  disabled={summarizingId === itemId}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/5 text-emerald-400/70 border border-emerald-500/10 text-[10px] font-medium hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors disabled:opacity-40"
                >
                  {summarizingId === itemId ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : summaries[itemId] ? (
                    expandedSummary === itemId ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                  ) : (
                    <Sparkles size={10} />
                  )}
                  {summaries[itemId] ? (expandedSummary === itemId ? "Hide Summary" : "Show Summary") : "Summarize"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
