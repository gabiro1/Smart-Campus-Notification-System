import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Send,
  Type,
  AlignLeft,
  Users,
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
} from "lucide-react";

import announcementService from "../../../../services/announcementService";

const LecturerCreateAnnouncement = () => {
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetClass: "",
    type: "General",
  });

  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [myClasses, setMyClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH LECTURER'S CLASSES ---
  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const data = await announcementService.getMyClasses();

        // REFINED LOGIC: Handle if the API returns an array directly OR wrapped in an object
        // Many controllers return { success: true, classes: [...] }
        const finalData = Array.isArray(data) ? data : data.classes || [];
        setMyClasses(finalData);

        if (finalData.length === 0) {
          console.warn("No classes found for this lecturer.");
        }
      } catch (error) {
        console.error("Mounting Error:", error);
        toast.error("Failed to load your assigned classes.");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchMyClasses();
  }, []);

  // --- HANDLE INPUT CHANGES ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.title || !formData.content || !formData.targetClass) {
      return toast.error("Please fill in all required fields.");
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      submitData.append("targetClass", formData.targetClass);
      submitData.append("type", formData.type);

      attachments.forEach((file) => {
        submitData.append("attachments", file);
      });

      await announcementService.createAnnouncement(submitData);

      toast.success("Announcement broadcasted successfully!");

      // Reset form
      setFormData({ title: "", content: "", targetClass: "", type: "General" });
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

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 font-sans">
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

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Broadcast Announcement
        </h1>
        <p className="text-neutral-400 mt-2 text-sm max-w-2xl">
          Send targeted notifications and course materials to your classes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                  <Users size={16} className="text-neutral-500" /> Target Class
                </label>
                <select
                  name="targetClass"
                  value={formData.targetClass}
                  onChange={handleChange}
                  disabled={loadingClasses}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none disabled:opacity-50"
                  required
                >
                  <option value="" disabled>
                    {loadingClasses
                      ? "Loading classes..."
                      : "Select a class..."}
                  </option>
                  {myClasses.map((cls) => (
                    <option key={cls.id || cls._id} value={cls.id || cls._id}>
                      {cls.name} {cls.level ? `- ${cls.level}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-neutral-500" /> Announcement
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="General">General Update</option>
                  <option value="Urgent">Urgent Alert</option>
                  <option value="Assignment">Assignment / Task</option>
                  <option value="Event">Upcoming Event</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Type size={16} className="text-neutral-500" /> Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Chapter 4 Lecture Notes"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <AlignLeft size={16} className="text-neutral-500" /> Message
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write the details here..."
                rows="5"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600 resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                <Paperclip size={16} className="text-neutral-500" /> Attach
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
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-neutral-300 transition-colors flex items-center gap-2"
                >
                  <Paperclip size={16} /> Choose Files
                </button>
                <span className="text-xs text-neutral-500">
                  Supported: PDF, DOCX, PPTX, JPG (Max 5MB)
                </span>
              </div>

              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[#0A0A0A] border border-white/10 p-3 rounded-xl group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !formData.targetClass}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                {isSubmitting ? "Broadcasting..." : "Broadcast to Class"}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-8">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Eye size={16} /> Student Feed Preview
            </h3>

            <div
              className={`bg-[#1A1A1A] border ${previewStyles.border} rounded-2xl p-5 relative overflow-hidden transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${previewStyles.bg} ${previewStyles.color}`}
                >
                  {previewStyles.icon}
                  {formData.type}
                </div>
                <span className="text-xs text-neutral-500">Just now</span>
              </div>

              <h4 className="text-lg font-bold text-white mb-2 break-words">
                {formData.title || "Announcement Title"}
              </h4>
              <p className="text-sm text-neutral-400 line-clamp-4 break-words leading-relaxed mb-4">
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

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-[#1A1A1A]"></div>
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
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
