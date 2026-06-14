import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Search, Loader2, RefreshCw, AlertTriangle,
  Trash2, PlusCircle, Sparkles, Send, X, Paperclip, FileText, Image,
  Clock, Globe, School, Users, Building2, BookOpen
} from "lucide-react";
import { GlassCard } from "@/components/shared";
import announcementService from "@/services/announcementService";
import apiClient from "@/services/apiClient";
import toast from "react-hot-toast";

const SCOPE_OPTIONS = [
  { id: "course", label: "Course", icon: BookOpen, desc: "Students in a specific course" },
  { id: "department", label: "Department", icon: School, desc: "All students in the department" },
  { id: "college", label: "College", icon: Building2, desc: "Entire college" },
];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-accent/50 ${className}`} />;
}

const statusBadge = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Draft: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LecturerBroadcastTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState("course");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [selectedCollege, setSelectedCollege] = useState("");
  const [colleges, setColleges] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await announcementService.getLecturerAnnouncements();
      const data = res?.data || res?.announcements || res || [];
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleOpenCreate = async () => {
    resetForm();
    setShowCreate(true);
    setLoadingCourses(true);
    try {
      const res = await announcementService.getMyCourses();
      const list = Array.isArray(res) ? res : res?.data || res?.courses || [];
      setCourses(list);
    } catch { setCourses([]); }
    finally { setLoadingCourses(false); }
  };

  const loadDepartments = async () => {
    setLoadingDepts(true);
    try {
      const res = await apiClient.get('/departments');
      const list = res?.data?.data || res?.data || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch { setDepartments([]); }
    finally { setLoadingDepts(false); }
  };

  const loadColleges = async () => {
    setLoadingColleges(true);
    try {
      const res = await apiClient.get('/colleges');
      const list = res?.data?.data || res?.data || [];
      setColleges(Array.isArray(list) ? list : []);
    } catch { setColleges([]); }
    finally { setLoadingColleges(false); }
  };

  useEffect(() => {
    if (!showCreate) return;
    loadDepartments();
    loadColleges();
  }, [showCreate]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setScope("course");
    setSelectedCourse("");
    setSelectedDepartment("");
    setSelectedCollege("");
    setAttachments([]);
    setScheduledAt("");
  };

  const handleGenerate = async () => {
    if (!content.trim()) { toast.error("Enter some notes first"); return; }
    setGenerating(true);
    try {
      const res = await announcementService.suggestAnnouncement(content);
      const generated = res?.data?.content || res?.content || "";
      if (generated) {
        setContent(generated);
        if (!title.trim() && res?.data?.title) setTitle(res.data.title);
        toast.success("AI announcement generated!");
      } else toast.error("AI generation returned empty result");
    } catch { toast.error("AI generation failed"); }
    finally { setGenerating(false); }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 5) { toast.error("Max 5 attachments"); return; }
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error("Title and content are required"); return; }
    if (!selectedCourse) { toast.error("Select a course"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("courseId", selectedCourse);
      formData.append("scope", scope);
      if (scope === "department") formData.append("departmentId", selectedDepartment);
      if (scope === "college") formData.append("collegeId", selectedCollege);
      if (scheduledAt) formData.append("scheduledAt", scheduledAt);
      attachments.forEach((file) => formData.append("attachments", file));
      await announcementService.createAnnouncement(formData);
      toast.success(scheduledAt ? "Announcement scheduled!" : "Announcement published!");
      resetForm();
      setShowCreate(false);
      fetchAnnouncements();
    } catch { toast.error("Failed to create announcement"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      toast.success("Announcement deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = announcements.filter((a) => {
    const q = search.toLowerCase();
    return (a.title || "").toLowerCase().includes(q) || (a.content || "").toLowerCase().includes(q);
  });

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-4">
      <AnimatePresence mode="wait">
        {showCreate ? (
          <motion.div key="create" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <GlassCard padding="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Megaphone size={16} className="text-primary" />
                  New Broadcast
                </h2>
                <button onClick={() => { setShowCreate(false); resetForm(); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                  <X size={15} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title..."
                  className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
                    <button type="button" onClick={handleGenerate} disabled={generating || !content.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium hover:bg-purple-500/20 transition-colors disabled:opacity-40">
                      {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      AI Generate
                    </button>
                  </div>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
                    placeholder="Type your announcement..."
                    className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50 resize-y min-h-[100px]" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Target Course (required)</label>
                  {loadingCourses ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={12} className="animate-spin" /> Loading courses...</div>
                  ) : courses.length === 0 ? (
                    <p className="text-xs text-amber-400">No courses assigned to you.</p>
                  ) : (
                    <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50">
                      <option value="">Select a course...</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.code ? `(${c.code})` : ""}{c.class?.name ? ` - ${c.class.name}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Broadcast Scope (optional)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SCOPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button key={opt.id} type="button" onClick={() => setScope(opt.id)}
                          className={`p-3 rounded-xl border transition-all text-left ${scope === opt.id ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-blue-500/30 bg-accent/30"}`}>
                          <Icon size={16} className={scope === opt.id ? "text-blue-400" : "text-muted-foreground"} />
                          <p className={`text-xs font-medium mt-1 ${scope === opt.id ? "text-foreground" : "text-muted-foreground"}`}>{opt.label}</p>
                        </button>
                      );
                    })}
                  </div>

                  {scope === "department" && (
                    <div className="mt-2">
                      {loadingDepts ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={12} className="animate-spin" /> Loading departments...</div>
                      ) : departments.length === 0 ? (
                        <p className="text-xs text-amber-400">No departments available.</p>
                      ) : (
                        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50">
                          <option value="">Select a department...</option>
                          {departments.map((d) => (
                            <option key={d._id} value={d._id}>{d.name} {d.code ? `(${d.code})` : ""}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {scope === "college" && (
                    <div className="mt-2">
                      {loadingColleges ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={12} className="animate-spin" /> Loading colleges...</div>
                      ) : colleges.length === 0 ? (
                        <p className="text-xs text-amber-400">No colleges available.</p>
                      ) : (
                        <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}
                          className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50">
                          <option value="">Select a college...</option>
                          {colleges.map((c) => (
                            <option key={c._id} value={c._id}>{c.name} {c.code ? `(${c.code})` : ""}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full bg-accent/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 [color-scheme:dark]" />
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-accent/50 border border-border rounded-xl cursor-pointer hover:bg-accent transition-colors text-sm text-muted-foreground shrink-0">
                    <Paperclip size={14} />
                    <span className="text-xs">Files</span>
                    <input type="file" multiple accept=".pdf,.docx,.jpg,.png,.ppt" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50 border border-border text-xs">
                        {file.type?.startsWith("image/") ? <Image size={12} /> : <FileText size={12} />}
                        <span className="text-muted-foreground truncate max-w-[100px]">{file.name}</span>
                        <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-400"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); resetForm(); }}
                    className="px-4 py-2.5 bg-accent/50 border border-border rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || !title.trim() || !content.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    {scheduledAt ? "Schedule" : "Publish"}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
            <GlassCard padding="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Megaphone size={16} className="text-primary" />
                  Broadcast History
                </h2>
                <button onClick={handleOpenCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
                  <PlusCircle size={14} /> New Broadcast
                </button>
              </div>
            </GlassCard>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-muted-foreground">Recent Announcements</h2>
                <div className="flex items-center gap-2">
                  <div className="relative max-w-[180px]">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Search..." value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50" />
                  </div>
                  <button onClick={fetchAnnouncements} disabled={loading}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50">
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <GlassCard key={i} padding="p-3" hover={false}>
                      <div className="flex items-start gap-3">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="w-2/3 h-3.5" />
                          <Skeleton className="w-full h-2.5" />
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : error ? (
                <GlassCard padding="p-6">
                  <div className="text-center space-y-2">
                    <AlertTriangle size={24} className="mx-auto text-amber-400" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <button onClick={fetchAnnouncements} className="text-xs text-blue-400 hover:text-blue-300">Retry</button>
                  </div>
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {filtered.map((item) => {
                    const status = item.status || "Draft";
                    return (
                      <GlassCard key={item._id} padding="p-3" hover={false}>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                            <Megaphone size={14} className="text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${statusBadge[status] || statusBadge.Draft}`}>{status}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.content || ""}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(item.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleDelete(item._id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                  {filtered.length === 0 && (
                    <GlassCard padding="p-6">
                      <div className="text-center">
                        <Megaphone size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">No announcements yet</p>
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}