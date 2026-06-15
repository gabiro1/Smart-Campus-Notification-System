import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send, Sparkles, RefreshCw, Loader2, AlertCircle, Check,
  X, FileText, Image, Paperclip, Clock, ChevronDown, Globe,
  School, Users, BookOpen, Brain, ShieldAlert
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import announcementService from "@/services/announcementService";
import toast from "react-hot-toast";

const TONE_OPTIONS = [
  { id: "formal", label: "Formal", desc: "Professional academic tone" },
  { id: "friendly", label: "Friendly", desc: "Warm and approachable" },
  { id: "urgent", label: "Urgent", desc: "Time-sensitive emphasis" },
  { id: "concise", label: "Concise", desc: "Short and direct" },
];

const priorityConfig = {
  critical: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: ShieldAlert, label: "Critical" },
  high: { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: AlertCircle, label: "High" },
  medium: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: AlertCircle, label: "Medium" },
  low: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: AlertCircle, label: "Low" },
};

export default function LecturerCreateAnnouncement() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [paraphrasing, setParaphrasing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedTone, setSelectedTone] = useState("formal");
  const [detectedPriority, setDetectedPriority] = useState(null);
  const [detectingPriority, setDetectingPriority] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await announcementService.getMyCourses();
        const list = Array.isArray(res) ? res : res?.data || res?.courses || [];
        setCourses(list);
      } catch {
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error("Enter some notes or bullet points first");
      return;
    }
    setGenerating(true);
    try {
      const res = await announcementService.suggestAnnouncement(content);
      const generated = res?.data?.content || res?.content || res?.announcement || "";
      if (generated) {
        setContent(generated);
        if (!title.trim() && res?.data?.title) setTitle(res.data.title);
        toast.success("AI announcement generated!");
      } else {
        toast.error("AI generation returned empty result");
      }
    } catch {
      toast.error("AI generation failed. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleParaphrase = async () => {
    if (!content.trim()) {
      toast.error("Enter some content first");
      return;
    }
    setParaphrasing(true);
    try {
      const res = await announcementService.paraphraseContent(content);
      const paraphrased = res?.data?.content || res?.content || res?.paraphrased || "";
      if (paraphrased) {
        setContent(paraphrased);
        toast.success("Content paraphrased!");
      } else {
        toast.error("Paraphrasing returned empty result");
      }
    } catch {
      toast.error("Paraphrasing failed. Try again.");
    } finally {
      setParaphrasing(false);
    }
  };

  const handleImprove = async () => {
    if (!content.trim()) {
      toast.error("Enter some content first");
      return;
    }
    setImproving(true);
    try {
      const res = await announcementService.improveText(content);
      const improved = res?.improved || "";
      if (improved) {
        setContent(improved);
        toast.success("Content improved!");
      } else {
        toast.error("Improvement returned empty result");
      }
    } catch {
      toast.error("AI improvement failed. Try again.");
    } finally {
      setImproving(false);
    }
  };

  const handleDetectPriority = async () => {
    if (!content.trim() && !title.trim()) return;
    setDetectingPriority(true);
    try {
      const res = await announcementService.detectPriority(title, content);
      if (res?.success && res?.priority) {
        setDetectedPriority(res);
        toast.success(`Priority detected: ${res.priority}`);
      }
    } catch {
      // Silent fail — priority detection is non-critical
    } finally {
      setDetectingPriority(false);
    }
  };

  // Auto-detect priority when content changes (debounced)
  useEffect(() => {
    if (!content.trim() || content.length < 20) {
      setDetectedPriority(null);
      return;
    }
    const timer = setTimeout(() => {
      handleDetectPriority();
    }, 2000);
    return () => clearTimeout(timer);
  }, [content]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 5) {
      toast.error("Maximum 5 attachments allowed");
      return;
    }
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    if (!selectedCourse) {
      toast.error("Select a target course");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("courseId", selectedCourse);
      if (scheduledAt) formData.append("scheduledAt", scheduledAt);
      attachments.forEach((file) => formData.append("attachments", file));

      await announcementService.createAnnouncement(formData);
      toast.success(scheduledAt ? "Announcement scheduled!" : "Announcement published!");
      setTitle("");
      setContent("");
      setSelectedCourse("");
      setAttachments([]);
      setScheduledAt("");
    } catch {
      toast.error("Failed to create announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Create Announcement</h1>
        <p className="text-muted-foreground text-sm mt-1">Draft, enhance with AI, and publish to your students</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard className="p-6">
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Important Update: Exam Schedule Change"
                className="w-full bg-accent/50 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50" />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleImprove} disabled={improving || !content.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-40">
                      {improving ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
                      Improve
                    </button>
                    <button type="button" onClick={handleGenerate} disabled={generating || !content.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium hover:bg-purple-500/20 transition-colors disabled:opacity-40">
                      {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      AI Generate
                    </button>
                    <div className="relative group">
                      <button type="button" onClick={handleParaphrase} disabled={paraphrasing || !content.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-40">
                        {paraphrasing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        Paraphrase
                      </button>
                      <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[180px]">
                        <p className="text-[10px] text-muted-foreground mb-1.5 px-2">Tone</p>
                        {TONE_OPTIONS.map((tone) => (
                          <button key={tone.id} type="button" onClick={() => { setSelectedTone(tone.id); handleParaphrase(); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedTone === tone.id ? "bg-blue-500/10 text-blue-400" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                            <span className="font-medium">{tone.label}</span>
                            <p className="text-[10px] text-muted-foreground/60">{tone.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
                    placeholder="Type your announcement here, or enter informal notes and click 'AI Generate' to create a professional version..."
                    className="w-full bg-accent/50 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50 resize-y min-h-[160px]" />
                  {detectedPriority && (
                    <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold ${priorityConfig[detectedPriority.priority]?.color || priorityConfig.medium.color}`}>
                      {detectingPriority ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <>
                          <ShieldAlert size={10} />
                          {priorityConfig[detectedPriority.priority]?.label || 'Medium'} Priority
                        </>
                      )}
                    </div>
                  )}
                </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Target Course</label>
              {loadingCourses ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 size={14} className="animate-spin" /> Loading courses...</div>
              ) : courses.length === 0 ? (
                <p className="text-sm text-amber-400">No courses assigned to you yet.</p>
              ) : (
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-accent/50 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-blue-500/50">
                  <option value="">Select a course...</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} {c.code ? `(${c.code})` : ""}{c.class?.name ? ` - ${c.class.name}` : ""}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                  <Clock size={12} /> Schedule (optional)
                </label>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-accent/50 border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-blue-500/50 [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Attachments</label>
                <label className="flex items-center gap-2 px-4 py-3 bg-accent/50 border border-border rounded-xl cursor-pointer hover:bg-accent transition-colors text-sm text-muted-foreground">
                  <Paperclip size={14} />
                  <span>Add Files</span>
                  <input type="file" multiple accept=".pdf,.docx,.jpg,.png,.ppt" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 border border-border text-xs">
                    {file.type?.startsWith("image/") ? <Image size={12} /> : <FileText size={12} />}
                    <span className="text-muted-foreground truncate max-w-[120px]">{file.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-red-400"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => { setTitle(""); setContent(""); setSelectedClass(""); setAttachments([]); setScheduledAt(""); }}
            className="px-6 py-3 bg-accent/50 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Clear
          </button>
          <button type="submit" disabled={saving || !title.trim() || !content.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {scheduledAt ? "Schedule" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
