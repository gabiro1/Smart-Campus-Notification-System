import { useState, useEffect } from "react";
import {
  HelpCircle, Search, Loader2, RefreshCw,
  Send, User, Reply, Clock
} from "lucide-react";
import { GlassCard } from "../../../../../components/shared";
import qaService from "../../../../../services/qaService";
import toast from "react-hot-toast";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function LecturerQATab() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState({});

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await qaService.getLecturerQuestions();
      setQuestions(res?.data || []);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleReply = async (questionId) => {
    const text = replyText[questionId]?.trim();
    if (!text) return;
    setSending((prev) => ({ ...prev, [questionId]: true }));
    try {
      await qaService.answerQuestion(questionId, text);
      setReplyText((prev) => ({ ...prev, [questionId]: "" }));
      toast.success("Reply sent");
      fetchQuestions();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const filtered = questions.filter((q) => {
    const qry = search.toLowerCase();
    return (q.content || "").toLowerCase().includes(qry) || (q.student?.name || "").toLowerCase().includes(qry);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search questions..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50" />
        </div>
        <button onClick={fetchQuestions} disabled={loading}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} padding="p-4" hover={false}>
              <div className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-1/3 h-3" />
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-1/4 h-3" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard padding="p-10">
          <div className="text-center">
            <HelpCircle size={36} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No questions from students yet</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((question) => (
            <GlassCard key={question._id} padding="p-4" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{question.student?.name || "Student"}</span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(question.createdAt)}</span>
                    {!question.answeredByLecturer && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Unanswered</span>
                    )}
                    {question.announcement?.title && (
                      <span className="text-[10px] text-muted-foreground/60">on {question.announcement.title}</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-1.5">{question.content}</p>

                  {question.answers && question.answers.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-border space-y-2">
                      {question.answers.map((a) => (
                        <div key={a._id} className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.role === "lecturer" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-accent"}`}>
                            {a.role === "lecturer" ? <Reply size={9} className="text-emerald-400" /> : <User size={9} className="text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-emerald-400">{a.role === "lecturer" ? "You" : a.user?.name || "AI"}</p>
                            <p className="text-sm text-foreground mt-0.5">{a.content}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatTimeAgo(a.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <input type="text" placeholder="Type your reply..." value={replyText[question._id] || ""}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [question._id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleReply(question._id); }}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50" />
                    <button onClick={() => handleReply(question._id)} disabled={sending[question._id] || !replyText[question._id]?.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors">
                      {sending[question._id] ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
