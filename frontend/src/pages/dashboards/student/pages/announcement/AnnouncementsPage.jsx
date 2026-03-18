import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Smile,
  Heart,
  Paperclip,
  User as UserIcon,
  AlertCircle,
  X,
  MessageSquare,
  Download,
  ChevronRight,
  Eye,
  Trash2,
  Edit3,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import dashboardService from "../../../../../services/dashboardService";

// ==========================================
// 1. MAIN PAGE CONTAINER
// ==========================================
export default function AnnouncementsPage({ user: propUser }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const user = propUser || JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getNoticeBoard();
        if (response && response.success) {
          setAnnouncements(response.data || []);
        }
      } catch (error) {
        toast.error("Failed to sync notice board.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (selectedAnnouncement) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [selectedAnnouncement]);

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
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-400 text-xs font-black uppercase tracking-widest">
          Decrypting Feed
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden">
      <main
        className={`transition-all duration-500 p-4 sm:p-6 md:p-8 ${selectedAnnouncement ? "opacity-30 blur-[2px] scale-[0.99]" : ""}`}
      >
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <header className="space-y-6">
            <h1 className="text-4xl font-black tracking-tighter">
              Notice Board
            </h1>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96 group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="flex bg-white/[0.02] p-1 rounded-xl border border-white/5 overflow-x-auto">
                {["All", "General", "Assignment", "Urgent"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? "bg-white/[0.08] text-white" : "text-neutral-500"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="bg-[#0A0A0A]/50 border border-white/10 rounded-[24px] backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="hidden md:flex items-center px-6 py-4 border-b border-white/10 bg-white/[0.02] text-[10px] font-black uppercase text-neutral-500">
              <div className="flex-[3]">Title & Sender</div>
              <div className="flex-1">Target</div>
              <div className="flex-1">Date</div>
              <div className="flex-1">Attachments</div>
              <div className="w-12 text-center">Action</div>
            </div>
            <div className="divide-y divide-white/5">
              {filteredAnnouncements.map((ann, idx) => (
                <TableRow
                  key={ann._id}
                  ann={ann}
                  index={idx}
                  onClick={() => setSelectedAnnouncement(ann)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

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
              currentUser={user}
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={`group flex flex-col md:flex-row md:items-center px-4 md:px-6 py-4 cursor-pointer transition-colors ${isUrgent ? "hover:bg-red-500/[0.03]" : "hover:bg-blue-500/[0.03]"}`}
    >
      <div className="flex-[3] flex items-center gap-4">
        <div
          className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border ${isUrgent ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/[0.05] text-blue-400 border-white/5"}`}
        >
          {isUrgent ? <AlertCircle size={18} /> : <MessageSquare size={18} />}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white group-hover:text-blue-400">
            {ann.title}
          </h4>
          <p className="text-xs text-neutral-500">
            {ann.lecturer?.name || "Faculty"}
          </p>
        </div>
      </div>
      <div className="flex-1 hidden md:block">
        <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] uppercase font-black text-neutral-400">
          {ann.course?.code || "General"}
        </span>
      </div>
      <div className="flex-1 hidden md:block text-xs text-neutral-400">
        {new Date(ann.createdAt).toLocaleDateString()}
      </div>
      <div className="flex-1 hidden md:flex">
        <Paperclip size={14} className="text-neutral-600" />
      </div>
      <div className="w-12 flex justify-end">
        <ChevronRight size={18} className="text-neutral-500" />
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. ENTERPRISE SIDE DRAWER (Bottom-Bar Edit UI)
// ==========================================
function SideDrawer({ ann, onClose, currentUser }) {
  const [viewCount, setViewCount] = useState(ann.viewedBy?.length || 0);
  const [localComments, setLocalComments] = useState(ann.comments || []);

  // Input States
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null); // Track WHICH comment we are editing

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);

  const emojiCategories = [
    {
      title: "Popular",
      emojis: [
        "😂",
        "😲",
        "🤩",
        "😢",
        "👏",
        "🔥",
        "🎉",
        "💯",
        "❤️",
        "🥰",
        "😭",
        "😊",
      ],
    },
    {
      title: "Activities",
      emojis: [
        "🧗",
        "🏇",
        "⛷️",
        "🏂",
        "🏌️",
        "🏄",
        "🚣",
        "🏊",
        "⛹️",
        "🏋️",
        "🚴",
        "🤸",
      ],
    },
  ];

  useEffect(() => {
    dashboardService
      .markAsViewed(ann._id)
      .then((res) => res && setViewCount(res.viewCount));
  }, [ann._id]);

  const generateHandle = (name) => {
    if (!name) return "student";
    const parts = name.toLowerCase().trim().split(/\s+/);
    return parts.length === 1 ? parts[0] : `${parts[0]}_${parts[1]}`;
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (e) {
      toast.error("Download failed.");
    }
  };

  // --- THE NEW SMART SUBMIT ENGINE ---
  const handlePostOrUpdateComment = async () => {
    if (!commentText.trim()) return;
    try {
      setIsSubmitting(true);
      let response;

      if (editingCommentId) {
        // UPDATE EXISTING
        response = await dashboardService.updateComment(
          ann._id,
          editingCommentId,
          commentText,
        );
        toast.success("Comment updated!");
      } else {
        // POST NEW
        response = await dashboardService.addComment(ann._id, commentText);
      }

      if (response && response.comments) {
        setLocalComments(response.comments);
      }

      // Clear all input states
      setCommentText("");
      setReplyingTo(null);
      setEditingCommentId(null);
      setShowEmojiPicker(false);
    } catch (e) {
      toast.error(
        editingCommentId
          ? "Update failed. Check backend route."
          : "Failed to post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete your comment?")) return;
    try {
      setLocalComments((prev) => prev.filter((c) => c._id !== commentId));
      await dashboardService.deleteComment(ann._id, commentId);
      setActiveDropdown(null);
      toast.success("Deleted");
    } catch (e) {
      setLocalComments(ann.comments);
    }
  };

  // INITIATE EDIT: Pulls text down to the input bar
  const handleEditInit = (commentId, content) => {
    setReplyingTo(null); // Close reply banner if open
    setEditingCommentId(commentId);
    setCommentText(content);
    document.getElementById("student-comment-input")?.focus();
  };

  const threads = [];
  localComments.forEach((c) => {
    if (!c.content.trim().startsWith("@") || threads.length === 0)
      threads.push({ parent: c, replies: [] });
    else threads[threads.length - 1].replies.push(c);
  });

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25 }}
      className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-[#0A0A0A] border-l border-white/10 z-50 flex flex-col shadow-2xl"
      onClick={() => {
        setActiveDropdown(null);
        setShowEmojiPicker(false);
      }}
    >
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#0D0D0D] shrink-0">
        <span className="text-xs font-bold uppercase tracking-widest">
          Notice Details
        </span>
        <X
          className="cursor-pointer text-neutral-500 hover:text-white"
          onClick={onClose}
          size={18}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 pb-48">
        <div className="space-y-4">
          <h1 className="text-xl font-bold leading-tight">{ann.title}</h1>
          <p className="text-[13px] text-neutral-300 leading-relaxed">
            {ann.content}
          </p>
        </div>

        <div className="pt-4 border-t border-white/5">
          <h4 className="text-[10px] font-black uppercase text-neutral-500 mb-6">
            Discussion Thread
          </h4>
          <div className="space-y-6">
            {threads.map((t, i) => (
              <div key={i} className="space-y-5">
                <CommentItem
                  comment={t.parent}
                  currentUser={currentUser}
                  onReply={() => {
                    setEditingCommentId(null);
                    setReplyingTo(generateHandle(t.parent.user?.name));
                    setCommentText(`@${generateHandle(t.parent.user?.name)} `);
                    document.getElementById("student-comment-input").focus();
                  }}
                  onEditInit={() =>
                    handleEditInit(t.parent._id, t.parent.content)
                  }
                  onDelete={() => handleDeleteComment(t.parent._id)}
                  liked={likedComments[t.parent._id]}
                  onLike={() =>
                    setLikedComments((p) => ({
                      ...p,
                      [t.parent._id]: !p[t.parent._id],
                    }))
                  }
                  generateHandle={generateHandle}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />

                {t.replies.length > 0 && (
                  <div className="ml-11 space-y-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedThreads((p) => ({ ...p, [i]: !p[i] }));
                      }}
                      className="text-[11px] font-bold text-neutral-500 hover:text-white flex items-center gap-2"
                    >
                      <div className="w-4 h-[1px] bg-neutral-700"></div>{" "}
                      {expandedThreads[i]
                        ? "Hide"
                        : `View ${t.replies.length} replies`}
                    </button>
                    {expandedThreads[i] &&
                      t.replies.map((r) => (
                        <CommentItem
                          key={r._id}
                          comment={r}
                          currentUser={currentUser}
                          onReply={() => {
                            setEditingCommentId(null);
                            setReplyingTo(generateHandle(r.user?.name));
                            setCommentText(`@${generateHandle(r.user?.name)} `);
                            document
                              .getElementById("student-comment-input")
                              .focus();
                          }}
                          onEditInit={() => handleEditInit(r._id, r.content)}
                          onDelete={() => handleDeleteComment(r._id)}
                          liked={likedComments[r._id]}
                          onLike={() =>
                            setLikedComments((p) => ({
                              ...p,
                              [r._id]: !p[r._id],
                            }))
                          }
                          generateHandle={generateHandle}
                          activeDropdown={activeDropdown}
                          setActiveDropdown={setActiveDropdown}
                        />
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FIXED FOOTER INPUT */}
      <div
        className="shrink-0 border-t border-white/10 bg-[#0A0A0A] px-5 py-4 absolute bottom-0 w-full z-[60]"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="absolute bottom-[110%] left-4 w-80 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl p-3 max-h-56 overflow-y-auto custom-scrollbar"
            >
              {emojiCategories.map((cat) => (
                <div key={cat.title} className="mb-4">
                  <h4 className="text-[10px] text-neutral-500 uppercase font-bold mb-2">
                    {cat.title}
                  </h4>
                  <div className="grid grid-cols-7 gap-1">
                    {cat.emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCommentText((p) => p + emoji);
                          document
                            .getElementById("student-comment-input")
                            .focus();
                        }}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Banners (Reply vs Edit) */}
        {editingCommentId ? (
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-[11px] text-amber-500 font-semibold uppercase tracking-widest">
              Editing Comment
            </span>
            <button
              onClick={() => {
                setEditingCommentId(null);
                setCommentText("");
              }}
              className="text-neutral-400 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        ) : replyingTo ? (
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-widest">
              Replying to {replyingTo}
            </span>
            <button
              onClick={() => {
                setReplyingTo(null);
                setCommentText("");
              }}
              className="text-neutral-400 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        ) : null}

        <div
          className={`flex items-center gap-3 bg-[#1A1A1A] px-3 py-2.5 border rounded-xl transition-colors ${editingCommentId ? "border-amber-500/30" : "border-white/5 focus-within:border-white/20"}`}
        >
          <Smile
            size={20}
            className="text-neutral-500 cursor-pointer hover:text-white shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
          <input
            id="student-comment-input"
            type="text"
            placeholder={
              editingCommentId
                ? "Update comment..."
                : replyingTo
                  ? "Type your reply..."
                  : "Ask a question..."
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePostOrUpdateComment()}
            className="flex-1 bg-transparent text-[13px] text-white outline-none"
          />
          <button
            onClick={handlePostOrUpdateComment}
            disabled={isSubmitting || !commentText.trim()}
            className={`text-[13px] font-bold transition-all disabled:opacity-30 ${editingCommentId ? "text-amber-500" : "text-blue-500"}`}
          >
            {editingCommentId ? "Update" : "Post"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 4. COMMENT ITEM SUB-COMPONENT
// ==========================================
function CommentItem({
  comment,
  currentUser,
  onReply,
  onEditInit,
  onDelete,
  liked,
  onLike,
  generateHandle,
  activeDropdown,
  setActiveDropdown,
}) {
  const commentUserId =
    comment.user?._id?.toString() || comment.user?.toString();
  const currentUserId =
    currentUser?._id?.toString() || currentUser?.id?.toString();
  const isMyComment =
    commentUserId && currentUserId && commentUserId === currentUserId;

  const handle = generateHandle(comment.user?.name);
  const isDropdownOpen = activeDropdown === comment._id;

  const renderContent = (content) => {
    if (!content.startsWith("@")) return content;
    const parts = content.split(" ");
    return (
      <>
        <span className="text-blue-400 font-medium mr-1">{parts[0]}</span>
        {parts.slice(1).join(" ")}
      </>
    );
  };

  return (
    <div className="flex gap-3 relative group">
      <div className="h-8 w-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center overflow-hidden">
        {comment.user?.profilePicture ? (
          <img
            src={comment.user.profilePicture}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserIcon size={14} className="text-neutral-500" />
        )}
      </div>

      <div className="flex-1 pr-14">
        <p className="text-[13px] leading-tight text-white">
          <span className="font-bold mr-2 lowercase">{handle}</span>
          <span className="text-neutral-200">
            {renderContent(comment.content)}
          </span>
        </p>
        <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-neutral-500 uppercase">
          <span>now</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReply();
            }}
            className="hover:text-white"
          >
            Reply
          </button>
        </div>
      </div>

      <div className="absolute right-0 top-1 flex flex-col items-center gap-3">
        <Heart
          size={13}
          fill={liked ? "#ef4444" : "none"}
          className={liked ? "text-red-500" : "text-neutral-600 cursor-pointer"}
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
        />

        {isMyComment && (
          <div className="relative">
            <MoreHorizontal
              size={14}
              className="text-neutral-600 cursor-pointer hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(isDropdownOpen ? null : comment._id);
              }}
            />
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-full mt-2 w-28 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditInit();
                      setActiveDropdown(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold text-white hover:bg-white/5 border-b border-white/5"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
