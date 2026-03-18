import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  Smile,
  MoreHorizontal,
  Trash2,
  Heart,
  Search,
  Plus,
  Eye,
  MessageSquare,
  AlertCircle,
  X,
  User as UserIcon,
  Check,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import announcementService from "../../../../services/announcementService";

// ==========================================
// 1. MAIN MANAGEMENT DASHBOARD
// ==========================================
export default function MyAnnouncements({ user: propUser }) {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const user = propUser || JSON.parse(localStorage.getItem("user"));
  const tabs = ["Active", "Draft", "Archived"];

  useEffect(() => {
    fetchMyPosts();
  }, []);

  useEffect(() => {
    if (selectedAnnouncement) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [selectedAnnouncement]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getLecturerAnnouncements();
      if (response && response.success) {
        setAnnouncements(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to sync broadcasts.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this broadcast permanently?")) return;
    try {
      setAnnouncements((prev) => prev.filter((ann) => ann._id !== id));
      await announcementService.deleteAnnouncement(id);
      toast.success("Broadcast deleted");
      if (selectedAnnouncement?._id === id) setSelectedAnnouncement(null);
    } catch (error) {
      toast.error("Delete failed.");
      fetchMyPosts();
    }
  };

  // Callback to update the list when drawer edits happen
  const handleUpdateLocal = (updatedAnn) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a._id === updatedAnn._id ? updatedAnn : a)),
    );
    setSelectedAnnouncement(updatedAnn);
  };

  const filteredData = announcements.filter((ann) => {
    const matchesSearch =
      ann.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.course?.code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (ann.status || "Active") === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white w-full p-4 relative">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          My Announcements
        </h1>
        <p className="text-neutral-400">
          Manage broadcasts and track engagement.
        </p>
      </header>

      <GlassCard
        className={`p-0 overflow-hidden flex flex-col min-h-[500px] transition-all duration-500 ${selectedAnnouncement ? "opacity-40 blur-[2px] scale-[0.99]" : ""}`}
      >
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.01]">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 relative w-full md:w-auto overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 md:flex-none px-6 py-2 text-sm font-medium transition-colors z-10 ${activeTab === tab ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-neutral-500">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">
                No {activeTab.toLowerCase()} broadcasts found
              </p>
              <button
                onClick={() => navigate("/create-announcement")}
                className="flex items-center gap-2 bg-white text-black px-5 py-2.5 mt-3 rounded-sm font-bold text-sm shadow-lg"
              >
                <Plus size={18} /> Create Broadcast
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-neutral-500">
                  <th className="p-4 font-semibold">Title & Course</th>
                  <th className="p-4 font-semibold">Audience</th>
                  <th className="p-4 font-semibold">Engagement</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedAnnouncement(item)}
                    className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <p className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 uppercase">
                        {item.course?.code} • {item.type || "General"}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-neutral-400">
                      <span className="px-2.5 py-1 bg-white/5 rounded-md border border-white/5 text-xs font-semibold">
                        {item.targetClass?.name || "All Students"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Eye size={14} className="text-emerald-500" />
                          <span className="text-sm font-bold text-white">
                            {item.viewedBy?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={14} className="text-amber-500" />
                          <span className="text-sm font-bold text-white">
                            {item.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* ICON ACTIONS */}
                        <button
                          className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnnouncement(item);
                          }}
                          className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                          title="Edit Broadcast"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, item._id)}
                          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      <AnimatePresence>
        {selectedAnnouncement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 cursor-pointer"
            />
            <LecturerSideDrawer
              ann={selectedAnnouncement}
              onClose={() => setSelectedAnnouncement(null)}
              currentUser={user}
              onUpdate={handleUpdateLocal}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 2. LECTURER SIDE DRAWER (WITH BROADCAST EDITING)
// ==========================================
function LecturerSideDrawer({ ann, onClose, currentUser, onUpdate }) {
  // Comment States
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [localComments, setLocalComments] = useState(ann.comments || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);

  // --- BROADCAST EDIT STATES ---
  const [isEditingBroadcast, setIsEditingBroadcast] = useState(false);
  const [editTitle, setEditTitle] = useState(ann.title);
  const [editContent, setEditContent] = useState(ann.content);
  const [isSavingBroadcast, setIsSavingBroadcast] = useState(false);

  const emojiCategories = [
    {
      title: "Smileys",
      emojis: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "🥲",
        "☺️",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😭",
      ],
    },
    {
      title: "Activities",
      emojis: [
        "⚽️",
        "🏀",
        "🏈",
        "⚾️",
        "🥎",
        "🎾",
        "🏐",
        "🏉",
        "🥏",
        "🎱",
        "🪀",
        "🏓",
        "🏸",
        "🏒",
        "🏑",
        "🥍",
        "🏏",
        "🥊",
        "🥋",
      ],
    },
  ];

  const generateHandle = (name) => {
    if (!name) return "student";
    const parts = name.toLowerCase().trim().split(/\s+/);
    return parts.length === 1 ? parts[0] : `${parts[0]}_${parts[1]}`;
  };

  // Update whole broadcast logic
  const handleSaveBroadcast = async () => {
    try {
      setIsSavingBroadcast(true);
      const response = await announcementService.updateAnnouncement(ann._id, {
        title: editTitle,
        content: editContent,
      });
      if (response && response.success) {
        toast.success("Broadcast updated!");
        onUpdate(response.data); // Update main list
        setIsEditingBroadcast(false);
      }
    } catch (error) {
      toast.error("Failed to update broadcast.");
    } finally {
      setIsSavingBroadcast(false);
    }
  };

  const handlePostOrUpdateComment = async () => {
    if (!commentText.trim()) return;
    try {
      setIsSubmitting(true);
      let response;
      if (editingCommentId) {
        response = await announcementService.updateComment(
          ann._id,
          editingCommentId,
          commentText,
        );
        toast.success("Comment updated!");
      } else {
        response = await announcementService.addComment(ann._id, commentText);
      }
      if (response && response.comments) setLocalComments(response.comments);
      setCommentText("");
      setReplyingTo(null);
      setEditingCommentId(null);
      setShowEmojiPicker(false);
    } catch (error) {
      toast.error(editingCommentId ? "Update failed." : "Failed to post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      setLocalComments((prev) => prev.filter((c) => c._id !== commentId));
      await announcementService.deleteComment(ann._id, commentId);
      setActiveDropdown(null);
      toast.success("Deleted");
    } catch (error) {
      setLocalComments(ann.comments);
    }
  };

  const handleEditInit = (id, content) => {
    setReplyingTo(null);
    setEditingCommentId(id);
    setCommentText(content);
    document.getElementById("comment-input")?.focus();
  };

  const threads = [];
  localComments.forEach((comment) => {
    if (!comment.content.trim().startsWith("@") || threads.length === 0)
      threads.push({ parent: comment, replies: [] });
    else threads[threads.length - 1].replies.push(comment);
  });

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0.5 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-[#121212] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col"
      onClick={() => {
        setActiveDropdown(null);
        setShowEmojiPicker(false);
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#121212] shrink-0 z-20">
        <h3 className="text-sm font-bold text-white">
          {isEditingBroadcast ? "Editing Broadcast" : "Thread Details"}
        </h3>
        <div className="flex items-center gap-2">
          {!isEditingBroadcast ? (
            <button
              onClick={() => setIsEditingBroadcast(true)}
              className="p-2 text-neutral-400 hover:text-blue-400 transition-all"
            >
              <Edit3 size={18} />
            </button>
          ) : (
            <button
              onClick={handleSaveBroadcast}
              disabled={isSavingBroadcast}
              className="p-2 text-emerald-500 hover:text-emerald-400 transition-all"
            >
              <Save size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 pb-40">
        <div className="space-y-4">
          {isEditingBroadcast ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-lg font-bold text-white outline-none focus:border-blue-500/50"
                placeholder="Broadcast Title"
              />
              <textarea
                rows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[13px] text-neutral-300 outline-none focus:border-blue-500/50 resize-none"
                placeholder="Content..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBroadcast}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingBroadcast(false)}
                  className="px-4 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-bold text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white leading-tight">
                {ann.title}
              </h1>
              <p className="text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>
            </>
          )}
        </div>

        {/* REST OF DRAWER (Comments) */}
        <div className="pt-4 border-t border-white/5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-6">
            Conversation
          </h4>
          <div className="space-y-6">
            {threads.map((thread, index) => (
              <div key={index} className="space-y-5">
                <CommentItem
                  comment={thread.parent}
                  currentUser={currentUser}
                  onReply={() => {
                    setEditingCommentId(null);
                    setReplyingTo(generateHandle(thread.parent.user?.name));
                    setCommentText(
                      `@${generateHandle(thread.parent.user?.name)} `,
                    );
                    document.getElementById("comment-input").focus();
                  }}
                  onEditInit={() =>
                    handleEditInit(thread.parent._id, thread.parent.content)
                  }
                  onDelete={() => handleDeleteComment(thread.parent._id)}
                  liked={likedComments[thread.parent._id]}
                  onLike={() =>
                    setLikedComments((p) => ({
                      ...p,
                      [thread.parent._id]: !p[thread.parent._id],
                    }))
                  }
                  generateHandle={generateHandle}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                />
                {thread.replies.length > 0 && (
                  <div className="ml-11 space-y-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedThreads((p) => ({
                          ...p,
                          [index]: !p[index],
                        }));
                      }}
                      className="text-[11px] font-bold text-neutral-500 hover:text-white flex items-center gap-3 mb-2"
                    >
                      <div className="w-6 h-[1px] bg-neutral-700"></div>
                      {expandedThreads[index]
                        ? "Hide replies"
                        : `View ${thread.replies.length} replies`}
                    </button>
                    {expandedThreads[index] &&
                      thread.replies.map((reply) => (
                        <CommentItem
                          key={reply._id}
                          comment={reply}
                          currentUser={currentUser}
                          onReply={() => {
                            setEditingCommentId(null);
                            setReplyingTo(generateHandle(reply.user?.name));
                            setCommentText(
                              `@${generateHandle(reply.user?.name)} `,
                            );
                            document.getElementById("comment-input").focus();
                          }}
                          onEditInit={() =>
                            handleEditInit(reply._id, reply.content)
                          }
                          onDelete={() => handleDeleteComment(reply._id)}
                          liked={likedComments[reply._id]}
                          onLike={() =>
                            setLikedComments((p) => ({
                              ...p,
                              [reply._id]: !p[reply._id],
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

      {/* INPUT FOOTER */}
      <div
        className="shrink-0 border-t border-white/10 bg-[#121212] px-4 py-3 absolute bottom-0 w-full z-[60]"
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
                    {cat.emojis.map((emoji, eIdx) => (
                      <button
                        key={eIdx}
                        onClick={() => {
                          setCommentText((p) => p + emoji);
                          document.getElementById("comment-input").focus();
                        }}
                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white/10 rounded-lg"
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
        <div
          className={`flex items-center gap-3 bg-[#1A1A1A] px-3 py-2.5 border rounded-xl transition-colors ${editingCommentId ? "border-amber-500/30" : "border-white/5"}`}
        >
          <Smile
            size={20}
            className="text-neutral-500 cursor-pointer hover:text-white"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          />
          <input
            id="comment-input"
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePostOrUpdateComment()}
            className="flex-1 bg-transparent text-[13px] text-white outline-none"
          />
          <button
            onClick={handlePostOrUpdateComment}
            disabled={isSubmitting || !commentText.trim()}
            className={`text-[13px] font-bold ${editingCommentId ? "text-amber-500" : "text-blue-500"} disabled:opacity-30`}
          >
            {editingCommentId ? "Update" : "Post"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. COMMENT ITEM COMPONENT (Unchanged logic)
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
        {" "}
        <span className="text-blue-400 font-medium mr-1">{parts[0]}</span>{" "}
        {parts.slice(1).join(" ")}{" "}
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
          <UserIcon size={14} className="text-neutral-400" />
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
              className="text-neutral-600 cursor-pointer"
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
