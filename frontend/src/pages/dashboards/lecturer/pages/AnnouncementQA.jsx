import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Loader2, RefreshCw, AlertTriangle,
  ChevronDown, ChevronUp, User, Reply, Clock, Search
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import announcementService from "../../../../services/announcementService";
import toast from "react-hot-toast";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function QuestionCard({ question, onReply }) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await announcementService.replyToQuestion(question.announcementId || question.announcement, question._id, replyText);
      toast.success("Reply sent");
      setReplyText("");
      question.replies = [...(question.replies || []), { text: replyText, createdAt: new Date().toISOString(), content: replyText }];
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <GlassCard padding="p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">{question.student?.name || question.studentId?.name || "Student"}</span>
            <span className="text-xs text-muted-foreground">{formatDate(question.createdAt)}</span>
          </div>
          <p className="text-sm text-foreground mt-1.5">{question.question || question.text || question.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare size={11} /> {question.replies?.length || 0} replies</span>
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-muted-foreground hover:text-blue-400 flex items-center gap-1">
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {expanded ? "Hide" : "Show"} replies
            </button>
          </div>
          {expanded && (
            <div className="mt-3 pl-4 border-l-2 border-border space-y-3">
              <AnimatePresence>
                {(question.replies || []).map((reply, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Reply size={10} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-400 font-medium">You</p>
                      <p className="text-sm text-foreground mt-0.5">{reply.text || reply.content || reply}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(reply.createdAt)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex gap-2 pt-1">
                <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-blue-500/50 placeholder:text-muted-foreground/50" />
                <button onClick={handleSubmit} disabled={sending || !replyText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors">
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export default function AnnouncementQA() {
  const [searchParams] = useSearchParams();
  const announcementId = searchParams.get("announcement");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await announcementService.getLecturerQuestions();
      const allQuestions = Array.isArray(res?.data || res?.questions || res) ? (res?.data || res?.questions || res) : [];
      setQuestions(announcementId ? allQuestions.filter((q) => (q.announcementId || q.announcement) === announcementId) : allQuestions);
    } catch {
      setError("Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [announcementId]);

  const filtered = questions.filter((q) => {
    const text = (q.question || q.text || q.content || "").toLowerCase();
    const name = (q.student?.name || q.studentId?.name || "").toLowerCase();
    const qry = search.toLowerCase();
    return text.includes(qry) || name.includes(qry);
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={fetchQuestions} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Questions & Answers</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {announcementId ? "Questions for this announcement" : "All questions from students on your announcements"}
        </p>
      </motion.div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search questions..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50" />
        </div>
        <button onClick={fetchQuestions} disabled={loading}
          className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} padding="p-4" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-3 bg-accent/50 animate-pulse rounded" />
                  <div className="w-full h-3 bg-accent/50 animate-pulse rounded" />
                  <div className="w-1/4 h-3 bg-accent/50 animate-pulse rounded" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard padding="p-10">
          <div className="text-center">
            <MessageSquare size={36} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No questions yet</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((q, i) => (
              <motion.div key={q._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <QuestionCard question={q} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
