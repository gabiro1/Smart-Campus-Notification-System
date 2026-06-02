import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Eye, Edit2, UserX, UserCheck, Loader2,
  ChevronLeft, ChevronRight, Mail, Phone, Calendar,
  GraduationCap, Building2, Hash, AlertTriangle, X,
} from "lucide-react";
import toast from "react-hot-toast";
import registrarService from "../../../../services/registrarService";
import { format } from "date-fns";

export default function StudentRecords() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await registrarService.getStudents(page, 50, { search });
      setStudents(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
      setTotal(res.pagination?.total || 0);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleToggleSuspend = async (id, name) => {
    setActionLoading(id);
    try {
      await registrarService.toggleSuspendStudent(id);
      toast.success(`Student ${name} updated`);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setActionLoading(editTarget._id);
    try {
      await registrarService.updateStudent(editTarget._id, {
        name: editTarget.name,
        phoneNumber: editTarget.phoneNumber,
        level: editTarget.level,
      });
      toast.success("Student updated");
      setEditTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Student Records</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total students</p>
        </div>
        <button onClick={fetchStudents}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
          <Loader2 size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Search by name, email, or ID..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No students found</p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Level</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {students.map((s) => (
                      <motion.tr
                        key={s._id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                              {s.name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium text-foreground">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.studentID || "-"}</td>
                        <td className="px-4 py-3 capitalize text-muted-foreground">{s.level || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" :
                            s.status === "SUSPENDED" ? "bg-red-500/10 text-red-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {s.status === "SUSPENDED" ? <UserX size={10} /> : <UserCheck size={10} />}
                            {s.status || "UNKNOWN"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewTarget(s)}
                              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => setEditTarget({ ...s })}
                              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleToggleSuspend(s._id, s.name)}
                              disabled={actionLoading === s._id}
                              className={`p-1.5 rounded-lg transition-colors ${
                                s.status === "SUSPENDED"
                                  ? "text-emerald-500 hover:bg-emerald-500/10"
                                  : "text-red-500 hover:bg-red-500/10"
                              }`}>
                              {actionLoading === s._id
                                ? <Loader2 size={14} className="animate-spin" />
                                : s.status === "SUSPENDED" ? <UserCheck size={14} /> : <UserX size={14} />
                              }
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewTarget(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Student Details</h2>
                <button onClick={() => setViewTarget(null)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {viewTarget.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{viewTarget.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{viewTarget.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Mail size={14} /> {viewTarget.email}</div>
                  {viewTarget.phoneNumber && <div className="flex items-center gap-2 text-muted-foreground"><Phone size={14} /> {viewTarget.phoneNumber}</div>}
                  {viewTarget.studentID && <div className="flex items-center gap-2 text-muted-foreground"><Hash size={14} /> {viewTarget.studentID}</div>}
                  {viewTarget.level && <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap size={14} /> {viewTarget.level}</div>}
                  {viewTarget.department?.name && <div className="flex items-center gap-2 text-muted-foreground"><Building2 size={14} /> {viewTarget.department.name}</div>}
                  <div className="flex items-center gap-2 text-muted-foreground"><Calendar size={14} /> Created {format(new Date(viewTarget.createdAt), "MMM d, yyyy")}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditTarget(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Edit Student</h2>
                <button onClick={() => setEditTarget(null)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <input type="text" value={editTarget.name}
                    onChange={(e) => setEditTarget((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  <input type="tel" value={editTarget.phoneNumber || ""}
                    onChange={(e) => setEditTarget((p) => ({ ...p, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Level</label>
                  <select value={editTarget.level || ""}
                    onChange={(e) => setEditTarget((p) => ({ ...p, level: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                    <option value="">Select level</option>
                    {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setEditTarget(null)}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                  <button onClick={handleEditSave} disabled={actionLoading === editTarget._id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium">
                    {actionLoading === editTarget._id && <Loader2 size={14} className="animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
