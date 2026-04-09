import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Send, ChevronDown, Loader2, Clock, MapPin, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import announcementService from "../../../../services/announcementService";

const TEMPLATES = [
  { id: 1, label: "Running 15 mins late", text: "I will be arriving 15 minutes late to class. Please wait inside the room.", icon: Clock },
  { id: 2, label: "Room Changed", text: "URGENT: Our class location has been changed. Please check the updated room assignment immediately.", icon: MapPin },
  { id: 3, label: "Class Cancelled", text: "Today's class is cancelled due to an unforeseen emergency. Further details will follow soon.", icon: XCircle }
];

export default function UrgentAlertModal({ isOpen, onClose }) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Database States
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Fetch Courses when Modal Opens
  useEffect(() => {
    if (isOpen) {
      const fetchCourses = async () => {
        try {
          setIsLoadingCourses(true);
          const data = await announcementService.getMyCourses();
          setCourses(data);
        } catch (error) {
          toast.error("Failed to load your assigned courses.");
        } finally {
          setIsLoadingCourses(false);
        }
      };
      fetchCourses();
    } else {
      // Reset state when closing
      setSelectedCourse("");
      setMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTemplateClick = (text) => {
    setMessage(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !message.trim()) return;
    
    setIsSubmitting(true);
    
    // Construct Form Data since createAnnouncement uses multipart/form-data
    const formData = new FormData();
    formData.append("title", "🚨 URGENT NOTIFICATION");
    formData.append("content", message);
    formData.append("courseId", selectedCourse);
    formData.append("type", "Urgent");

    try {
      await announcementService.createAnnouncement(formData);
      toast.success("Emergency Alert dispatched successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to dispatch alert.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-background border border-red-500/30 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 text-red-500 rounded-xl relative flex-shrink-0">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <AlertTriangle size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight">Urgent Dispatch</h2>
          </div>
          <button 
            disabled={isSubmitting}
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Target Class Selection */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex justify-between">
              <span>Target class / Course <span className="text-red-500">*</span></span>
              {isLoadingCourses && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
            </label>
            <div className="relative">
              <select
                required
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={isLoadingCourses || isSubmitting}
                className="w-full appearance-none bg-muted border border-white/10 hover:border-white/20 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 rounded-xl px-4 py-3.5 text-foreground text-sm font-medium transition-all outline-none disabled:opacity-50"
              >
                <option value="" disabled>
                  {isLoadingCourses ? "Loading courses..." : "Select course to notify..."}
                </option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Quick Templates
            </label>
            <div className="flex flex-col gap-2">
              {TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateClick(tpl.text)}
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-[#2A2A2A] hover:border-red-500/50 hover:bg-red-500/5 text-sm font-semibold text-neutral-300 hover:text-foreground transition-all active:scale-[0.98] disabled:opacity-50 group"
                >
                  <tpl.icon size={16} className="text-muted-foreground group-hover:text-red-400 transition-colors" />
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div>
             <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Dispatch Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              placeholder="Type urgent notice here..."
              className="w-full bg-muted border border-white/10 hover:border-white/20 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 rounded-xl px-4 py-3 text-foreground text-sm font-medium transition-all outline-none resize-none custom-scrollbar disabled:opacity-50"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3.5 rounded-xl bg-input border border-border hover:bg-muted text-sm font-bold text-muted-foreground hover:text-foreground transition-all w-1/3 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCourse || !message.trim()}
              className="flex-1 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-foreground text-sm font-black tracking-wide shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Broadcasting...
                </>
              ) : (
                <>
                  PUSH ALERT NOW 
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
