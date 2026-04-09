import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Send,
  AlertTriangle,
  Radio,
  Globe,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import governanceService from "../../../../services/governanceService";
import adminService from "../../../../services/adminService";

export default function GlobalBroadcast() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [targetScope, setTargetScope] = useState("all");
  const [targetSchool, setTargetSchool] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isEmergency = priority === "urgent";

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      const [schoolsData, deptsData] = await Promise.all([
        adminService.getSchools().catch(() => []),
        adminService.getDepartments().catch(() => []),
      ]);
      setSchools(schoolsData.data || schoolsData || []);
      setDepartments(deptsData.data || deptsData || []);
    } catch (error) {
      console.error("Failed to fetch hierarchy:", error);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const confirmBroadcast = async () => {
    try {
      setIsSending(true);
      
      const targetAudience = [];
      if (targetRole === "all" || targetRole === "students") targetAudience.push("students");
      if (targetRole === "all" || targetRole === "staff") targetAudience.push("staff");
      
      const data = {
        title,
        content,
        priority,
        targetAudience,
        scope: targetScope,
        ...(targetSchool && { school: targetSchool }),
        ...(targetDepartment && { department: targetDepartment }),
        sendEmail: true,
        status: "pending",
      };

      await governanceService.create(data);
      toast.success("Broadcast submitted for approval");
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setPriority("normal");
      setTargetScope("all");
      setTargetSchool("");
      setTargetDepartment("");
      setTargetRole("all");
    } catch (error) {
      console.error("Failed to create broadcast:", error);
      toast.error(error.response?.data?.message || "Failed to submit broadcast");
    } finally {
      setIsSending(false);
    }
  };

  const filteredDepartments = departments.filter(
    d => !targetSchool || d.school?._id === targetSchool || d.school === targetSchool
  );

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            College Broadcast
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deliver announcements to the entire College, specific Schools, or Departments.
          </p>
        </div>
        {isEmergency && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-xl">
            <ShieldAlert size={18} />
            <span className="font-medium">Emergency Mode</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Form Area */}
        <GlassCard className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className={`p-2 rounded-lg ${isEmergency ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Compose Broadcast
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
                  Target Scope
                </label>
                <select
                  value={targetScope}
                  onChange={(e) => {
                    setTargetScope(e.target.value);
                    if (e.target.value === 'all') {
                      setTargetSchool("");
                      setTargetDepartment("");
                    }
                  }}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                >
                  <option value="all">Entire College</option>
                  <option value="school">Specific School</option>
                  <option value="department">Specific Department</option>
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
                  <option value="urgent">Urgent/Emergency</option>
                </select>
              </div>
            </div>

            {targetScope === 'school' && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Select School
                </label>
                <select
                  value={targetSchool}
                  onChange={(e) => {
                    setTargetSchool(e.target.value);
                    setTargetDepartment("");
                  }}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Select a School</option>
                  {schools.map(school => (
                    <option key={school._id} value={school._id}>{school.name}</option>
                  ))}
                </select>
              </div>
            )}

            {targetScope === 'department' && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Select Department
                </label>
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Select a Department</option>
                  {filteredDepartments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Target Audience
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="staff">Staff Only</option>
              </select>
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
                  <input type="checkbox" className="w-4 h-4 rounded border-border" defaultChecked />
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

        {/* Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Broadcast Guidelines
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 mt-1" />
                <p className="text-sm text-muted-foreground">
                  All broadcasts require approval before distribution.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-blue-500 mt-1" />
                <p className="text-sm text-muted-foreground">
                  Emergency broadcasts bypass approval and are sent immediately.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Radio size={16} className="text-purple-500 mt-1" />
                <p className="text-sm text-muted-foreground">
                  Target specific schools or departments for focused communication.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Recent Broadcasts
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No recent broadcasts
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
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isEmergency ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                  <Send size={32} className={isEmergency ? 'text-red-500' : 'text-blue-500'} />
                </div>
                <h3 className="text-xl font-bold text-foreground">Confirm Broadcast</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {isEmergency ? 'This emergency broadcast will be sent immediately.' : 'Are you sure you want to submit this broadcast?'}
                </p>
              </div>
              
              <div className="bg-accent rounded-xl p-4 mb-6">
                <p className="font-medium text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{content}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Target: {targetScope === 'all' ? 'Entire College' : targetScope === 'school' ? 'Specific School' : 'Specific Department'} • {targetRole === 'all' ? 'All Users' : targetRole}
                </div>
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
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 ${isEmergency ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
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