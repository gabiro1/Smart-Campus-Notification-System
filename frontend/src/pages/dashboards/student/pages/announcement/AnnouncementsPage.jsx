/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  MessageSquare,
  AlertCircle,
  Bell,
  Sparkles,
  ShieldCheck,
  Loader2,
  Send,
  Pencil,
  Trash2,
  X,
  Check,
  Bookmark,
  CheckCheck,
  Clock,
  Search,
  ArrowRight,
  ChevronRight,
  Pin,
  FileText,
  Lightbulb,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";
import apiClient from "../../../../../services/apiClient";
import reminderService from "../../../../../services/reminderService";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const courseColors = {
  IT4261: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-500" },
  IT4250: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-500" },
  IT4200: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30", dot: "bg-violet-500" },
  ADMIN: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-500" },
  CS301: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-500" },
  DEFAULT: { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border", dot: "bg-muted-foreground" },
};

const getCourseStyle = (code) => courseColors[code] || courseColors.DEFAULT;

const fallbackAnnouncements = [
  {
    _id: "fb1",
    title: "Final Exam Schedule Released",
    content: "The final examination timetable for this semester has been published. Please check your student portal for your individual schedule. Contact the examination office if you have any conflicts.",
    type: "General",
    course: { code: "IT4261" },
    lecturer: { name: "Dr. Sarah Johnson" },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
    isPinned: false,
    qa: [],
  },
  {
    _id: "fb2",
    title: "Assignment Submission Deadline Extended",
    content: "Due to technical issues with the submission portal, the deadline for the AI Project proposal has been extended by 48 hours. New deadline is now Sunday 11:59 PM.",
    type: "Assignment",
    course: { code: "IT4250" },
    lecturer: { name: "Prof. Michael Chen" },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
    isPinned: false,
    deadline: "Sunday 11:59 PM",
    qa: [],
  },
  {
    _id: "fb3",
    title: "Campus Closure Notice - Maintenance",
    content: "The main campus will be closed this weekend for scheduled maintenance. All weekend classes are cancelled. Online classes will proceed as normal.",
    type: "Urgent",
    course: { code: "ADMIN" },
    lecturer: { name: "Campus Administration" },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
    isPinned: true,
    deadline: "Saturday 6:00 AM",
    qa: [],
  },
  {
    _id: "fb4",
    title: "Guest Lecture: AI in Modern Agriculture",
    content: "We are hosting a guest lecture on AI applications in agriculture. All students are encouraged to attend. Certificate of attendance will be provided.",
    type: "General",
    course: { code: "IT4200" },
    lecturer: { name: "Dr. Emily Watson" },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    isRead: true,
    isPinned: false,
    qa: [],
  },
  {
    _id: "fb5",
    title: "Quiz 2 Results Available",
    content: "Your results for Database Systems Quiz 2 are now available. The average score was 78%. Please review your answers and reach out if you have questions.",
    type: "General",
    course: { code: "CS301" },
    lecturer: { name: "Dr. James Wilson" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
    isPinned: false,
    qa: [],
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(fallbackAnnouncements);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [bookmarked, setBookmarked] = useState([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await apiClient.get('/announcements/my-feed');
        if (response.data?.data && response.data.data.length > 0) {
          setAnnouncements(response.data.data);
          setSelectedAnnouncement(response.data.data[0]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (fallbackAnnouncements.length > 0) {
          setSelectedAnnouncement(fallbackAnnouncements[0]);
        }
      }
      setTimeout(() => setIsInitialLoad(false), 300);
    };
    fetchAnnouncements();
  }, []);

  const stats = useMemo(() => {
    const unread = announcements.filter(a => !a.isRead).length;
    const urgent = announcements.filter(a => a.type === "Urgent").length;
    return { total: announcements.length, unread, urgent };
  }, [announcements]);

  const filterCounts = useMemo(() => ({
    All: announcements.length,
    General: announcements.filter(a => a.type === "General").length,
    Assignment: announcements.filter(a => a.type === "Assignment").length,
    Urgent: announcements.filter(a => a.type === "Urgent").length,
  }), [announcements]);

  const filteredAnnouncements = useMemo(() => {
    let filtered = announcements;
    if (activeFilter !== "All") {
      filtered = filtered.filter(a => a.type === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.content.toLowerCase().includes(query) ||
        a.course?.code?.toLowerCase().includes(query)
      );
    }
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [announcements, activeFilter, searchQuery]);

  useEffect(() => {
    if (selectedAnnouncement && searchQuery) {
      const found = filteredAnnouncements.find(a => a._id === selectedAnnouncement._id);
      if (found) setSelectedAnnouncement(found);
      else if (filteredAnnouncements.length > 0) setSelectedAnnouncement(filteredAnnouncements[0]);
    }
  }, [searchQuery, filteredAnnouncements]);

  const markAsRead = useCallback((id) => {
    setAnnouncements(prev => prev.map(ann => 
      ann._id === id ? { ...ann, isRead: true } : ann
    ));
    if (selectedAnnouncement?._id === id) {
      setSelectedAnnouncement(prev => ({ ...prev, isRead: true }));
    }
  }, [selectedAnnouncement]);

  const markAllAsRead = () => {
    setAnnouncements(prev => prev.map(ann => ({ ...ann, isRead: true })));
    setSelectedAnnouncement(prev => prev ? { ...prev, isRead: true } : null);
    toast.success("All announcements marked as read");
  };

  const toggleBookmark = (id) => {
    setBookmarked(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const generateAiSuggestion = () => {
    if (!selectedAnnouncement) return;
    const suggestions = [
      "This announcement requires immediate action. Make sure to set a reminder!",
      "Review the key dates and add them to your calendar.",
      "Check with your course coordinator if you have any conflicts.",
      "Share this with classmates who might have missed it.",
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setAiSuggestion(random);
    setShowAiPanel(true);
  };

  const handleSelectAnnouncement = (ann) => {
    setSelectedAnnouncement(ann);
    if (!ann.isRead) markAsRead(ann._id);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isInitialLoad) return <AnnouncementSkeleton />;

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-background text-foreground">
        <main className="p-4 sm:p-5 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold">Announcements</h1>
                <div className="flex items-center gap-2">
                  <motion.span 
                    key={stats.unread}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400"
                  >
                    {stats.unread} unread
                  </motion.span>
                  {stats.unread > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <div className="flex gap-1 p-0.5 bg-muted/30 rounded-lg">
                  {["All", "General", "Assignment", "Urgent"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                        activeFilter === filter
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {filter}
                      <span className="text-[10px] px-1 rounded bg-muted/50">{filterCounts[filter]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1 space-y-2">
                <AnimatePresence mode="popLayout">
                  {filteredAnnouncements.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card border border-border p-8 rounded-xl text-center"
                    >
                      <AlertCircle size={32} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">No announcements found</p>
                    </motion.div>
                  ) : (
                    filteredAnnouncements.map((ann, idx) => (
                      <motion.div
                        key={ann._id}
                        layout
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={() => handleSelectAnnouncement(ann)}
                        className={`cursor-pointer rounded-xl border transition-all duration-200 ${
                          selectedAnnouncement?._id === ann._id
                            ? "bg-accent/10 border-primary/30 shadow-md"
                            : "bg-card border-border hover:border-border hover:shadow-sm"
                        } ${!ann.isRead ? "border-l-2 border-l-blue-500" : ""}`}
                      >
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            {!ann.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getCourseStyle(ann.course?.code).bg} ${getCourseStyle(ann.course?.code).text}`}>
                              {ann.course?.code || ann.type}
                            </span>
                            {ann.isPinned && <Pin size={10} className="text-amber-500" />}
                            <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(ann.createdAt)}</span>
                          </div>
                          <h3 className={`text-sm line-clamp-1 ${!ann.isRead ? "font-semibold" : "font-medium text-foreground/80"}`}>
                            {ann.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {ann.lecturer?.name}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {selectedAnnouncement ? (
                    <motion.div
                      key={selectedAnnouncement._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <DetailPanel
                        announcement={selectedAnnouncement}
                        isBookmarked={bookmarked.includes(selectedAnnouncement._id)}
                        onToggleBookmark={() => toggleBookmark(selectedAnnouncement._id)}
                        onMarkAsRead={() => markAsRead(selectedAnnouncement._id)}
                        onGenerateAiSuggestion={generateAiSuggestion}
                        showAiPanel={showAiPanel}
                        aiSuggestion={aiSuggestion}
                        setShowAiPanel={setShowAiPanel}
                        setAiSuggestion={setAiSuggestion}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card border border-border rounded-xl p-12 text-center"
                    >
                      <FileText size={40} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">Select an announcement to view details</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </LayoutGroup>
  );
}

function DetailPanel({ announcement, isBookmarked, onToggleBookmark, onMarkAsRead, onGenerateAiSuggestion, showAiPanel, aiSuggestion, setShowAiPanel, setAiSuggestion }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [qaList, setQaList] = useState(announcement.qa || []);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(null);

  const isUrgent = announcement.type === "Urgent";
  const isAssignment = announcement.type === "Assignment";
  const senderInitials = announcement.lecturer?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD';
  const courseStyle = getCourseStyle(announcement.course?.code);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setIsAiTyping(true);
    try {
      const response = await apiClient.post(`/announcements/${announcement._id}/question`, { content: commentText });
      if (response.data?.question) {
        setQaList([...qaList, response.data.question]);
        setCommentText("");
      }
    } catch (error) {
      console.error("Question Error:", error);
      toast.error("Failed to post question");
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleGenerateAiAnswer = async (questionId) => {
    setGeneratingAi(questionId);
    try {
      await apiClient.post(`/announcements/${announcement._id}/question/${questionId}/ai-answer`);
      const response = await apiClient.get(`/announcements/${announcement._id}`);
      if (response.data?.qa) setQaList(response.data.qa);
      toast.success("AI answer generated!");
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to generate AI answer");
    } finally {
      setGeneratingAi(null);
    }
  };

  const handleSetReminder = async () => {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 24);
    const reminderData = {
      title: announcement.title,
      note: announcement.content,
      dueDate: dueDate.toISOString(),
      priority: isUrgent ? "High" : "Medium",
    };
    
    let saved = false;
    try {
      await reminderService.createReminder(reminderData);
      toast.success("Reminder created!");
      saved = true;
    } catch (error) {
      // Fallback to localStorage
    }
    
    if (!saved) {
      const reminders = JSON.parse(localStorage.getItem('localReminders') || '[]');
      const newReminder = { ...reminderData, id: Date.now(), createdAt: new Date().toISOString() };
      localStorage.setItem('localReminders', JSON.stringify([...reminders, newReminder]));
      toast.success("Reminder saved!");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
              {senderInitials}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{announcement.lecturer?.name || "Lecturer"}</p>
              <p className="text-xs text-muted-foreground">{announcement.course?.code || announcement.type} • {formatDate(announcement.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleBookmark}
              className={`p-2 rounded-lg transition-colors ${isBookmarked ? "text-amber-500" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Bookmark size={16} className={isBookmarked ? "fill-current" : ""} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSetReminder}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell size={16} />
            </motion.button>
            {!announcement.isRead && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMarkAsRead}
                className="p-2 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              >
                <Check size={16} />
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {isUrgent && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
              <Zap size={10} /> Urgent
            </span>
          )}
          {isAssignment && !isUrgent && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Assignment
            </span>
          )}
          {announcement.deadline && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <Clock size={12} />
              Due: {announcement.deadline}
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-2">{announcement.title}</h2>
        
        <p className={`text-sm text-muted-foreground leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
          {announcement.content}
        </p>
        
        {announcement.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
          >
            {isExpanded ? "Show less" : "Read more"}
            <ChevronRight size={12} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </button>
        )}

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerateAiSuggestion}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-colors"
          >
            <Sparkles size={14} />
            AI Insights
          </motion.button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-muted transition-colors"
          >
            <MessageSquare size={14} />
            Discussion ({qaList.length})
          </button>
        </div>

        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">AI Copilot Suggestion</span>
                  <button onClick={() => setShowAiPanel(false)} className="ml-auto text-muted-foreground hover:text-foreground">
                    <X size={12} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{aiSuggestion || "Generating insights..."}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-border max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                {qaList.length === 0 ? (
                  <div className="text-center py-4">
                    <MessageSquare size={24} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">No questions yet. Start the discussion!</p>
                  </div>
                ) : (
                  qaList.slice(0, 3).map((qa) => (
                    <div key={qa._id} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium text-foreground">{qa.user?.name || 'You'}</span>
                        <span className="text-[9px] text-muted-foreground">{formatDate(qa.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{qa.content}</p>
                      {qa.replies?.length > 0 && (
                        <p className="text-[10px] text-primary mt-1">{qa.replies.length} replies</p>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || isAiTyping}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isAiTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnnouncementSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-40 bg-muted rounded mb-4" />
        <div className="h-10 bg-muted rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-card border border-border rounded-xl" />
            ))}
          </div>
          <div className="lg:col-span-2">
            <div className="h-96 bg-card border border-border rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}