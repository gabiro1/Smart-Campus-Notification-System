import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  Trash2,
  Plus,
  AlertCircle,
  X,
  Check,
  Clock,
  Megaphone,
  Calendar,
  Pin,
  PinOff,
  Send,
  FileText,
  LayoutGrid,
  List,
  Eye,
  Paperclip,
} from "lucide-react";
import toast from "react-hot-toast";
import announcementService from "../../../../services/announcementService";

export default function MyAnnouncements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tabs = [
    { id: "active", label: "Active", count: announcements.filter((a) => (a.status || "Active") === "Active").length },
    { id: "scheduled", label: "Scheduled", count: announcements.filter((a) => a.status === "Scheduled").length },
    { id: "draft", label: "Drafts", count: announcements.filter((a) => a.status === "Draft").length },
    { id: "archived", label: "Archived", count: announcements.filter((a) => a.status === "Archived").length },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (selectedAnnouncement || deleteId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedAnnouncement, deleteId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getLecturerAnnouncements();
      if (response && response.success) {
        setAnnouncements(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements
    .filter((ann) => {
      const status = ann.status || "Active";
      const matchesTab =
        activeTab === "active"
          ? status === "Active"
          : activeTab === "scheduled"
          ? status === "Scheduled"
          : activeTab === "draft"
          ? status === "Draft"
          : status === "Archived";
      return matchesTab;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setAnnouncements((prev) => prev.filter((ann) => ann._id !== deleteId));
      await announcementService.deleteAnnouncement(deleteId);
      toast.success("Announcement deleted");
      if (selectedAnnouncement?._id === deleteId) setSelectedAnnouncement(null);
    } catch (error) {
      toast.error("Delete failed");
      fetchAnnouncements();
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "Archived" ? "Active" : "Archived";
    try {
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === item._id ? { ...a, status: newStatus } : a))
      );
      toast.success(newStatus === "Archived" ? "Archived" : "Restored");
    } catch (error) {
      toast.error("Update failed");
      fetchAnnouncements();
    }
  };

  const handlePublishDraft = async (item) => {
    try {
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === item._id ? { ...a, status: "Active" } : a))
      );
      toast.success("Published successfully!");
    } catch (error) {
      toast.error("Failed to publish");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400";
      case "Scheduled":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20 dark:text-blue-400";
      case "Draft":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20 dark:text-amber-400";
      case "Archived":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Announcements
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your broadcasts and notifications
          </p>
        </div>
        <button
          onClick={() => navigate("/lecturer/create")}
          className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Announcement
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex bg-card border border-border rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-foreground text-background dark:bg-primary dark:text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-background/20 text-background dark:text-primary-foreground" : "bg-accent"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-foreground text-background dark:bg-primary dark:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-foreground text-background dark:bg-primary dark:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 min-h-[300px]">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-border rounded-2xl bg-card text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Megaphone size={24} className="text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No {activeTab} announcements</p>
          <p className="text-sm text-muted-foreground mb-4">
            {activeTab === "active" ? "Create your first announcement" : "No items in this category"}
          </p>
          {activeTab !== "archived" && (
            <button onClick={() => navigate("/lecturer/create")} className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm">
              <Plus size={16} /> Create Announcement
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAnnouncements.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedAnnouncement(item)}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                    {item.status || "Active"}
                  </span>
                  {item.course?.code && (
                    <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">{item.course.code}</span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(item._id); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {item.title || "Untitled Announcement"}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {item.description || "No description"}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(item.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === "Draft" && (
                    <button onClick={(e) => { e.stopPropagation(); handlePublishDraft(item); }} className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium hover:bg-success/20">
                      Publish
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                    {item.status === "Archived" ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 hidden md:table-cell">Targeted To</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3 hidden lg:table-cell">Attachments</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAnnouncements.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status || "Active"}
                        </span>
                        <span className="font-medium text-foreground truncate max-w-[150px] md:max-w-[200px]">{item.title || "Untitled"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {item.targetType === "all" ? "All Students" : 
                         item.targetType === "course" && item.course?.code ? item.course.code :
                         item.targetType === "department" ? item.department?.name || "Department" :
                         item.targetType === "level" ? `Level ${item.level}` : 
                         "Custom"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center hidden lg:table-cell">
                      {item.attachments?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Paperclip size={12} /> {item.attachments.length}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedAnnouncement(item)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/lecturer/edit/${item._id}`)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedAnnouncement(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between p-3 sm:p-4 border-b border-border"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedAnnouncement.status)}`}>
                    {selectedAnnouncement.status || "Active"}
                  </span>
                  {selectedAnnouncement.course?.code && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">{selectedAnnouncement.course.code}</span>
                  )}
                </div>
                <button onClick={() => setSelectedAnnouncement(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent">
                  <X size={16} />
                </button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-3 sm:p-4 space-y-3"
              >
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{selectedAnnouncement.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">{selectedAnnouncement.content || selectedAnnouncement.description || "No description"}</p>
                
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground pt-1 sm:pt-2">
                  <span className="flex items-center gap-1"><Calendar size={11} sm:size={12} /> {formatDate(selectedAnnouncement.createdAt)}</span>
                  <span className="flex items-center gap-1"><FileText size={11} sm:size={12} /> {selectedAnnouncement.viewedBy?.length || 0} views</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 p-2 sm:p-3 border-t border-border bg-muted/30"
              >
                {selectedAnnouncement.status === "Draft" && (
                  <button onClick={() => handlePublishDraft(selectedAnnouncement)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-success hover:bg-success/90 text-success-foreground py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
                    <Send size={12} sm:size={14} /> Publish
                  </button>
                )}
                <button onClick={() => navigate(`/lecturer/edit/${selectedAnnouncement._id}`)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 dark:bg-primary dark:text-primary-foreground py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
                  <Edit3 size={12} sm:size={14} /> Edit
                </button>
                <button onClick={() => handleToggleStatus(selectedAnnouncement)} className="p-1.5 sm:p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent">
                  {selectedAnnouncement.status === "Archived" ? <Pin size={12} sm:size={14} /> : <PinOff size={12} sm:size={14} />}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Delete Announcement?</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg font-medium text-sm border border-border text-muted-foreground hover:text-foreground hover:bg-accent">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-red-600 hover:bg-red-500 text-white">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}