import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../../services/apiClient";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

const expandVariants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
};

export default function AnnouncementQA() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("unanswered");

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async () => {
    setLoading(true);
    setSelectedQuestion(null);
    try {
      const response = await apiClient.get("/announcements/lecturer-questions");
      if (response.data?.success) {
        let questionsData = response.data.data || [];
        if (filter === "unanswered") {
          questionsData = questionsData.filter((q) => !q.replies || q.replies.length === 0);
        } else if (filter === "answered") {
          questionsData = questionsData.filter((q) => q.replies && q.replies.length > 0);
        }
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (questionId) => {
    if (!replyText.trim()) return toast.error("Please enter a reply");

    setSubmitting(true);
    try {
      const response = await apiClient.post(
        `/announcements/${selectedQuestion.announcement}/question/${questionId}/reply`,
        { content: replyText }
      );

      if (response.data?.success) {
        toast.success("Reply sent successfully!");
        setReplyText("");
        setSelectedQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background p-4 md:p-6 lg:p-8"
    >
      <motion.header 
        variants={itemVariants}
        className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Questions & Answers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Respond to student questions about your announcements
          </p>
        </div>
      </motion.header>

      <motion.div 
        variants={itemVariants}
        className="flex gap-2 mb-6 overflow-x-auto"
      >
        {["all", "unanswered", "answered"].map((f, idx) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? "bg-foreground text-background dark:bg-primary dark:text-primary-foreground shadow-md"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center p-12 min-h-[300px]"
          >
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </motion.div>
        ) : questions.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-12 border border-border rounded-2xl bg-card text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4"
            >
              <MessageCircle size={24} className="text-muted-foreground" />
            </motion.div>
            <p className="text-lg font-medium text-foreground mb-1">
              No questions found
            </p>
            <p className="text-sm text-muted-foreground">
              {filter === "unanswered"
                ? "All questions have been answered!"
                : "No questions in this category"}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <AnimatePresence>
              {questions.map((question, idx) => (
                <motion.div
                  key={question._id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <motion.div
                    onClick={() =>
                      setSelectedQuestion(
                        selectedQuestion?._id === question._id ? null : question
                      )
                    }
                    whileHover={{ backgroundColor: "rgba(var(--muted), 0.3)" }}
                    className="p-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full text-xs font-medium">
                            {question.announcementTitle || "Announcement"}
                          </span>
                          {question.replies?.length > 0 ? (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 dark:text-green-400 rounded-full text-xs font-medium">
                              Answered
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-full text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-foreground line-clamp-2">
                          {question.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {question.student?.name || "Anonymous"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(question.createdAt)}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: selectedQuestion?._id === question._id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {selectedQuestion?._id === question._id ? (
                          <ChevronUp size={20} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={20} className="text-muted-foreground" />
                        )}
                      </motion.div>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {selectedQuestion?._id === question._id && (
                      <motion.div
                        variants={expandVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="border-t border-border bg-muted/20"
                      >
                        <div className="p-4 space-y-4">
                          {question.replies?.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-xs font-medium text-muted-foreground uppercase">
                                Replies
                              </p>
                              <AnimatePresence>
                                {question.replies.map((reply, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-3 bg-card border border-border rounded-lg"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Check size={12} className="text-green-500" />
                                      <span className="text-xs font-medium text-foreground">
                                        {reply.lecturer?.name || "Lecturer"}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground">
                                      {reply.content}
                                    </p>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          )}

                          <motion.div 
                            className="flex flex-col gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              rows={3}
                              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                            />
                            <motion.div className="flex justify-end">
                              <motion.button
                                onClick={() => handleReply(question._id)}
                                disabled={submitting || !replyText.trim()}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 shadow-md"
                              >
                                {submitting ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Send size={16} />
                                )}
                                {submitting ? "Sending..." : "Send Reply"}
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}