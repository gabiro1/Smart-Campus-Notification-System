import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  X,
  BookOpen,
  Mail,
  Phone,
  Search,
  RefreshCw,
  Activity,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import classService from "../../../../services/classService";
import adminService from "../../../../services/adminService";

export default function LecturerManagement() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [newLecturer, setNewLecturer] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [showAssigned, setShowAssigned] = useState(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lecturersData, classesData] = await Promise.all([
        classService.getLecturers().catch(() => []),
        classService.getAllClasses().catch(() => []),
      ]);
      setLecturers(Array.isArray(lecturersData) ? lecturersData : []);
      const deptId = user.department;
      setClasses(
        Array.isArray(classesData)
          ? classesData.filter((c) => String(c.department?._id || c.department) === String(deptId))
          : []
      );
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Failed to load lecturers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignClass = async () => {
    if (!assignModal) return;
    setActionLoading(true);
    try {
      await classService.assignClassToLecturer(assignModal.lecturerId, assignModal.classId);
      toast.success("Class assigned to lecturer");
      setAssignModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign class");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveClass = async (lecturerId, classId) => {
    if (!confirm("Remove this class from the lecturer?")) return;
    setActionLoading(true);
    try {
      await classService.removeClassFromLecturer(lecturerId, classId);
      toast.success("Class removed from lecturer");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove class");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateLecturer = async () => {
    if (!newLecturer.name || !newLecturer.email || !newLecturer.password) {
      toast.error("Name, email, and password are required");
      return;
    }
    setActionLoading(true);
    try {
      await adminService.createUser({
        ...newLecturer,
        role: "lecturer",
        department: user.department,
      });
      toast.success("Lecturer created successfully");
      setCreateModal(false);
      setNewLecturer({ name: "", email: "", password: "", phoneNumber: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create lecturer");
    } finally {
      setActionLoading(false);
    }
  };

  const availableClasses = (lecturerId) => {
    const lecturer = lecturers.find((l) => l.id === lecturerId);
    const assignedIds = new Set((lecturer?.assignedClasses || []).map((c) => c.id));
    return classes.filter((c) => !assignedIds.has(c._id));
  };

  const filteredLecturers = lecturers.filter(
    (l) =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-accent rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <LoadingCard key={i} />)}
        </div>
        <LoadingCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Lecturer Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage lecturers and their class assignments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 text-muted-foreground transition-all"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} />
            Add Lecturer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Lecturers" value={lecturers.length} icon={Users} iconBgClass="bg-blue-500/10" iconClass="text-blue-500" />
        <StatCard title="Total Classes" value={classes.length} icon={BookOpen} iconBgClass="bg-emerald-500/10" iconClass="text-emerald-500" />
        <StatCard
          title="With Classes"
          value={lecturers.filter((l) => (l.assignedClasses || []).length > 0).length}
          icon={GraduationCap}
          iconBgClass="bg-purple-500/10"
          iconClass="text-purple-500"
        />
        <StatCard
          title="Unassigned"
          value={lecturers.filter((l) => (l.assignedClasses || []).length === 0).length}
          icon={Users}
          iconBgClass="bg-amber-500/10"
          iconClass="text-amber-500"
        />
      </div>

      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lecturers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredLecturers.length} of {lecturers.length} lecturers
          </p>
        </div>

        {filteredLecturers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="text-lg font-medium">No lecturers found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term" : "Click 'Add Lecturer' to create one"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLecturers.map((lecturer) => (
              <motion.div
                key={lecturer.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent/30 border border-border rounded-xl p-4 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold shrink-0">
                      {lecturer.name?.charAt(0) || "L"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {lecturer.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail size={10} />
                        {lecturer.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Phone size={10} />
                  <span>{lecturer.phone || "N/A"}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                      Classes ({lecturer.assignedClasses?.length || 0})
                    </p>
                    <button
                      onClick={() => {
                        const av = availableClasses(lecturer.id);
                        if (av.length === 0) {
                          toast.error("No available classes to assign");
                          return;
                        }
                        setAssignModal({ lecturerId: lecturer.id, classId: av[0]._id });
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <Plus size={10} />
                      Assign
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(lecturer.assignedClasses || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No classes assigned</p>
                    ) : (
                      (lecturer.assignedClasses || []).slice(0, showAssigned === lecturer.id ? undefined : 3).map((cls) => (
                        <div
                          key={cls.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-card border border-border"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">
                              {cls.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {cls.code} • {cls.level}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveClass(lecturer.id, cls.id)}
                            className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-all shrink-0 ml-2"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                    {(lecturer.assignedClasses || []).length > 3 && (
                      <button
                        onClick={() => setShowAssigned(showAssigned === lecturer.id ? null : lecturer.id)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {showAssigned === lecturer.id
                          ? "Show less"
                          : `Show ${lecturer.assignedClasses.length - 3} more`}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">Assign Class to Lecturer</h3>
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Select Class</label>
              <select
                value={assignModal.classId}
                onChange={(e) => setAssignModal({ ...assignModal, classId: e.target.value })}
                className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-blue-500"
              >
                {availableClasses(assignModal.lecturerId).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code}) — {c.level}
                  </option>
                ))}
              </select>
              {availableClasses(assignModal.lecturerId).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  All classes are already assigned
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignClass}
                disabled={actionLoading || availableClasses(assignModal.lecturerId).length === 0}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? <Activity size={14} className="animate-spin" /> : <Plus size={14} />}
                Assign
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Create Lecturer</h3>
              <button onClick={() => setCreateModal(false)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={newLecturer.name}
                  onChange={(e) => setNewLecturer({ ...newLecturer, name: e.target.value })}
                  placeholder="e.g. Dr. John Smith"
                  className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={newLecturer.email}
                  onChange={(e) => setNewLecturer({ ...newLecturer, email: e.target.value })}
                  placeholder="john.smith@university.edu"
                  className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={newLecturer.password}
                  onChange={(e) => setNewLecturer({ ...newLecturer, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone (Optional)</label>
                <input
                  type="text"
                  value={newLecturer.phoneNumber}
                  onChange={(e) => setNewLecturer({ ...newLecturer, phoneNumber: e.target.value })}
                  placeholder="+250 7XX XXX XXX"
                  className="w-full bg-accent border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setCreateModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLecturer}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? <Activity size={14} className="animate-spin" /> : <Plus size={14} />}
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
