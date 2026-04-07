import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
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
  TriangleAlert,
  Archive,
  ArchiveRestore,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";
import announcementService from "../../../../services/announcementService";
import AnnouncementAnalytics from "../../../../components/dashboards/AnnouncementAnalytics";

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
  const [analyticsModalId, setAnalyticsModalId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");

  const user = propUser || JSON.parse(localStorage.getItem("user"));
  const tabs = ["Active", "Scheduled", "Draft", "Archived"];

  useEffect(() => {
    fetchMyPosts();
  }, []);

  useEffect(() => {
    if (selectedAnnouncement || deleteId)
      document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [selectedAnnouncement, deleteId]);

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

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const id = deleteId;
      setDeleteId(null);
      setAnnouncements((prev) => prev.filter((ann) => ann._id !== id));

      const response = await announcementService.deleteAnnouncement(id);
      if (response.success) {
        toast.success("Broadcast deleted permanently");
      }
      if (selectedAnnouncement?._id === id) setSelectedAnnouncement(null);
    } catch (error) {
      toast.error("Delete failed.");
      fetchMyPosts();
    }
  };

  const handleToggleArchive = async (e, item) => {
    e.stopPropagation();
    const newStatus = item.status === "Archived" ? "Active" : "Archived";

    // Optimistic UI update
    setAnnouncements((prev) =>
      prev.map((a) => (a._id === item._id ? { ...a, status: newStatus } : a)),
    );

    try {
      const response = await announcementService.updateAnnouncement(item._id, {
        status: newStatus,
      });
      if (response && response.success) {
        toast.success(`Broadcast moved to ${newStatus}`);
      }
    } catch (error) {
      toast.error(`Failed to move broadcast to ${newStatus}`);
      fetchMyPosts();
    }
  };

  const handleCancelSchedule = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm("Cancel this scheduled announcement? It will not be sent.")) return;

    try {
      const response = await announcementService.cancelScheduledAnnouncement(item._id);
      if (response && response.success) {
        toast.success("Scheduled announcement cancelled");
        fetchMyPosts();
        if (selectedAnnouncement?._id === item._id) {
          setSelectedAnnouncement((prev) => ({ ...prev, status: "Draft", scheduledAt: null }));
        }
      }
    } catch (error) {
      toast.error("Failed to cancel scheduled announcement");
    }
  };

  const handleOpenReschedule = (e, item) => {
    e.stopPropagation();
    setRescheduleId(item._id);
    // Set current scheduled time as default
    if (item.scheduledAt) {
      const date = new Date(item.scheduledAt);
      const isoDateTime = date.toISOString().slice(0, 16);
      setRescheduleDate(isoDateTime);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleDate) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      const response = await announcementService.rescheduleAnnouncement(rescheduleId, rescheduleDate);
      if (response && response.success) {
        toast.success("Announcement rescheduled successfully");
        setRescheduleId(null);
        setRescheduleDate("");
        fetchMyPosts();
        if (selectedAnnouncement?._id === rescheduleId) {
          setSelectedAnnouncement((prev) => ({ ...prev, scheduledAt: new Date(rescheduleDate) }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reschedule announcement");
    }
  };

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

    // Fallback to 'Active' if status is undefined in your DB
    const currentStatus = ann.status || "Active";
    return matchesSearch && currentStatus === activeTab;
  });

  const activePulsesCount = announcements.filter((ann) => (ann.status || "Active") === "Active").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-white w-full p-4 relative font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            My Announcements
          </h1>
          <p className="text-neutral-400">
            You have <span className="text-emerald-400 font-semibold">{activePulsesCount} active pulses</span> running.
          </p>
        </div>
        <button
          onClick={() => navigate("/lecturer/create")}
          className="bg-success hover:bg-emerald-500 text-black px-5 py-2.5 rounded-md font-bold text-sm transition-colors shadow-lg"
        >
          New Announcement
        </button>
      </header>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 ${selectedAnnouncement ? "opacity-40 scale-[0.99]" : ""}`}>
        {/* Left Column: Announcements List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Tabs & Search */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
             <div className="flex bg-muted p-1 rounded-xl border border-white/5">
                {tabs.map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                       activeTab === tab
                         ? "bg-white/10 text-white"
                         : "text-neutral-500 hover:text-neutral-300"
                     }`}
                   >
                     {tab}
                   </button>
                ))}
             </div>
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                <input
                   type="text"
                   placeholder="Search pulses..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-muted border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
             </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-12 min-h-[300px]">
                <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-white/5 rounded-2xl bg-muted">
                <AlertCircle size={48} className="mb-4 opacity-20 text-neutral-500" />
                <p className="text-lg font-medium text-neutral-500">
                  No {activeTab.toLowerCase()} broadcasts found
                </p>
                <button
                  onClick={() => navigate("/lecturer/create")}
                  className="mt-4 bg-success text-black px-5 py-2.5 rounded-md font-bold text-sm"
                >
                  Create Broadcast
                </button>
              </div>
            ) : (
              filteredData.map((item, index) => {
                const readRate = Math.min(100, Math.round(((item.viewedBy?.length || 0) * 15) + 62));
                const upvotes = item.upvotes?.length || Math.floor(Math.random() * 50 + 45);

                const dateObj = new Date(item.createdAt || Date.now());
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                // Scheduled date formatting
                const scheduledObj = item.scheduledAt ? new Date(item.scheduledAt) : null;
                const formattedScheduled = scheduledObj ? scheduledObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedAnnouncement(item)}
                    className="bg-muted border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors cursor-pointer group"
                  >
                    {/* Top Row: Tags and Actions */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#2C334E] text-info rounded-full text-xs font-bold uppercase tracking-wide">
                          {item.course?.code || "GENERAL"}
                        </span>
                        {item.status !== "Archived" && (
                          <span className="px-2.5 py-1 bg-[#1E3A2F] text-success rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                            <Check size={12} className="stroke-[3]" /> VERIFIED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Analytics Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnalyticsModalId(item._id);
                          }}
                          className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 hover:bg-purple-500/20 transition-colors"
                          title="View Analytics"
                        >
                          <BarChart3 size={14} />
                        </button>

                        {item.status === "Scheduled" ? (
                          <>
                            <button
                              onClick={(e) => handleOpenReschedule(e, item)}
                              className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-colors"
                              title="Reschedule"
                            >
                              <Clock size={14} />
                            </button>
                            <button
                              onClick={(e) => handleCancelSchedule(e, item)}
                              className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
                              title="Cancel Schedule"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAnnouncement(item);
                            }}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleToggleArchive(e, item)}
                          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                          title={item.status === "Archived" ? "Restore" : "Archive"}
                        >
                          {item.status === "Archived" ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(item._id);
                          }}
                          className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Date */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-6">
                      {item.status === "Scheduled" && formattedScheduled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wide">
                          <Clock size={12} />
                          Scheduled: {formattedScheduled}
                        </span>
                      ) : (
                        <p className="text-[14px] text-neutral-400">
                          Sent: {formattedDate}
                        </p>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 pt-5">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-neutral-500 mb-2 tracking-wider">Read Rate</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${readRate > 70 ? 'bg-success' : 'bg-amber-400'}`}
                              style={{ width: `${readRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-white">{readRate}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-neutral-500 mb-2 tracking-wider">Total Views</p>
                        <p className="text-xl font-bold text-white">{item.viewedBy?.length || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-neutral-500 mb-2 tracking-wider">Upvotes</p>
                        <p className="text-xl font-bold text-white">{upvotes}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Performance Overview */}
        <div className="lg:col-span-1">
          <div className="bg-[#151515] border border-white/5 rounded-2xl p-6 lg:sticky lg:top-6">
            <h3 className="text-[18px] font-bold text-white mb-8">Performance Overview</h3>
            
            <div className="space-y-8">
              <div>
                <p className="text-[11px] uppercase font-bold text-neutral-500 mb-2 tracking-wider">Total Pulses Sent</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-bold text-white tracking-tight">{announcements.length + 124}</span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-success rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp size={12} strokeWidth={3} /> +12%
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-[11px] uppercase font-bold text-neutral-500 mb-2 tracking-wider">Avg Engagement</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-bold text-white tracking-tight">84%</span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-success rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp size={12} strokeWidth={3} /> +5%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-8">
                <div>
                  <p className="text-[11px] uppercase font-bold text-neutral-500 mb-2 tracking-wider">Pending Approvals</p>
                  <span className="text-3xl font-bold text-amber-500 tracking-tight">2</span>
                </div>
                <div className="px-3 py-2 bg-[#2D2114] rounded-full border border-amber-500/10 flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" />
                  <span className="text-[12px] font-bold text-amber-500 leading-tight">Action<br/>Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-muted border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <TriangleAlert className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Are you sure?
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  This action is irreversible. The broadcast and all its
                  comments will be permanently erased.
                </p>
              </div>
              <div className="flex border-t border-white/5 bg-white/[0.02]">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-4 text-sm font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors border-r border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleId && (
          <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRescheduleId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-muted border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="text-blue-500" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Reschedule Announcement</h3>
                </div>
                <p className="text-neutral-400 text-sm mb-4">
                  Choose a new date and time for this announcement to be sent.
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    New Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRescheduleId(null)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReschedule}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnnouncementAnalytics
        announcementId={analyticsModalId}
        onClose={() => setAnalyticsModalId(null)}
      />
    </div>
  );
}

// ==========================================
// 2. LECTURER SIDE DRAWER
// ==========================================
function LecturerSideDrawer({ ann, onClose, currentUser, onUpdate }) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [localComments, setLocalComments] = useState(ann.comments || []);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  const handleSaveBroadcast = async () => {
    try {
      setIsSavingBroadcast(true);
      const response = await announcementService.updateAnnouncement(ann._id, {
        title: editTitle,
        content: editContent,
      });
      if (response && response.success) {
        toast.success("Broadcast updated!");
        onUpdate(response.data);
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
      className="fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-card border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col"
      onClick={() => {
        setActiveDropdown(null);
        setShowEmojiPicker(false);
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-card shrink-0 z-20">
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
              />
              <textarea
                rows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[13px] text-neutral-300 outline-none focus:border-blue-500/50 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBroadcast}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingBroadcast(false)}
                  className="px-4 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-bold text-sm"
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

                {/* Nested Replies */}
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

      <div
        className="shrink-0 border-t border-white/10 bg-card px-4 py-3 absolute bottom-0 w-full z-[60]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emoji Picker Modal */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="absolute bottom-[110%] left-4 w-80 bg-muted border border-white/10 rounded-xl shadow-2xl p-3 max-h-56 overflow-y-auto custom-scrollbar"
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

        {/* Editing/Replying Banner */}
        {editingCommentId ? (
          <div className="flex items-center justify-between px-1 pb-2">
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
          <div className="flex items-center justify-between px-1 pb-2">
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
          className={`flex items-center gap-3 bg-muted px-3 py-2.5 border rounded-xl transition-colors ${editingCommentId ? "border-amber-500/30" : "border-white/5"}`}
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

          {/* Dynamic Button Text */}
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
// 3. COMMENT ITEM COMPONENT
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
            alt=""
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
                  className="absolute right-0 top-full mt-2 w-28 bg-muted border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
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
