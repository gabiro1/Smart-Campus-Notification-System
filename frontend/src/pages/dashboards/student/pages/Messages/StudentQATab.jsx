import { useState, useEffect } from "react";
import {
  HelpCircle, RefreshCw, Loader2, CheckCircle, Clock, User
} from "lucide-react";
import { GlassCard } from "../../../../../components/shared";
import qaService from "../../../../../services/qaService";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

export default function StudentQATab() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const result = await qaService.getMyQuestions();
      setQuestions(result.data || []);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Questions you've asked about announcements</p>
        <button onClick={fetchQuestions} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} padding="p-4" hover={false}>
              <div className="space-y-2">
                <Skeleton className="w-2/3 h-4" />
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-1/4 h-3" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <GlassCard padding="p-6 sm:p-10">
          <div className="text-center">
            <HelpCircle size={36} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">You haven't asked any questions yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Go to the Feed tab and ask a question on any announcement</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <GlassCard key={q._id} padding="p-4" hover={false}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${q.isResolved ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {q.isResolved ? <CheckCircle size={15} /> : <Clock size={15} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-foreground font-medium">{q.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    On: {q.announcement?.title || "Announcement"}
                    <span className="text-border mx-1">·</span>
                    {formatTimeAgo(q.createdAt)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${q.isResolved ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
                      {q.isResolved ? "Answered" : "Pending"}
                    </span>
                    {q.answeredByLecturer && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                        Lecturer replied
                      </span>
                    )}
                  </div>
                  {q.answers && q.answers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      {q.answers.map((a) => (
                        <div key={a._id} className="flex items-start gap-2 pl-3 sm:pl-2 border-l-2 border-primary/30">
                          <div className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                            <User size={10} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{a.user?.name || (a.role === "ai" ? "AI Assistant" : "Lecturer")}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{a.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
