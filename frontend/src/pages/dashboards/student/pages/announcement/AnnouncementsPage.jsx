import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Paperclip,
  Calendar,
  User as UserIcon,
  BookOpen,
  AlertCircle,
  X,
  MessageSquare,
  Bookmark,
  Download,
  MoreVertical,
  ChevronRight,
  Eye,
  Trash2, // ✅ The crucial import for our delete pipeline
} from "lucide-react";
import toast from "react-hot-toast";
import dashboardService from "../../../../../services/dashboardService";

// ==========================================
// 1. MAIN PAGE CONTAINER
// ==========================================
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Interaction State
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // --- DATA MOUNTING ENGINE ---
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getNoticeBoard();
        if (response && response.success) {
          setAnnouncements(response.data || []);
        } else {
          setAnnouncements([]);
        }
      } catch (error) {
        console.error("Notice Board Error:", error);
        toast.error("Failed to sync notice board.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (selectedAnnouncement) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedAnnouncement]);

  // --- UX ENGINE: Real-time search and filtering ---
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const title = ann.title || "";
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" || ann.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [announcements, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-8 flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase">
          Decrypting Feed
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Ambient Glow */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

      <main
        className={`transition-all duration-500 p-4 sm:p-6 md:p-8 ${selectedAnnouncement ? "opacity-30 blur-[2px] scale-[0.99]" : "opacity-100"}`}
      >
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          {/* HEADER */}
          <header className="space-y-6">
            <div>
              <h1 className="text-4xl font-black tracking-tighter mb-2">
                Notice Board
              </h1>
              <p className="text-neutral-400 text-sm font-medium">
                Academic broadcasts, securely encrypted for your cohort.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96 group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-500 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
                />
              </div>

              <div className="flex bg-white/[0.02] p-1 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto scrollbar-hide">
                {["All", "General", "Assignment", "Urgent"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                      activeFilter === filter
                        ? "bg-white/[0.08] text-white shadow-sm"
                        : "text-neutral-500 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* THE DATA TABLE */}
          <div className="bg-[#0A0A0A]/50 border border-white/10 rounded-[24px] backdrop-blur-md overflow-hidden shadow-2xl">
            {/* Table Header Row (Hidden on mobile) */}
            <div className="hidden md:flex items-center px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex-[3] text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Title & Sender
              </div>
              <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Target
              </div>
              <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Date
              </div>
              <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Attachments
              </div>
              <div className="w-12 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">
                Action
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredAnnouncements.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                  >
                    <Filter
                      size={32}
                      className="mx-auto text-neutral-700 mb-4"
                    />
                    <p className="text-neutral-500 text-sm">
                      No records match your search criteria.
                    </p>
                  </motion.div>
                ) : (
                  filteredAnnouncements.map((ann, index) => (
                    <TableRow
                      key={ann._id}
                      ann={ann}
                      index={index}
                      onClick={() => setSelectedAnnouncement(ann)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAY & DRAWER */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-40 cursor-pointer"
            />
            <SideDrawer
              ann={selectedAnnouncement}
              onClose={() => setSelectedAnnouncement(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 2. THE TABLE ROW COMPONENT
// ==========================================
function TableRow({ ann, index, onClick }) {
  const isUrgent = ann.type === "Urgent";
  const dateStr = new Date(ann.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={onClick}
      className={`group flex flex-col md:flex-row md:items-center px-4 md:px-6 py-4 cursor-pointer transition-colors duration-200 ${
        isUrgent ? "hover:bg-red-500/[0.03]" : "hover:bg-blue-500/[0.03]"
      }`}
    >
      <div className="flex-[3] flex items-start md:items-center gap-4 mb-3 md:mb-0">
        <div
          className={`mt-1 md:mt-0 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border ${
            isUrgent
              ? "bg-red-500/10 text-red-500 border-red-500/20"
              : "bg-white/[0.05] text-blue-400 border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20"
          } transition-colors`}
        >
          {isUrgent ? <AlertCircle size={18} /> : <MessageSquare size={18} />}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {ann.title}
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            {ann.lecturer?.name || "Faculty"}
          </p>
        </div>
      </div>

      <div className="flex-1 hidden md:block">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
            isUrgent
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-white/5 text-neutral-400 border-white/10"
          }`}
        >
          {ann.course?.code || ann.type || "General"}
        </span>
      </div>

      <div className="flex-1 hidden md:block text-xs font-medium text-neutral-400">
        {dateStr}
      </div>

      <div className="flex-1 hidden md:flex items-center gap-2">
        {ann.attachments?.length > 0 ? (
          <div className="flex -space-x-2">
            {ann.attachments.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-blue-500/20 border border-[#0A0A0A] flex items-center justify-center text-blue-400 z-10"
              >
                <Paperclip size={10} />
              </div>
            ))}
            {ann.attachments.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-white/10 border border-[#0A0A0A] flex items-center justify-center text-[8px] font-bold text-white z-0">
                +{ann.attachments.length - 3}
              </div>
            )}
          </div>
        ) : (
          <span className="text-neutral-600 text-[10px] uppercase font-bold tracking-widest">
            —
          </span>
        )}
      </div>

      <div className="w-full md:w-12 flex items-center justify-between md:justify-end mt-2 md:mt-0 pt-2 md:pt-0 border-t border-white/5 md:border-0">
        <span className="md:hidden text-[10px] font-black uppercase text-blue-500">
          View Details
        </span>
        <button className="p-2 rounded-lg text-neutral-500 group-hover:text-white group-hover:bg-white/10 transition-all">
          <ChevronRight size={18} className="md:block hidden" />
          <MoreVertical size={18} className="md:hidden block" />
        </button>
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. ENTERPRISE SIDE DRAWER (Full CRUD Pipeline)
// ==========================================
function SideDrawer({ ann, onClose, currentUser }) {
  // View State
  const [viewCount, setViewCount] = useState(ann.viewedBy?.length || 0);

  // Comment State
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [localComments, setLocalComments] = useState(ann.comments || []);

  const formattedDate = new Date(ann.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  // --- AUTO-VIEW ENGINE ---
  useEffect(() => {
    const registerView = async () => {
      try {
        const response = await dashboardService.markAsViewed(ann._id);
        if (response && response.viewCount !== undefined) {
          setViewCount(response.viewCount);
        }
      } catch (error) {
        console.error("Failed to register read receipt silently:", error);
      }
    };
    registerView();
  }, [ann._id]);

  // --- ACTIONS ---
  const handleReplyClick = (userName) => {
    setReplyingTo(userName);
    setCommentText(`@${userName} `);
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);

      // 1. Optimistic UI: Fake it instantly
      const optimisticComment = {
        _id: "temp-" + Date.now(),
        user: { name: "You", _id: currentUser?._id },
        content: commentText,
        createdAt: new Date().toISOString(),
      };

      setLocalComments([...localComments, optimisticComment]);
      const textToSubmit = commentText;

      setCommentText("");
      setReplyingTo(null);

      // 2. The Actual Database Call
      const response = await dashboardService.addComment(ann._id, textToSubmit);

      // 3. Replace the fake comment with the real database data
      if (response && response.comments) {
        setLocalComments(response.comments);
      }
    } catch (error) {
      console.error("Comment Error:", error);
      toast.error("Failed to post comment. Check your connection.");
      // Rollback the optimistic UI if it failed
      setLocalComments(
        localComments.filter((c) => !c._id?.toString().startsWith("temp-")),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    // Prevent trying to delete a fake optimistic UI comment that's still loading
    if (commentId.toString().startsWith("temp-")) return;

    try {
      // 1. Optimistic UI: Hide it instantly so the app feels lightning fast
      setLocalComments(localComments.filter((c) => c._id !== commentId));

      // 2. The Actual Database Call
      const response = await dashboardService.deleteComment(ann._id, commentId);

      // 3. Sync with the exact backend truth just to be safe
      if (response && response.comments) {
        setLocalComments(response.comments);
      }
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete comment.");
      // If it failed, put the comment back on the screen!
      setLocalComments(ann.comments);
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const loadingToast = toast.loading("Downloading...");
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.dismiss(loadingToast);
      toast.success("Download complete");
    } catch (error) {
      toast.error("Failed to download file.");
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0.5 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-[#0A0A0A] border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 bg-[#0D0D0D] shrink-0">
        <span className="text-xs font-bold text-white uppercase tracking-widest">
          Notice Details
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 pb-32">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <UserIcon size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {ann.lecturer?.name || "Faculty Member"}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {ann.course?.code || ann.type || "General Update"}
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white mb-3 leading-tight">
            {ann.title}
          </h1>
          <p className="text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {ann.content}
          </p>
        </motion.div>

        {/* Attachments */}
        {ann.attachments?.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
              Documents
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {ann.attachments.map((file, idx) => {
                const fileName =
                  file.split("/").pop() || `Document_${idx + 1}.pdf`;
                return (
                  <button
                    key={idx}
                    onClick={() => handleDownload(file, fileName)}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group w-full text-left"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                        <Paperclip size={14} />
                      </div>
                      <span className="text-[11px] font-medium text-neutral-300 truncate group-hover:text-blue-100">
                        {fileName}
                      </span>
                    </div>
                    <Download
                      size={14}
                      className="text-neutral-500 group-hover:text-blue-400 shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Comments / Discussion */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4 border-t border-white/5"
        >
          <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-5">
            Clarifications & Discussion
          </h4>
          <div className="space-y-5">
            {localComments.length > 0 ? (
              localComments.map((comment, idx) => {
                const commenterName = comment.user?.name || "Student";
                const formattedContent = comment.content
                  .split(" ")
                  .map((word, i) =>
                    word.startsWith("@") ? (
                      <span key={i} className="text-blue-400 font-semibold">
                        {word}{" "}
                      </span>
                    ) : (
                      `${word} `
                    ),
                  );

                // ✅ OVERRIDE: We set this to true for now so you can test the delete route visually.
                const isMyComment = true;

                return (
                  <div
                    key={idx}
                    className="flex gap-3 group relative p-2 -mx-2 rounded-xl transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                      {comment.user?.profilePicture ? (
                        <img
                          src={comment.user.profilePicture}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon size={14} className="text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1 pr-8">
                      <p className="text-[13px] text-neutral-200">
                        <span className="font-bold text-white mr-2">
                          {commenterName}
                        </span>
                        {formattedContent}
                      </p>
                      <div className="flex items-center gap-4 mt-1.5 text-[11px] font-semibold text-neutral-500">
                        <span>
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleDateString()
                            : "Just now"}
                        </span>
                        <button
                          onClick={() => handleReplyClick(commenterName)}
                          className="hover:text-white transition-colors"
                        >
                          Reply
                        </button>
                        {/* The Delete Button - Lightly visible, turns red on hover */}
                        {isMyComment && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className=" p-2 text-neutral-600 opacity-50 hover:opacity-100 hover:text-red-500 "
                            title="Delete Comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 py-12 text-center">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  No comments yet.
                </h3>
                <p className="text-base text-neutral-400">
                  Start the conversation.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 3. Fixed Footer */}
      <div className="shrink-0 border-t border-white/10 bg-[#0A0A0A] px-5 py-4 space-y-3 absolute bottom-0 w-full">
        {/* View Count & Date Row */}
        <div className="flex items-center justify-between text-white pb-1">
          <div className="flex items-center gap-2 text-neutral-400">
            <Eye size={18} className="text-blue-500" />
            <span className="text-sm font-bold text-white">
              {viewCount} Views
            </span>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-neutral-500 uppercase tracking-wide">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Reply Indicator Banner */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-blue-500/10 rounded-t-lg px-3 py-1.5 border-b border-blue-500/20">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
              Replying to {replyingTo}
            </span>
            <button
              onClick={() => {
                setReplyingTo(null);
                setCommentText("");
              }}
              className="text-blue-400 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Comment Input */}
        <div
          className={`flex items-center gap-3 bg-[#1A1A1A] px-4 py-3.5 border transition-colors ${
            replyingTo
              ? "rounded-b-xl border-blue-500/30"
              : "rounded-xl border-white/5 focus-within:border-white/20"
          }`}
        >
          <MessageSquare size={18} className="text-neutral-500 shrink-0" />
          <input
            type="text"
            placeholder={
              replyingTo ? "Type your reply..." : "Ask for clarification..."
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button
            onClick={handlePostComment}
            disabled={isSubmitting || !commentText.trim()}
            className="text-[13px] font-semibold text-blue-500 hover:text-white disabled:text-neutral-600 transition-colors shrink-0"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
