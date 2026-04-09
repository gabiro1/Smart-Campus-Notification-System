import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Type,
  AlignLeft,
  Book,
  Tag,
  Loader2,
  BellRing,
  AlertTriangle,
  BookOpen,
  Calendar,
  Eye,
  Paperclip,
  X,
  FileText,
  ArrowLeft,
} from "lucide-react";

import announcementService from "../../../../services/announcementService";

const LecturerCreateAnnouncement = () => {
  const navigate = useNavigate();

  // --- FORM STATE ---
  // CHANGED: targetClass is now courseId
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    courseId: "",
    type: "General",
    scheduledAt: "", // Empty = send immediately
  });

  // AI Suggestion State
  const [draftNotes, setDraftNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Scheduling UI state
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  // Emergency acknowledgment toggle
  const [requiresAcknowledgment, setRequiresAcknowledgment] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // CHANGED: myClasses is now myCourses
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH LECTURER'S COURSES ---
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const data = await announcementService.getMyCourses();
        const finalData = Array.isArray(data) ? data : data.courses || [];
        setMyCourses(finalData);

        if (finalData.length === 0) {
          console.warn("No courses found for this lecturer.");
        }
      } catch (error) {
        console.error("Mounting Error:", error);
        toast.error("Failed to load your assigned courses.");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchMyCourses();
  }, []);

  // --- HANDLE INPUT CHANGES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // AI Suggestion Handler
  const handleAISuggest = async () => {
    if (!draftNotes.trim()) {
      return toast.error("Please enter some draft notes first.");
    }

    setAiLoading(true);
    try {
      const result = await announcementService.suggestAnnouncement(draftNotes);
      if (result.success && result.announcement) {
        setFormData((prev) => ({ ...prev, content: result.announcement }));
        toast.success("Announcement polished!");
      } else {
        throw new Error(result.message || "AI failed to generate suggestion");
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to generate suggestion";
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  // --- HANDLE SCHEDULE TOGGLE ---
  const handleScheduleToggle = () => {
    setScheduleEnabled(!scheduleEnabled);
    if (scheduleEnabled) {
      // Turn off scheduling, clear date
      setFormData((prev) => ({ ...prev, scheduledAt: "" }));
    } else {
      // Turn on scheduling - set default to tomorrow at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const isoDateTime = tomorrow.toISOString().slice(0, 16); // format for datetime-local
      setFormData((prev) => ({ ...prev, scheduledAt: isoDateTime }));
    }
  };

  // --- HANDLE FILE SELECTION ---
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  // --- SUBMIT ANNOUNCEMENT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.courseId) {
      return toast.error("Please fill in all required fields.");
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      submitData.append("courseId", formData.courseId); // SENDING THE COURSE ID
      submitData.append("type", formData.type);
      submitData.append("scheduledAt", formData.scheduledAt || "");
      submitData.append("requiresAcknowledgment", requiresAcknowledgment.toString());

      attachments.forEach((file) => {
        submitData.append("attachments", file);
      });

      await announcementService.createAnnouncement(submitData);

      toast.success("Announcement broadcasted successfully!");

      // Reset form
      setFormData({ title: "", content: "", courseId: "", type: "General", scheduledAt: "" });
      setScheduleEnabled(false);
      setRequiresAcknowledgment(false);
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send announcement.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case "Urgent":
        return {
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: <AlertTriangle size={16} />,
        };
      case "Assignment":
        return {
          color: "text-purple-400",
          bg: "bg-purple-500/10",
          border: "border-purple-500/30",
          icon: <BookOpen size={16} />,
        };
      case "Event":
        return {
          color: "text-green-400",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          icon: <Calendar size={16} />,
        };
      default:
        return {
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          icon: <BellRing size={16} />,
        };
    }
  };

  const previewStyles = getTypeStyles(formData.type);

  // Helper to find the selected course name for the preview
  const selectedCourse = myCourses.find((c) => c._id === formData.courseId);

  return (
    <div className="w-full min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#141414",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      <div className="mb-10 pb-6 border-b border-border flex items-start gap-6">
        <button
          onClick={() => navigate('/lecturer/announcements')}
          className="mt-1 p-3 bg-input shadow-md hover:bg-muted border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all group"
          title="Go back to announcements"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-2">
            Broadcast Announcement
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl text-sm">
            Compose and securely dispatch targeted academic notifications and course materials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* FORM SECTION */}
        <div className="lg:col-span-3 bg-background border border-border rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                  <Book size={16} className="text-muted-foreground" /> Target Course
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  disabled={loadingCourses}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none disabled:opacity-50"
                  required
                >
                  <option value="" disabled>
                    {loadingCourses
                      ? "Loading courses..."
                      : "Select a course..."}
                  </option>
                  {myCourses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.code}: {course.name} (
                      {course.class?.name || "No Class"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-muted-foreground" /> Announcement
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="General">General Update</option>
                  <option value="Urgent">Urgent Alert</option>
                  <option value="Assignment">Assignment / Task</option>
                  <option value="Event">Upcoming Event</option>
                </select>
              </div>
            </div>

            {/* EMERGENCY ACKNOWLEDGMENT TOGGLE */}
            <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setRequiresAcknowledgment(!requiresAcknowledgment)}
                  className={`relative w-12 h-6 rounded-full transition-colors mt-0.5 ${
                    requiresAcknowledgment ? 'bg-red-600' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      requiresAcknowledgment ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex-1">
                  <label className="text-sm font-bold text-red-400 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Emergency Alert (Requires Acknowledgment)
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Students must explicitly acknowledge this alert before it can be dismissed.
                    Use only for critical campus-wide emergencies.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Type size={16} className="text-muted-foreground" /> Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Chapter 4 Lecture Notes"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                required
              />
            </div>

            {/* AI SUGGESTION SECTION */}
            <div className="bg-gradient-to-br from-blue-900/10 to-purple-900/10 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <span className="text-lg">✨</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">AI Assistant</h4>
                    <p className="text-xs text-muted-foreground">Transform rough notes into professional announcements</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Draft Notes
                  </label>
                  <textarea
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    placeholder="Jot down your raw ideas, key points, or informal notes here... (e.g., 'hey students, quiz 2 is next week, study chapter 5, bring calculator')"
                    rows="3"
                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAISuggest}
                    disabled={aiLoading || !draftNotes.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-white/10 disabled:to-white/10 disabled:text-foreground/50 text-foreground text-sm font-bold rounded-lg transition-all shadow-lg disabled:shadow-none"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Polishing...
                      </>
                    ) : (
                      <>
                        <span>✨</span> Make it Professional
                      </>
                    )}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    AI will rewrite your notes into a polished academic announcement.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <AlignLeft size={16} className="text-muted-foreground" /> Announcement Message
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write the details here... (You can use the AI assistant above to help draft this)"
                rows="5"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600 resize-none"
                required
              ></textarea>
              <p className="text-xs text-muted-foreground mt-1.5">
                Use the AI assistant above to transform rough notes, then edit as needed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Paperclip size={16} className="text-muted-foreground" /> Attach
                Documents (Optional)
              </label>

              <div className="flex items-center gap-4 mb-3">
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2.5 bg-input hover:bg-muted border border-border rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
                >
                  <Paperclip size={16} className="group-hover:-rotate-12 transition-transform" /> Choose Files
                </button>
                <span className="text-xs text-muted-foreground">
                  Supported: PDF, DOCX, PPTX, JPG (Max 5MB)
                </span>
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-background border border-white/10 p-3 rounded-xl group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SCHEDULE SECTION */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-start gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleScheduleToggle}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    scheduleEnabled ? 'bg-blue-600' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      scheduleEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex-1">
                  <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <Calendar size={16} /> Send Later
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Schedule this announcement to be sent at a specific date and time.
                  </p>
                </div>
              </div>

              {scheduleEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6"
                >
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  />
                  <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    The announcement will be queued and automatically dispatched at the scheduled time.
                  </p>
                </motion.div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !formData.courseId}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-foreground rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                {isSubmitting ? "Broadcasting..." : "Broadcast Update"}
              </button>
            </div>
          </form>
        </div>

        {/* PREVIEW SECTION */}
        <div className="lg:col-span-2">
          <div className="sticky top-8">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Eye size={16} /> Student Feed Preview
            </h3>

            <div
              className={`bg-muted border ${previewStyles.border} rounded-2xl p-5 relative overflow-hidden transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${previewStyles.bg} ${previewStyles.color}`}
                >
                  {previewStyles.icon}
                  {formData.type}
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {selectedCourse ? selectedCourse.code : "Course Code"}
                </span>
              </div>

              <h4 className="text-lg font-bold text-foreground mb-2 break-words">
                {formData.title || "Announcement Title"}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-4 break-words leading-relaxed mb-4">
                {formData.content ||
                  "The announcement details will appear here. Students will see this in their feed."}
              </p>

              {attachments.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20">
                    <Paperclip size={12} /> {attachments.length} Attached
                    Document{attachments.length > 1 ? "s" : ""}
                  </div>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-border"></div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Q&A Thread
                  </span>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-blue-400"
                >
                  Ask Question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerCreateAnnouncement;
