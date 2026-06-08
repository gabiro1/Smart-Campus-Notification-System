import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Users, Calendar, MapPin, Clock, RefreshCw,
  AlertCircle, ChevronRight, GraduationCap, Mail, Loader2
} from "lucide-react";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import classService from "../../../../services/classService";
import adminService from "../../../../services/adminService";

export default function LecturerClasses() {
  const [classes, setClasses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [classesRes, timetableRes] = await Promise.all([
        classService.getMyClasses().catch(() => ({ data: [] })),
        adminService.getTimetable({ lecturerId: JSON.parse(localStorage.getItem("user") || "{}")._id }).catch(() => ({ data: [] })),
      ]);
      setClasses(classesRes.data || classesRes || []);
      setTimetable(timetableRes.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchStudents = async (classId) => {
    setLoadingStudents(true);
    setSelectedClass(classId);
    try {
      const res = await classService.getClassStudents(classId);
      setStudents(res.data || res.students || []);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const getClassTimetable = (classId) => {
    return timetable.filter((e) => (e.classId?._id || e.classId) === classId)
      .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
  };

  const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-accent rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-accent rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <LoadingCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-lg font-semibold text-foreground">Failed to Load Classes</p>
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm">
            <RefreshCw size={16} /> Retry
          </button>
        </GlassCard>
      </div>
    );
  }

  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || c.students?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground mt-1">View your assigned classes, schedules, and students</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Classes" value={classes.length} icon={BookOpen} iconBgClass="bg-blue-500/10" iconClass="text-blue-500" />
        <StatCard title="Students" value={totalStudents} icon={Users} iconBgClass="bg-emerald-500/10" iconClass="text-emerald-500" />
        <StatCard title="Weekly Sessions" value={timetable.length} icon={Calendar} iconBgClass="bg-violet-500/10" iconClass="text-violet-500" />
      </div>

      {classes.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
          <BookOpen className="w-12 h-12 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">No Classes Assigned</p>
          <p className="text-sm text-muted-foreground">You haven't been assigned any classes yet.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.map((cls, i) => {
            const clsTimetable = getClassTimetable(cls._id);
            const studentCount = cls.studentCount || cls.students?.length || 0;
            return (
              <motion.div key={cls._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="h-full" hover={false}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <GraduationCap size={22} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{cls.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {cls.code && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">{cls.code}</span>}
                          <span className="text-xs text-muted-foreground">Lvl {cls.level || "?"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users size={14} />
                      <span className="font-medium">{studentCount}</span>
                    </div>
                  </div>

                  {clsTimetable.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Schedule</p>
                      {clsTimetable.slice(0, 3).map((entry, ei) => (
                        <div key={entry._id || ei} className="flex items-center gap-2.5 p-2 rounded-lg bg-accent/50 border border-border text-xs">
                          <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                            {entry.dayOfWeek?.slice(0, 3)}
                          </span>
                          <Clock size={11} className="text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">{entry.startTime} - {entry.endTime}</span>
                          {entry.venue && (
                            <>
                              <MapPin size={11} className="text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground truncate">{entry.venue}</span>
                            </>
                          )}
                        </div>
                      ))}
                      {clsTimetable.length > 3 && (
                        <p className="text-[10px] text-muted-foreground pl-1">+{clsTimetable.length - 3} more sessions</p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => fetchStudents(cls._id)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all"
                  >
                    <Users size={14} />
                    View Roster ({studentCount})
                    <ChevronRight size={14} />
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => { setSelectedClass(null); setStudents([]); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card p-4 sm:p-6 rounded-2xl border border-border w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl mx-2 sm:mx-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Class Roster</h2>
              <button onClick={() => { setSelectedClass(null); setStudents([]); }} className="text-muted-foreground hover:text-foreground text-lg">&times;</button>
            </div>
            {loadingStudents ? (
              <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Users className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No students enrolled in this class.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">{students.length} student{students.length !== 1 ? "s" : ""} enrolled</p>
                {students.map((s, i) => (
                  <div key={s._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {s.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {s.email && <span className="flex items-center gap-1"><Mail size={10} />{s.email}</span>}
                        {s.studentID && <span>• {s.studentID}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
