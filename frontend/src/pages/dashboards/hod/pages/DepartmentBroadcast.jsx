import { useState, useMemo, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import { Send, UploadCloud, Clock, Radio, Loader2 } from "lucide-react";
import classService from "@/services/classService";
import toast from "react-hot-toast";

export default function DepartmentBroadcast() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetLevel, setTargetLevel] = useState("all");
  const [schedule, setSchedule] = useState("now");
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const deptName = user?.department?.name || user?.department || "Department";

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getMyClasses();
        setClasses(data.data || data || []);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };
    fetchClasses();
  }, []);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    setLoading(true);
    try {
      const allStudents = [];
      classes.forEach(cls => {
        if (cls.students) {
          cls.students.forEach(student => {
            if (!allStudents.find(s => s._id === student._id)) {
              allStudents.push(student);
            }
          });
        }
      });

      let filteredStudents = allStudents;
      if (targetLevel !== "all") {
        filteredStudents = allStudents.filter(s => s.year === parseInt(targetLevel.replace('year', '')));
      }

      const results = await Promise.allSettled(
        filteredStudents.map(student => 
          fetch('/api/messages/notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              targetUserId: student._id,
              email: student.email,
              name: student.name,
              message,
              title: `${title} - ${deptName}`,
              priority: schedule === "now" ? "normal" : "low",
              category: "events"
            })
          }).then(res => res.json())
        )
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      toast.success(`Broadcast sent to ${successCount} students!`);
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Broadcast error:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  const studentCount = useMemo(() => {
    let total = 0;
    classes.forEach(cls => {
      total += cls.students?.length || 0;
    });
    if (targetLevel === "all") return total;
    return classes.reduce((acc, cls) => {
      const levelStudents = (cls.students || []).filter(s => s.year === parseInt(targetLevel.replace('year', '')));
      return acc + levelStudents.length;
    }, 0);
  }, [classes, targetLevel]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Department Broadcast
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Send critical updates to all students in the department.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Form Area */}
        <GlassCard className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Radio size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Compose Message
              </h2>
              <p className="text-xs text-neutral-500">
                This bypasses the standard approval workflow.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Broadcast Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Department Townhall Meeting"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Message Details
              </label>
              <textarea
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-600 resize-none"
                placeholder="Type your official announcement here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Target Level
                </label>
                <select 
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="all">All CS Students ({studentCount})</option>
                  <option value="year1">Year 1 Only</option>
                  <option value="year2">Year 2 Only</option>
                  <option value="year3">Year 3 Only</option>
                  <option value="year4">Final Year (Year 4)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Schedule
                </label>
                <select 
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="now">Send Immediately</option>
                  <option value="later">Schedule for later...</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Attachment
              </label>
              <button className="w-full py-4 border-2 border-dashed border-white/10 hover:border-blue-500/30 bg-white/[0.01] hover:bg-blue-500/5 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-blue-400 transition-all">
                <UploadCloud size={24} />
                <span className="text-sm">
                  Click to upload official documents (PDF, DOCX)
                </span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button 
              onClick={handleBroadcast}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Sending..." : "Broadcast Now"}
            </button>
          </div>
        </GlassCard>

        {/* Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-2">
            Student View Preview ({studentCount} recipients)
          </h3>
          <GlassCard
            hover={false}
            delay={0.2}
            className="relative overflow-hidden group border-rose-500/20"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-rose-400 font-bold">
                HoD
              </div>
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  Head of Department{" "}
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] uppercase">
                    Official
                  </span>
                </p>
                <p className="text-xs text-neutral-500">{deptName}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-3 relative z-10">
              {title || "Your broadcast title..."}
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 relative z-10 break-words whitespace-pre-wrap">
              {message ||
                "The body of your official broadcast will appear here exactly as students will see it on their mobile app or web portal."}
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-black/40 p-2.5 rounded-lg w-fit border border-white/5 relative z-10">
              <Clock size={14} /> {schedule === "now" ? "To be sent immediately" : "Scheduled for later"}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
