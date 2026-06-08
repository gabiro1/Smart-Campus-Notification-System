import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Upload, FileText, Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../services/adminService";

const CSV_TEMPLATES = {
  colleges: { filename: "colleges_template.csv", headers: ["name", "code", "principalEmail"] },
  schools: { filename: "schools_template.csv", headers: ["name", "code", "collegeCode", "deanEmail"] },
  departments: { filename: "departments_template.csv", headers: ["name", "code", "schoolCode", "hodEmail"] },
  classes: { filename: "classes_template.csv", headers: ["name", "code", "departmentCode", "level", "academicYear"] },
  courses: { filename: "courses_template.csv", headers: ["name", "code", "classCode", "lecturerEmail", "semester"] },
  students: { filename: "students_template.csv", headers: ["name", "email", "password", "phoneNumber", "classCode", "level"] },
  lecturers: { filename: "lecturers_template.csv", headers: ["name", "email", "password", "phoneNumber", "departmentCode"] },
  users: { filename: "users_template.csv", headers: ["name", "email", "password", "phoneNumber", "role", "departmentCode"] },
};

const ENTITY_LABELS = {
  colleges: "Colleges",
  schools: "Schools",
  departments: "Departments",
  classes: "Classes",
  courses: "Courses",
  students: "Students",
  lecturers: "Lecturers",
  users: "Users",
};

export default function BulkUploadModal({ isOpen, onClose, entity, onComplete, sidebarOffset = 0 }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const template = CSV_TEMPLATES[entity];

  const handleDownloadTemplate = () => {
    const headerLine = template.headers.join(",");
    const exampleLine = template.headers.map(h => {
      const examples = {
        name: "Example Name",
        code: "EX001",
        email: "example@university.edu",
        password: "Pass@123",
        phoneNumber: "+1234567890",
        collegeCode: "CST",
        schoolCode: "SOICT",
        departmentCode: "IT",
        classCode: "IT1",
        level: "1",
        academicYear: "2025-2026",
        semester: "1",
        principalEmail: "principal@university.edu",
        deanEmail: "dean@university.edu",
        hodEmail: "hod@university.edu",
        lecturerEmail: "lecturer@university.edu",
        lecturer: "lecturer@university.edu",
        role: "student",
        class: "IT1",
        department: "IT",
        college: "CST",
        school: "SOICT",
      };
      return examples[h] || h;
    }).join(",");
    const bom = "\uFEFF";
    const csv = bom + headerLine + "\n" + exampleLine;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = template.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.match(/\.(csv|xlsx|xls)$/i)) {
        toast.error("Please select a CSV or Excel file");
        return;
      }
      setFile(selected);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      if (!dropped.name.match(/\.(csv|xlsx|xls)$/i)) {
        toast.error("Please select a CSV or Excel file");
        return;
      }
      setFile(dropped);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const data = await adminService.bulkUpload(entity, file);
      setResult(data);
      if (data.created > 0) {
        toast.success(`Created ${data.created} ${ENTITY_LABELS[entity].toLowerCase()} successfully`);
        if (onComplete) onComplete(data);
      } else {
        toast("No new records created");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed";
      toast.error(msg);
      setResult({ success: false, message: msg, errors: [{ reason: msg }] });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setUploading(false);
    onClose();
  };

  return (
    <div style={{ left: sidebarOffset, width: `calc(100% - ${sidebarOffset}px)` }} className="fixed top-0 right-0 bottom-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card p-4 sm:p-6 lg:p-8 rounded-t-2xl sm:rounded-2xl border border-border w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/10">
              <Upload size={16} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Bulk Import {ENTITY_LABELS[entity]}
              </h2>
              <p className="text-xs text-muted-foreground">Upload a CSV file to add multiple records at once</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/8 to-purple-500/8 border border-blue-500/15 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <FileText size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-300 font-medium">Expected CSV Headers</p>
                <p className="text-xs text-blue-400/70 mt-1.5 leading-relaxed">
                  {template.headers.map((h, i) => (
                    <code key={h} className="inline-block px-2 py-0.5 bg-blue-500/10 rounded-md text-blue-300/90 font-mono text-[11px] mr-1.5 mb-1">{h}</code>
                  ))}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="group w-full flex items-center justify-center gap-2.5 py-3 border-2 border-dashed border-border hover:border-blue-500/40 rounded-xl text-sm text-muted-foreground hover:text-blue-400 transition-all duration-300 bg-gradient-to-r from-transparent to-transparent hover:from-blue-500/5 hover:to-purple-500/5"
          >
            <Download size={16} className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
            Download CSV Template
          </button>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
              file
                ? "border-green-500/50 bg-green-500/5"
                : "border-border hover:border-blue-500/40 bg-gradient-to-br from-transparent to-transparent hover:from-blue-500/5 hover:to-purple-500/5"
            }`}
          >
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${file ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} style={{
              background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59,130,246,0.06) 0%, transparent 60%)'
            }} />
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="space-y-3 relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                  <CheckCircle size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB &middot; Click to change
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto border border-blue-500/10 group-hover:border-blue-500/30 transition-all duration-300">
                  <Upload size={26} className="text-blue-400/70 group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground group-hover:text-blue-300 transition-colors duration-300">
                    <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">CSV files only</p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className={`p-4 rounded-xl border ${
              result.created > 0
                ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20"
                : "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${
                  result.created > 0 ? "bg-green-500/15" : "bg-amber-500/15"
                } flex items-center justify-center shrink-0 mt-0.5`}>
                  {result.created > 0 ? (
                    <CheckCircle size={18} className="text-green-400" />
                  ) : (
                    <AlertCircle size={18} className="text-amber-400" />
                  )}
                </div>
                <div className="text-sm flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {result.created > 0
                      ? `Successfully imported ${result.created} records`
                      : "No records were imported"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-card border border-border">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
                      <p className="text-sm font-bold text-foreground">{result.total || "-"}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-card border border-green-500/20">
                      <span className="text-[10px] uppercase tracking-wider text-green-400">Created</span>
                      <p className="text-sm font-bold text-green-400">{result.created || 0}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-card border border-amber-500/20">
                      <span className="text-[10px] uppercase tracking-wider text-amber-400">Skipped</span>
                      <p className="text-sm font-bold text-amber-400">{result.skipped || 0}</p>
                    </div>
                  </div>
                  {result.errors?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium text-red-400 mb-2">Errors ({result.errors.length}):</p>
                      <div className="max-h-28 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] space-y-1">
                        {result.errors.slice(0, 5).map((e, i) => (
                          <p key={i} className="text-xs text-red-400/70">Row {e.row}: {e.reason}</p>
                        ))}
                        {result.errors.length > 5 && (
                          <p className="text-xs text-muted-foreground">...and {result.errors.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:bg-accent"
            >
              {result ? "Done" : "Cancel"}
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full sm:w-auto group relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(600px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.08)_0%,transparent_60%)]" />
              <span className="relative flex items-center gap-2 text-white">
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                )}
                {uploading ? "Uploading..." : "Upload File"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
