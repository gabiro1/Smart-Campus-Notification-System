import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Send,
  UploadCloud,
  Clock,
  Globe,
  AlertCircle,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import governanceService from "../../../../services/governanceService";
import adminService from "../../../../services/adminService";

export default function SchoolBroadcast() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetDept, setTargetDept] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await adminService.getDepartments();
      setDepartments(data.data || data || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const confirmBroadcast = async () => {
    try {
      setIsSending(true);
      await governanceService.create({
        title,
        content,
        department: targetDept || undefined,
        priority,
        targetAudience: ["all"],
        sendEmail: true,
        status: "pending",
      });
      toast.success("Announcement submitted for approval");
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setTargetDept("");
      setPriority("normal");
    } catch (error) {
      console.error("Failed to create announcement:", error);
      toast.error(error.response?.data?.message || "Failed to submit announcement");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          School Broadcast
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create and distribute announcements to departments.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Form Area */}
        <GlassCard className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Compose Announcement
              </h2>
              <p className="text-xs text-muted-foreground">
                Submit for approval before distribution.
              </p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Subject Line
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Campus Closure Notice"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Target Department
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Message Content
              </label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement here..."
                rows={8}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  <span className="text-sm text-muted-foreground">Send via Email</span>
                </label>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
              >
                <Send size={18} />
                Submit for Approval
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Quick Stats */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Broadcast Guidelines
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-500 mt-1" />
                <p className="text-sm text-muted-foreground">
                  All announcements require approval before distribution.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-blue-500 mt-1" />
                <p className="text-sm text-muted-foreground">
                  Review typically takes 24-48 hours during business days.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Globe size={16} className="text-purple-500 mt-1" />
                <p className="text-sm text-muted-foreground">
                  Select a department to target specific audiences.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Recent Submissions
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No recent submissions
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !isSending && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card rounded-2xl border border-border p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Confirm Broadcast</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to submit this announcement?
                </p>
              </div>
              
              <div className="bg-accent rounded-xl p-4 mb-6">
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{content}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSending}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBroadcast}
                  disabled={isSending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}