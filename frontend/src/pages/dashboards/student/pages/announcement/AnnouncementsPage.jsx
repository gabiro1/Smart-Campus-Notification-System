/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  AlertCircle,
  Eye,
  Send,
  AlertTriangle,
  Clock,
  Bell,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import apiClient from "../../../../../services/apiClient";
import reminderService from "../../../../../services/reminderService";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

const filters = ["All", "General", "Assignment", "Urgent"];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/announcements/my-feed');
        if (response.data?.data) {
          setAnnouncements(response.data.data);
        } else {
          setAnnouncements([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setAnnouncements([]);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      return activeFilter === "All" || ann.type === activeFilter;
    });
  }, [announcements, activeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
<header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
              <span className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="text-primary" size={24} />
              </span>
              Announcements
            </h1>
          </div>

          <div className="flex gap-1 p-1 bg-card border border-border rounded-lg">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredAnnouncements.length === 0 ? (
              <div className="col-span-full bg-card border border-border p-12 rounded-2xl text-center">
                <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No announcements found</p>
              </div>
            ) : (
              filteredAnnouncements.map((ann, idx) => (
                <AnnouncementCard
                  key={ann._id}
                  announcement={ann}
                  index={idx}
                />
              ))
            )}
          </div>
      </div>
    </div>
  );
}

function AnnouncementCard({ announcement, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [qaList, setQaList] = useState(announcement.qa || []);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editText, setEditText] = useState("");

  const isUrgent = announcement.type === "Urgent";
  const sender = announcement.lecturer;
  const senderInitials = sender?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD';

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    
    setIsAiTyping(true);
    
    try {
      const response = await apiClient.post(`/announcements/${announcement._id}/question`, {
        content: commentText
      });
      
      if (response.data?.question) {
        setQaList([...qaList, response.data.question]);
        setCommentText("");
        
        try {
          await apiClient.post(`/announcements/${announcement._id}/question/${response.data.question.id}/ai-answer`);
          const aiResponse = await apiClient.get(`/announcements/${announcement._id}`);
          if (aiResponse.data?.qa) {
            setQaList(aiResponse.data.qa);
          }
        } catch (aiErr) {
          console.error("AI Error:", aiErr);
        }
      }
    } catch (error) {
      console.error("Question Error:", error);
      toast.error("Failed to post question");
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleEditQuestion = async (questionId) => {
    if (!editText.trim()) return;
    
    try {
      const response = await apiClient.patch(`/announcements/${announcement._id}/question/${questionId}`, {
        content: editText
      });
      
      if (response.data?.question) {
        setQaList(qaList.map(q => q._id === questionId ? response.data.question : q));
        setEditingQuestion(null);
        setEditText("");
        toast.success("Question updated");
      }
    } catch (error) {
      console.error("Edit Error:", error);
      toast.error("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Delete this question?")) return;
    
    try {
      await apiClient.delete(`/announcements/${announcement._id}/question/${questionId}`);
      setQaList(qaList.filter(q => q._id !== questionId));
      toast.success("Question deleted");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete question");
    }
  };

  const startEdit = (question) => {
    setEditingQuestion(question._id);
    setEditText(question.content);
  };

  const handleSetReminder = async () => {
    try {
      const dueDate = new Date();
      dueDate.setHours(dueDate.getHours() + 24);
      
      await reminderService.createReminder({
        title: announcement.title,
        note: announcement.content,
        dueDate: dueDate.toISOString(),
        priority: announcement.type === "Urgent" ? "High" : "Medium",
      });
      toast.success("Reminder created! Check your Reminders page.");
    } catch {
      toast.error("Failed to create reminder");
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-sm dark:shadow-none p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isUrgent && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50/80 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium border border-red-100/50 dark:border-red-800/50">
              <AlertTriangle size={14} />
              Urgent
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {announcement.course?.code || announcement.type}
          </span>
        </div>
        <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
          <Clock size={12} />
          {formatDate(announcement.createdAt)}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-2">
          {announcement.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
          {announcement.content}
        </p>

        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
            {senderInitials}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sender?.name || "Lecturer"}
          </span>
        </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
          <Eye size={14} />
          Mark Read
        </button>
        <button
          onClick={handleSetReminder}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <Bell size={14} />
          Set Reminder
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isExpanded
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          }`}
        >
          <MessageSquare size={14} />
          {isExpanded ? (
            <>Close Thread ({qaList.length})</>
          ) : (
            <>Discussion ({qaList.length})</>
          )}
          {isExpanded ? <ChevronUp size={16} /> : null}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 relative">
              <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200/50 dark:bg-gray-700/50" />

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  Contextual Q&A
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  AI + Lecturer responses
                </span>
              </div>

              <div className="space-y-4 relative">
                {qaList.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 pl-8">
                    No questions yet. Be the first to ask!
                  </p>
                ) : (
                  qaList.map((qa) => (
                    <div key={qa._id}>
                      <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                          {qa.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'YO'}
                        </div>
                        <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-700/50 p-3.5 rounded-2xl rounded-tl-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                {qa.user?.name || 'You'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(qa.createdAt)}
                              </span>
                            </div>
                            {editingQuestion === qa._id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditQuestion(qa._id)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                >
                                  <Send size={12} />
                                </button>
                                <button
                                  onClick={() => { setEditingQuestion(null); setEditText(""); }}
                                  className="p-1 text-gray-400 hover:bg-gray-200 rounded"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEdit(qa)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(qa._id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                          {editingQuestion === qa._id ? (
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleEditQuestion(qa._id)}
                              className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{qa.content}</p>
                          )}
                        </div>
                      </div>

                      {qa.replies?.map((reply) => (
                        <div
                          key={reply._id}
                          className="flex gap-3 ml-4 mb-4"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              reply.type === "ai"
                                ? "bg-purple-100/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                : "bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {reply.type === "ai" ? (
                              <Sparkles size={14} />
                            ) : (
                              <ShieldCheck size={14} />
                            )}
                          </div>
                          <div
                            className={`p-3.5 rounded-2xl rounded-tl-sm w-full ${
                              reply.type === "ai"
                                ? "bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100/50 dark:border-purple-800/50"
                                : "bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-800/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                {reply.user?.name || (reply.type === "ai" ? "AI Copilot" : "Lecturer")}
                                {reply.user?.title && `, ${reply.user.title}`}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
                
                {isAiTyping && (
                  <div className="flex gap-3 items-center text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    AI is thinking...
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePostComment();
                  }}
                  className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || isAiTyping}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAiTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}