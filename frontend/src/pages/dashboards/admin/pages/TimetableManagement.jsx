import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Activity,
  Upload,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../../../../services/adminService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7);
const ROW_HEIGHT = 72;

const DAY_COLORS = [
  { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
  { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
];

function hourToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function TimetableManagement() {
  const [classes, setClasses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: "Monday",
    startTime: "08:00",
    endTime: "09:00",
    venue: "",
    lecturerId: "",
    topic: "",
    recurringPattern: "weekly",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchTimetable();
  }, [selectedClass]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [classesRes, usersRes] = await Promise.all([
        adminService.getClasses().catch(() => ({ data: [] })),
        adminService.getUsers(1, 1000, {}, true).catch(() => ({ users: [] })),
      ]);
      setClasses(classesRes.data || classesRes || []);
      setLecturers((usersRes.users || []).filter((u) => u.role === "lecturer"));
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTimetableByClass(selectedClass);
      setEntries(res.data || []);
    } catch (err) {
      console.error("Failed to load timetable", err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getLecturerName = (id) => {
    const l = lecturers.find((l) => l._id === id);
    return l?.name || "Unknown";
  };

  const entryGridPosition = (entry) => {
    const startMin = hourToMinutes(entry.startTime);
    const endMin = hourToMinutes(entry.endTime);
    const startHour = Math.max(7, Math.floor(startMin / 60));
    const endHour = Math.min(18, Math.ceil(endMin / 60));
    const rowStart = startHour - 7 + 2;
    const rowSpan = Math.max(1, endHour - startHour);
    return { rowStart, rowSpan };
  };

  const dayEntries = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => {
      map[d] = entries
        .filter((e) => e.dayOfWeek === d)
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    });
    return map;
  }, [entries]);

  const openAddModal = (day) => {
    setEditingEntry(null);
    setFormData({
      classId: selectedClass,
      dayOfWeek: day || "Monday",
      startTime: "08:00",
      endTime: "09:00",
      venue: "",
      lecturerId: lecturers[0]?._id || "",
      topic: "",
      recurringPattern: "weekly",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setFormData({
      classId: entry.classId?._id || entry.classId,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      venue: entry.venue || "",
      lecturerId: entry.lecturerId?._id || entry.lecturerId,
      topic: entry.topic || "",
      recurringPattern: entry.recurringPattern || "weekly",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.lecturerId) {
      toast.error("Please select a lecturer");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData, classId: selectedClass };
      if (editingEntry) {
        await adminService.updateTimetableEntry(editingEntry._id, payload);
        toast.success("Timetable entry updated");
      } else {
        await adminService.createTimetableEntry(payload);
        toast.success("Timetable entry created");
      }
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!confirm("Remove this timetable entry?")) return;
    setLoading(true);
    try {
      await adminService.deleteTimetableEntry(entry._id);
      toast.success("Entry removed");
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete entry");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (text) => {
      try {
        const rows = text.target.result.split("\n").slice(1).filter(Boolean);
        let success = 0;
        for (const row of rows) {
          const [dayOfWeek, startTime, endTime, venue, lecturerEmail, topic] = row.split(",");
          const lecturer = lecturers.find(
            (l) => l.email?.toLowerCase() === (lecturerEmail || "").trim().toLowerCase()
          );
          if (!lecturer) continue;
          await adminService.createTimetableEntry({
            classId: selectedClass,
            dayOfWeek: dayOfWeek.trim(),
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            venue: venue?.trim() || "",
            lecturerId: lecturer._id,
            topic: topic?.trim() || "",
          });
          success++;
        }
        toast.success(`Imported ${success} entries`);
        fetchTimetable();
      } catch {
        toast.error("Failed to parse CSV. Use: Day,Start,End,Venue,LecturerEmail,Topic");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const selectedClassObj = classes.find((c) => c._id === selectedClass);
  const weekRange = `${HOURS[0]}:00 – ${HOURS[HOURS.length - 1]}:00`;

  return (
    <div className="p-4 lg:p-6 space-y-6 w-full text-foreground min-w-0">
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Timetable Management</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} />
            {selectedClass ? `${selectedClassObj?.name} · ${selectedClassObj?.code} · ${selectedClassObj?.academicYear}` : "Select a class below"}
          </p>
        </div>
        {selectedClass && (
          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <label className="cursor-pointer bg-card border border-border hover:bg-accent px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 text-foreground">
              <Upload size={16} />
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
            </label>
            <button
              onClick={() => openAddModal("Monday")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
            >
              <Plus size={16} /> Add Entry
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64 shrink-0 space-y-2">
          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-card border border-border p-3.5 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
          >
            <option value="">-- Choose a class --</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          {selectedClass && (
            <div className="space-y-2">
              <div className="bg-card border border-border rounded-xl p-3.5 space-y-1.5">
                <p className="text-sm font-semibold text-foreground">{selectedClassObj?.name}</p>
                {selectedClassObj?.department && (
                  <p className="text-xs text-muted-foreground">{selectedClassObj.department.name}</p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                    {selectedClassObj?.code}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    {selectedClassObj?.level}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">
                    {selectedClassObj?.semester || "Semester 1"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Entries", value: entries.length, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Days Active", value: new Set(entries.map((e) => e.dayOfWeek)).size, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Lecturers", value: new Set(entries.map((e) => e.lecturerId?._id || e.lecturerId)).size, color: "text-violet-400", bg: "bg-violet-500/10" },
                  { label: "Venues", value: new Set(entries.map((e) => e.venue)).size, color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} border border-border rounded-xl p-2.5`}>
                    <div className="text-lg font-bold text-foreground">{s.value}</div>
                    <div className={`text-[10px] font-medium ${s.color}`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {!selectedClass ? (
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <Calendar size={56} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Select a class to view its timetable</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Choose from the dropdown on the left</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={13} />
                  <span>{weekRange}</span>
                </div>
                {entries.length === 0 && (
                  <span className="text-xs text-amber-400 flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    No entries yet — click Add Entry
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <div
                  className="grid min-w-[720px]"
                  style={{
                    gridTemplateColumns: `60px repeat(5, 1fr)`,
                    gridTemplateRows: `36px repeat(${HOURS.length}, ${ROW_HEIGHT}px)`,
                  }}
                >
                  <div className="bg-accent/50 border-r border-b border-border" />

                  {DAYS.map((day, di) => (
                    <div
                      key={day}
                      className={`flex items-center justify-center gap-2 border-r last:border-r-0 border-b border-border ${DAY_COLORS[di].bg}`}
                    >
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${DAY_COLORS[di].text}`}>
                        {day.slice(0, 3)}
                      </span>
                      <button
                        onClick={() => openAddModal(day)}
                        className={`opacity-0 hover:opacity-100 transition-opacity p-0.5 rounded ${DAY_COLORS[di].text} hover:${DAY_COLORS[di].bg}`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ))}

                  {HOURS.map((hour) => {
                    const label = `${hour.toString().padStart(2, "0")}:00`;
                    return (
                      <div
                        key={hour}
                        className="border-r border-b border-border bg-card flex items-start justify-end pr-2 pt-1"
                      >
                        <span className="text-[10px] font-medium text-muted-foreground/60">{label}</span>
                      </div>
                    );
                  })}

                  {HOURS.map((hour) =>
                    DAYS.map((day, di) => {
                      const rowIndex = hour - 7 + 2;
                      const colIndex = di + 2;
                      const slotEntries = dayEntries[day].filter((e) => {
                        const startH = Math.floor(hourToMinutes(e.startTime) / 60);
                        const endH = Math.ceil(hourToMinutes(e.endTime) / 60);
                        return startH <= hour && endH > hour;
                      });
                      const isFirstRender = slotEntries.filter(
                        (e) => Math.floor(hourToMinutes(e.startTime) / 60) === hour
                      );
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className="relative border-r last:border-r-0 border-b border-border bg-card/50"
                          style={{ gridRow: rowIndex, gridColumn: colIndex }}
                        >
                          {isFirstRender.map((entry) => {
                            const { rowSpan } = entryGridPosition(entry);
                            return (
                              <div
                                key={entry._id}
                                className={`absolute inset-x-0.5 top-0.5 rounded-lg border ${DAY_COLORS[di].border} ${DAY_COLORS[di].bg} p-1.5 overflow-hidden group cursor-pointer hover:brightness-110 transition-all z-10`}
                                style={{ height: `${rowSpan * ROW_HEIGHT - 4}px`, minHeight: "52px" }}
                              >
                                <div className="flex items-start justify-between h-full">
                                  <div className="flex-1 min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-1">
                                      <Clock size={9} className={DAY_COLORS[di].text} />
                                      <span className={`text-[10px] font-semibold ${DAY_COLORS[di].text}`}>
                                        {entry.startTime}
                                      </span>
                                    </div>
                                    {entry.topic && (
                                      <p className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                                        {entry.topic}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <User size={9} />
                                      <span className="truncate">
                                        {entry.lecturerId?.name || getLecturerName(entry.lecturerId?._id || entry.lecturerId)}
                                      </span>
                                    </div>
                                    {entry.venue && (
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <MapPin size={9} />
                                        <span className="truncate">{entry.venue}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openEditModal(entry); }}
                                      className="p-1 rounded-md bg-card/80 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/20 transition-all shadow-sm"
                                    >
                                      <Pencil size={10} />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDelete(entry); }}
                                      className="p-1 rounded-md bg-card/80 text-muted-foreground hover:text-red-400 hover:bg-red-500/20 transition-all shadow-sm"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card p-8 rounded-2xl border border-border w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingEntry ? "Edit" : "Add"} Timetable Entry
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Day</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Recurring</label>
                    <select
                      value={formData.recurringPattern}
                      onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value })}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Topic / Subject</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Database Systems Lecture"
                    className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Lecturer</label>
                    <select
                      value={formData.lecturerId}
                      onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">Select Lecturer</option>
                      {lecturers.map((l) => (
                        <option key={l._id} value={l._id}>{l.name} ({l.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">Venue / Room</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="e.g. Room 301"
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-foreground px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50">
                    {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
                    {editingEntry ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
