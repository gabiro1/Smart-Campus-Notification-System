import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, Users, Search, Loader2, AlertCircle, RefreshCw,
  Plus, X, CheckCircle2, Clock, FileText, Ban,
  ChevronRight, Mail, BookOpen, BadgeCheck
} from "lucide-react";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import leadershipService from "../../../../services/studentLeadershipService";
import apiClient from "../../../../services/apiClient";

function ErrorState({ onRetry }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-lg font-semibold text-foreground">Failed to Load Data</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm">
        <RefreshCw size={16} /> Retry
      </button>
    </GlassCard>
  );
}

const STATUS_OPTIONS = [
  { key: "all", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACTIVE", label: "Active" },
  { key: "REJECTED", label: "Rejected" },
];

export default function ClassRepProposals() {
  const [myProposals, setMyProposals] = useState([]);
  const [allClassReps, setAllClassReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showProposeForm, setShowProposeForm] = useState(false);

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ userId: "", classId: "", courseId: "", departmentId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [proposalsRes, repsRes] = await Promise.all([
        leadershipService.getMyProposals().catch(() => ({ data: [] })),
        leadershipService.getAllClassReps().catch(() => ({ data: [] })),
      ]);
      setMyProposals(proposalsRes?.data || proposalsRes?.classReps || proposalsRes || []);
      const reps = repsRes?.data || repsRes?.classReps || repsRes || [];
      setAllClassReps(Array.isArray(reps) ? reps : []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openProposeForm = async () => {
    setShowProposeForm(true);
    setSubmitError("");
    setSubmitSuccess("");
    setLoadingOptions(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        apiClient.get("/users/students").catch(() => ({ data: { data: [] } })),
        apiClient.get("/classes").catch(() => ({ data: { data: [] } })),
      ]);
      setStudents(studentsRes.data?.data || studentsRes.data || []);
      setClasses(classesRes.data?.data || classesRes.data || []);
    } catch (err) {
      setSubmitError("Could not load form options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.classId) {
      setSubmitError("Please select a student and a class");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await leadershipService.proposeClassRep({
        userId: formData.userId,
        classId: formData.classId,
        courseId: formData.courseId || undefined,
        departmentId: formData.departmentId || undefined,
      });
      setSubmitSuccess("Class rep proposed successfully! Waiting for HOD approval.");
      setFormData({ userId: "", classId: "", courseId: "", departmentId: "" });
      fetchData();
      setTimeout(() => setShowProposeForm(false), 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.response?.data?.error || "Failed to propose class rep");
    } finally {
      setSubmitting(false);
    }
  };

  const searchLower = search.toLowerCase();
  const allItems = [...allClassReps];
  const combined = allItems.map(item => ({
    ...item,
    isProposal: false,
  }));
  const myProposalIds = new Set(myProposals.map(p => p._id));
  const displayed = statusFilter === "all"
    ? combined
    : combined.filter(r => r.status === statusFilter);

  const filtered = displayed.filter(r =>
    r.userId?.name?.toLowerCase().includes(searchLower) ||
    r.classId?.name?.toLowerCase().includes(searchLower)
  );

  const pendingCount = allClassReps.filter(r => r.status === "PENDING").length;
  const activeCount = allClassReps.filter(r => r.status === "ACTIVE").length;
  const myPendingCount = myProposals.filter(r => r.status === "PENDING").length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-56 bg-accent rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-72 bg-accent rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => <LoadingCard key={i} />)}
        </div>
        <LoadingCard className="h-96" />
      </div>
    );
  }

  if (error) return <ErrorState onRetry={fetchData} />;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Class Rep Proposals</h1>
            <p className="text-muted-foreground mt-1">Propose and manage class representatives</p>
          </div>
          <button
            onClick={openProposeForm}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Propose Class Rep
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="My Proposals" value={myProposals.length} icon={FileText} iconBgClass="bg-blue-500/10" iconClass="text-blue-500" />
        <StatCard title="Pending Approval" value={pendingCount} icon={Clock} iconBgClass="bg-amber-500/10" iconClass="text-amber-500" />
        <StatCard title="Active Class Reps" value={activeCount} icon={BadgeCheck} iconBgClass="bg-emerald-500/10" iconClass="text-emerald-500" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or class..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === s.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showProposeForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Propose New Class Representative</h2>
                <button
                  onClick={() => setShowProposeForm(false)}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {submitSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {submitSuccess}
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {submitError}
                </div>
              )}

              {loadingOptions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={handlePropose} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Student</label>
                    <select
                      value={formData.userId}
                      onChange={e => setFormData(f => ({ ...f, userId: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">Select a student...</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} ({s.email || s.registrationNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Class</label>
                    <select
                      value={formData.classId}
                      onChange={e => setFormData(f => ({ ...f, classId: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">Select a class...</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm disabled:opacity-60"
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {submitting ? "Proposing..." : "Propose"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProposeForm(false)}
                      className="px-6 py-2.5 rounded-xl bg-accent text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {statusFilter === "all" ? "All Class Representatives" : `${statusFilter} Class Representatives`}
        </h2>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Users className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {search ? "No results match your search." : "No class representatives found."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((rep, i) => (
              <motion.div
                key={rep._id || i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-accent/30 border border-border hover:bg-accent/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm ${
                  rep.status === "ACTIVE" ? "from-emerald-500 to-teal-600" :
                  rep.status === "PENDING" ? "from-amber-500 to-orange-600" :
                  "from-red-500 to-rose-600"
                }`}>
                  {rep.userId?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {rep.userId?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rep.classId?.name || "Class"}
                    {rep.departmentId?.name ? ` - ${rep.departmentId.name}` : ""}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${
                  rep.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  rep.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  rep.status === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-muted text-muted-foreground border-border"
                }`}>
                  {rep.status || "UNKNOWN"}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
