/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MessageSquare,
  AlertCircle,
  X,
  ChevronRight,
  Eye,
  Send,
  User,
} from "lucide-react";

import { useAuth } from "../../../../../context/AuthContext";
import dashboardService from "../../../../../services/dashboardService";
import toast from "react-hot-toast";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

const fallbackAnnouncements = [
  {
    _id: "1",
    title: "Mid-Semester Exam Schedule Released",
    content: "The mid-semester examinations will commence from next Monday. Please check the portal for your individual timetable and venue allocations.",
    course: { code: "IT401" },
    type: "General",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    viewedBy: Array(45).fill(null),
    comments: [],
  },
  {
    _id: "2",
    title: "Urgent: Network Maintenance Tonight",
    content: "The campus Wi-Fi will be unavailable tonight from 10 PM to 6 AM for system upgrades. Please save your work accordingly.",
    course: { code: "IT" },
    type: "Urgent",
    createdAt: new Date().toISOString(),
    viewedBy: Array(120).fill(null),
    comments: [],
  },
  {
    _id: "3",
    title: "Assignment Extension: Cloud Computing",
    content: "The Cloud Computing assignment due date has been extended by 48 hours. New deadline is now Sunday 11:59 PM.",
    course: { code: "IT402" },
    type: "Assignment",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    viewedBy: Array(30).fill(null),
    comments: [],
  },
  {
    _id: "4",
    title: "Guest Lecture: AI in Agriculture",
    content: "Join us for a special guest lecture on AI applications in modern agriculture. Attendance is compulsory for final year students.",
    course: { code: "IT403" },
    type: "General",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    viewedBy: Array(60).fill(null),
    comments: [],
  },
];

const filters = ["All", "General", "Assignment", "Urgent"];

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getNoticeBoard();
        if (response?.success) {
          setAnnouncements(response.data || fallbackAnnouncements);
        } else {
          setAnnouncements(fallbackAnnouncements);
        }
      } catch (err) {
        setAnnouncements(fallbackAnnouncements);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (selectedAnnouncement) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedAnnouncement]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch = ann.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" || ann.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [announcements, searchQuery, activeFilter]);

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

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 w-full sm:w-64"
              />
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
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredAnnouncements.length === 0 ? (
              <div className="bg-card border border-border p-12 rounded-2xl text-center">
                <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No announcements found</p>
              </div>
            ) : (
              filteredAnnouncements.map((ann, idx) => (
                <AnnouncementCard
                  key={ann._id}
                  announcement={ann}
                  index={idx}
                  isSelected={selectedAnnouncement?._id === ann._id}
                  onClick={() => setSelectedAnnouncement(ann)}
                />
              ))
            )}
          </div>

          <div className="hidden lg:block">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              {selectedAnnouncement ? (
                <AnnouncementDetail
                  announcement={selectedAnnouncement}
                  user={user}
                  onClose={() => setSelectedAnnouncement(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <MessageSquare size={40} className="text-muted-foreground mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Select an Announcement</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on an announcement from the list to view details and discussions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedAnnouncement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end"
              onClick={() => setSelectedAnnouncement(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-background w-full max-h-[85vh] rounded-t-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <AnnouncementDetail
                  announcement={selectedAnnouncement}
                  user={user}
                  onClose={() => setSelectedAnnouncement(null)}
                  isMobile
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnnouncementCard({ announcement, index, isSelected, onClick }) {
  const isUrgent = announcement.type === "Urgent";

  const priorityStyles = {
    Urgent: "border-l-red-500 bg-red-500/5",
    Assignment: "border-l-amber-500 bg-amber-500/5",
    General: "border-l-primary",
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-md transition-all border-l-4 ${
        priorityStyles[announcement.type] || priorityStyles.General
      } ${isSelected ? "ring-2 ring-primary" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              isUrgent
                ? "bg-red-500/10 text-red-500"
                : "bg-primary/10 text-primary"
            }`}
          >
            {announcement.course?.code || announcement.type}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(announcement.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <ChevronRight
          size={18}
          className={`text-muted-foreground transition-transform ${
            isSelected ? "text-primary rotate-90" : ""
          }`}
        />
      </div>

      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{announcement.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {announcement.content}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye size={14} /> {announcement.viewedBy?.length || 0} views
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={14} /> {announcement.comments?.length || 0} comments
        </span>
      </div>
    </motion.div>
  );
}

function AnnouncementDetail({ announcement, user, onClose, isMobile }) {
  const [comments, setComments] = useState(announcement.comments || []);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dashboardService.markAsViewed(announcement._id);
  }, [announcement._id]);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await dashboardService.addComment(announcement._id, commentText);
      if (response?.comments) {
        setComments(response.comments);
      }
      setCommentText("");
    } catch (err) {
      toast.error("Failed to post comment");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="font-semibold text-lg">Discussion</h2>
        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="py-4 border-b border-border">
        <h3 className="font-semibold mb-2">{announcement.title}</h3>
        <p className="text-sm text-muted-foreground">{announcement.content}</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare size={32} className="text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No questions yet</p>
          </div>
        ) : (
          comments.map((comment, i) => (
            <CommentBubble key={i} comment={comment} />
          ))
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePostComment();
            }}
            className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
          />
          <button
            onClick={handlePostComment}
            disabled={!commentText.trim() || isSubmitting}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentBubble({ comment }) {
  const isInstructor = comment.user?.role === "lecturer";

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <User size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{comment.user?.name || "Student"}</span>
          {isInstructor && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded">
              Instructor
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt || new Date().toISOString()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p
          className={`text-sm ${
            isInstructor ? "italic text-muted-foreground" : ""
          }`}
        >
          {comment.content}
        </p>
      </div>
    </div>
  );
}