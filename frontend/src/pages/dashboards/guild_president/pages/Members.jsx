import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, UserCheck, Shield, Search, Loader2, AlertCircle,
  RefreshCw, Mail, ChevronRight, BadgeCheck
} from "lucide-react";
import GlassCard from "../../../../components/cards/GlassCard";
import StatCard from "../../../../components/cards/StatCard";
import LoadingCard from "../../../../components/feedback/LoadingCard";
import leadershipService from "../../../../services/studentLeadershipService";

function ErrorState({ onRetry }) {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <p className="text-lg font-semibold text-foreground">Failed to Load Members</p>
      <button onClick={onRetry} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm">
        <RefreshCw size={16} /> Retry
      </button>
    </GlassCard>
  );
}

const ROLES = [
  { key: "all", label: "All Members" },
  { key: "council", label: "Council" },
  { key: "class_rep", label: "Class Reps" },
];

export default function GuildMembers() {
  const [council, setCouncil] = useState(null);
  const [classReps, setClassReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [councilRes, repsRes] = await Promise.all([
        leadershipService.getActiveCouncil().catch(() => null),
        leadershipService.getAllClassReps().catch(() => []),
      ]);
      setCouncil(councilRes?.data || councilRes);
      const reps = repsRes?.data || repsRes?.classReps || repsRes || [];
      setClassReps(Array.isArray(reps) ? reps : []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-accent rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-accent rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => <LoadingCard key={i} />)}
        </div>
        <LoadingCard className="h-96" />
      </div>
    );
  }

  if (error) return <ErrorState onRetry={fetchData} />;

  const councilMembers = council?.positions || [];
  const activeReps = classReps.filter(r => r.status === "ACTIVE");
  const pendingReps = classReps.filter(r => r.status === "PENDING");

  const searchLower = search.toLowerCase();
  const filteredCouncil = councilMembers.filter(m =>
    m.userId?.name?.toLowerCase().includes(searchLower) ||
    m.title?.toLowerCase().includes(searchLower)
  );
  const filteredReps = activeReps.filter(r =>
    r.userId?.name?.toLowerCase().includes(searchLower) ||
    r.classId?.name?.toLowerCase().includes(searchLower)
  );

  const showCouncil = roleFilter === "all" || roleFilter === "council";
  const showReps = roleFilter === "all" || roleFilter === "class_rep";

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Members</h1>
        <p className="text-muted-foreground mt-1">View guild council members and class representatives</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Council Members" value={councilMembers.length} icon={Users} iconBgClass="bg-blue-500/10" iconClass="text-blue-500" />
        <StatCard title="Active Class Reps" value={activeReps.length} icon={UserCheck} iconBgClass="bg-emerald-500/10" iconClass="text-emerald-500" />
        <StatCard title="Pending Class Reps" value={pendingReps.length} icon={Shield} iconBgClass="bg-amber-500/10" iconClass="text-amber-500" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => setRoleFilter(r.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                roleFilter === r.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {showCouncil && councilMembers.length > 0 && (
        <GlassCard className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Guild Council</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCouncil.map((pos, i) => (
              <motion.div
                key={pos._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-accent/50 border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {pos.userId?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {pos.userId?.name || "Vacant Position"}
                  </p>
                  <p className="text-xs text-muted-foreground">{pos.title}</p>
                  {pos.userId?.email && (
                    <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                      {pos.userId.email}
                    </p>
                  )}
                </div>
                <BadgeCheck size={18} className="text-emerald-400 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {showReps && activeReps.length > 0 && (
        <GlassCard>
          <h2 className="text-lg font-semibold text-foreground mb-4">Active Class Representatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredReps.map((rep, i) => (
              <motion.div
                key={rep._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-accent/50 border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                  {rep.userId?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {rep.userId?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rep.classId?.name || "Class Rep"}
                  </p>
                  {rep.userId?.email && (
                    <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                      {rep.userId.email}
                    </p>
                  )}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Active
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {showCouncil && filteredCouncil.length === 0 && showReps && filteredReps.length === 0 && (
        <GlassCard className="flex flex-col items-center justify-center py-16 gap-4">
          <Users className="w-10 h-10 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">No Members Found</p>
          <p className="text-sm text-muted-foreground">
            {search ? "Try a different search term." : "No council members or class reps have been assigned yet."}
          </p>
        </GlassCard>
      )}
    </div>
  );
}
