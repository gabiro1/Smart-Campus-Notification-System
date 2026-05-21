import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Send,
  AlertTriangle,
  Radio,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Sparkles,
  Wand2,
  Check,
  X,
  RefreshCw,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import governanceService from "../../../../services/governanceService";
import adminService from "../../../../services/adminService";
import copilotService from "../../../../services/copilotService";

export default function GlobalBroadcast() {
  const [briefSubject, setBriefSubject] = useState("");
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTone, setAiTone] = useState("professional");
  const [showAiSection, setShowAiSection] = useState(true);
  const [generationStep, setGenerationStep] = useState("subject"); // "subject" | "content"

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

  const handleGenerate = async () => {
    if (!briefSubject.trim()) {
      toast.error("Please enter a brief subject or topic first");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationStep("subject");
      
      // Step 1: Polish the subject line
      const subjectResult = await copilotService.paraphrase(briefSubject, aiTone);
      if (!subjectResult.success) {
        throw new Error(subjectResult.message || "Failed to generate subject");
      }
      
      const polishedSubject = subjectResult.paraphrased;
      setTitle(polishedSubject);
      setGenerationStep("content");
      
      // Step 2: Generate full message content based on the subject
      const toneMap = {
        professional: "formal, professional academic tone",
        friendly: "warm and approachable but professional tone",
        urgent: "clear, concise, and action-oriented tone",
        formal: "very formal and official tone",
      };

      const contentPrompt = `You are an academic communications officer. Based on the following subject, generate a complete broadcast message for a university.

Subject: "${polishedSubject}"

Generate a professional broadcast message that:
- Expands on the subject with clear, relevant details
- Uses ${toneMap[aiTone] || "professional tone"}
- Includes appropriate structure (greeting, body, closing)
- Is clear, concise, and ready to send
- Includes any relevant dates, deadlines, or action items if implied by the subject

Output ONLY the message body - no subject line, no formatting, just the polished message text.`;

      const contentResult = await copilotService.paraphrase(contentPrompt, aiTone);
      
      if (contentResult.success) {
        setContent(contentResult.paraphrased);
        toast.success("Message generated successfully!");
      } else {
        // Subject was generated but content failed
        toast.warning("Subject generated, but content generation failed. Please try again.");
      }
    } catch (error) {
      console.error("Generate error:", error);
      toast.error(error.message || "Failed to generate message");
    } finally {
      setIsGenerating(false);
      setGenerationStep("subject");
    }
  };

  const handlePolishSubject = async () => {
    if (!briefSubject.trim()) {
      toast.error("Please enter a subject first");
      return;
    }
    try {
      setIsGenerating(true);
      const result = await copilotService.paraphrase(briefSubject, aiTone);
      if (result.success) {
        setTitle(result.paraphrased);
        toast.success("Subject line polished!");
      } else {
        toast.error(result.message || "Failed to polish subject");
      }
    } catch (error) {
      toast.error(error.message || "Failed to polish subject");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateContent = async () => {
    if (!title.trim()) {
      toast.error("Please generate or enter a subject line first");
      return;
    }
    try {
      setIsGenerating(true);
      
      const toneMap = {
        professional: "formal, professional academic tone",
        friendly: "warm and approachable but professional tone",
        urgent: "clear, concise, and action-oriented tone",
        formal: "very formal and official tone",
      };

      const contentPrompt = `Based on the subject: "${title}"

Generate a complete broadcast message that:
- Expands on the subject with clear, relevant details
- Uses ${toneMap[aiTone] || "professional tone"}
- Has proper structure (greeting, body, closing)
- Is clear, concise, and ready to send
- Includes relevant dates/deadlines if applicable

Output ONLY the message body text.`;

      const result = await copilotService.paraphrase(contentPrompt, aiTone);
      if (result.success) {
        setContent(result.paraphrased);
        toast.success("Content regenerated!");
      } else {
        toast.error(result.message || "Failed to regenerate content");
      }
    } catch (error) {
      toast.error(error.message || "Failed to regenerate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearAll = () => {
    setBriefSubject("");
    setTitle("");
    setContent("");
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please generate both subject and content before submitting");
      return;
    }
    setIsModalOpen(true);
  };

  const confirmBroadcast = async () => {
    try {
      setIsSending(true);
      
      const targetAudience = [];
      if (targetRole === "all" || targetRole === "students") targetAudience.push("students");
      if (targetRole === "all" || targetRole === "staff") targetAudience.push("staff");
      
      // Map frontend values to backend enum values
      const priorityMap = {
        normal: "medium",
        high: "high",
        urgent: "high",
      };
      
      const scopeMap = {
        all: "college",
        school: "school",
        department: "department",
      };

      const data = {
        title,
        content,
        priority: priorityMap[priority] || "medium",
        targetScope: scopeMap[targetScope] || "college",
        targetAudience,
        ...(targetScope === "school" && targetSchool && { schoolId: targetSchool }),
        ...(targetScope === "department" && targetDepartment && { departmentId: targetDepartment }),
        sendEmail: true,
      };

      await governanceService.create(data);
      toast.success("Broadcast submitted for approval");
      setIsModalOpen(false);
      handleClearAll();
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

  const toneOptions = [
    { value: "professional", label: "Professional", desc: "Formal academic tone" },
    { value: "friendly", label: "Friendly", desc: "Warm and approachable" },
    { value: "urgent", label: "Urgent", desc: "Action-oriented" },
    { value: "formal", label: "Formal", desc: "Very official" },
  ];

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
        <div className="flex items-center gap-3">
          {isEmergency && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-xl">
              <ShieldAlert size={18} />
              <span className="font-medium">Emergency Mode</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Form Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Generator Section */}
          <GlassCard className="bg-gradient-to-br from-purple-500/5 to-blue-500/5">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  AI Message Generator
                </h2>
                <p className="text-xs text-muted-foreground">
                  Enter a brief topic, and AI will generate the subject line and full message.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {/* Tone Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-medium">Tone:</span>
                <div className="flex gap-2">
                  {toneOptions.map(tone => (
                    <button
                      key={tone.value}
                      onClick={() => setAiTone(tone.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        aiTone === tone.value
                          ? "bg-purple-600 text-white"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brief Subject Input */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Brief Topic or Subject Idea
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={briefSubject}
                    onChange={(e) => setBriefSubject(e.target.value)}
                    placeholder="e.g., Exam rescheduled to next week"
                    className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !briefSubject.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span className="hidden sm:inline">
                          {generationStep === "subject" ? "Polishing..." : "Generating..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} />
                        <span className="hidden sm:inline">Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              {(title || content) && (
                <div className="flex gap-2">
                  <button
                    onClick={handleRegenerateContent}
                    disabled={isGenerating || !title.trim()}
                    className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Regenerate Content
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X size={12} /> Clear All
                  </button>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Generated Output Form */}
          <GlassCard className={title || content ? "border-purple-500/30" : ""}>
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className={`p-2 rounded-lg ${title || content ? 'bg-emerald-500/10 text-emerald-400' : 'bg-card text-muted-foreground'}`}>
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Generated Message
                </h2>
                <p className="text-xs text-muted-foreground">
                  Review and edit the AI-generated content below.
                </p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-5 mt-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Subject Line
                  </label>
                  {title && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> AI Generated
                    </span>
                  )}
                </div>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="AI will generate this..."
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Message Content
                  </label>
                  {content && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> AI Generated
                    </span>
                  )}
                </div>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="AI will generate this..."
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
                  disabled={!title.trim() || !content.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  Submit for Approval
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Guidelines Sidebar */}
        <div className="lg:col-span-4 space-y-6">
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
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{content}</p>
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
