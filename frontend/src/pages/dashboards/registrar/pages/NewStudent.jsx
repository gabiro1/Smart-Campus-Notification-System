import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Loader2, CheckCircle, ArrowLeft, Hash, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import registrarService from "../../../../services/registrarService";
import apiClient from "../../../../services/apiClient";

export default function NewStudent() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdStudent, setCreatedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [regPreview, setRegPreview] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "", phoneNumber: "",
    classId: "", level: "", department: "",
  });

  useEffect(() => {
    apiClient.get("/classes").then((r) => setClasses(r.data?.data || r.data || [])).catch(() => {});
    apiClient.get("/departments").then((r) => setDepartments(r.data?.data || r.data || [])).catch(() => {});
  }, []);

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    setErrors((p) => ({ ...p, [f]: undefined }));
  };

  const previewReg = useCallback(async (department) => {
    if (!department) { setRegPreview(null); return; }
    setRegLoading(true);
    try {
      const res = await registrarService.previewRegNumber(department);
      setRegPreview(res.data);
    } catch {
      setRegPreview(null);
    } finally {
      setRegLoading(false);
    }
  }, []);

  useEffect(() => {
    const dept = form.department || form.classId;
    if (dept) {
      const timeout = setTimeout(() => previewReg(dept), 300);
      return () => clearTimeout(timeout);
    } else {
      setRegPreview(null);
    }
  }, [form.department, form.classId, previewReg]);

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", phoneNumber: "", classId: "", level: "", department: "" });
    setErrors({});
    setRegPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const res = await registrarService.createStudent(form);
      setCreatedStudent(res.data);
      setSuccess(true);
      toast.success("Student created successfully");
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
      } else {
        toast.error(err.response?.data?.message || "Failed to create student");
      }
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Student Registered</h2>
          <p className="text-sm text-muted-foreground mb-6">{createdStudent?.name || form.name}</p>

          <div className="bg-accent/50 rounded-xl p-5 mb-6 text-left">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Registration Number</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Hash size={20} className="text-emerald-500" />
              </div>
              <div>
                <span className="text-2xl font-mono font-bold text-foreground tracking-wider">
                  {createdStudent?.registrationNumber}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Auto-generated &bull; Cannot be modified</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => { setSuccess(false); setCreatedStudent(null); resetForm(); }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium">
              <UserPlus size={15} />
              Create Another Student
            </button>
            <button onClick={() => navigate(`/registrar/students`)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-all text-sm font-medium">
              <ExternalLink size={15} />
              View Student Records
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-lg bg-accent border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
      errors[field] ? "border-red-500/50 focus:ring-red-500/30" : "border-border focus:ring-blue-500/40"
    }`;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate("/registrar/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <UserPlus className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Register New Student</h1>
              <p className="text-xs text-muted-foreground">Create a new student account with academic identity</p>
            </div>
          </div>

          <AnimatePresence>
            {regPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Registration Number <span className="text-emerald-500">(Auto-generated)</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash size={16} className="text-emerald-500 shrink-0" />
                        <span className="text-xl font-mono font-bold text-foreground tracking-wider">
                          {regPreview.regNumber}
                        </span>
                        {regLoading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">{regPreview.department}</p>
                      <p className="text-[11px] text-muted-foreground">{regPreview.year} intake</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
              <input type="text" value={form.name} onChange={set("name")} placeholder="e.g. Jean Baptiste"
                className={inputClass("name")} />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="student@university.ac.rw"
                className={inputClass("email")} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password *</label>
              <input type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
                className={inputClass("password")} />
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
              <input type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="e.g. +250 789 000 000"
                className={inputClass("phoneNumber")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Level</label>
              <select value={form.level} onChange={set("level")}
                className={inputClass("level")}>
                <option value="">Select level</option>
                {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Class</label>
              <select value={form.classId} onChange={set("classId")}
                className={inputClass("classId")}>
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} {c.code ? `(${c.code})` : ""}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Department *</label>
              <select value={form.department} onChange={set("department")}
                className={inputClass("department")}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              {errors.department && <p className="text-xs text-red-400 mt-1">{errors.department}</p>}
            </div>
          </div>

          {errors.registrationNumber && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {errors.registrationNumber}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate("/registrar/dashboard")}
              className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all text-sm font-medium shadow-sm">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
