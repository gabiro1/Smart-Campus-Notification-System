import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Building2,
  Users,
  TrendingUp,
  Mail,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import adminService from "../../../../services/adminService";
import toast from "react-hot-toast";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"];

export default function PrincipalDepartments() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getEngagementByDepartment();
      setDepartments(res.departments || []);
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = departments.reduce((sum, d) => sum + (d.totalUsers || 0), 0);
  const avgReadRate = departments.length > 0
    ? Math.round(departments.reduce((sum, d) => sum + parseFloat(d.readRate || 0), 0) / departments.length)
    : 0;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <header className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Departments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of all academic departments and their performance.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <GlassCard delay={0.1} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Departments</p>
              <p className="text-xl font-bold text-foreground">{departments.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Total Users</p>
              <p className="text-xl font-bold text-foreground">{totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Avg Read Rate</p>
              <p className="text-xl font-bold text-foreground">{avgReadRate}%</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.25} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Notifications</p>
              <p className="text-xl font-bold text-foreground">
                {departments.reduce((sum, d) => sum + (d.notificationsSent || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <GlassCard key={i} delay={i * 0.05} className="p-5">
              <div className="animate-pulse h-20 bg-white/10 rounded" />
            </GlassCard>
          ))
        ) : departments.length === 0 ? (
          <GlassCard className="col-span-full p-12 text-center">
            <Building2 size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No departments found.</p>
          </GlassCard>
        ) : (
          departments.map((dept, idx) => (
            <GlassCard
              key={idx}
              delay={idx * 0.05}
              className="p-4 sm:p-5 cursor-pointer hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  >
                    {dept.department?.charAt(0) || "D"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{dept.department || "Unknown"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {dept.totalUsers?.toLocaleString() || 0} users
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <p className="text-lg font-bold text-foreground">{dept.totalUsers?.toLocaleString() || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Users</p>
                </div>
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <p className={`text-lg font-bold ${
                    parseFloat(dept.readRate) >= 70 ? "text-green-400" :
                    parseFloat(dept.readRate) >= 40 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {dept.readRate || 0}%
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">Read Rate</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Engagement</span>
                  <span className="font-medium">{dept.readRate || 0}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      parseFloat(dept.readRate) >= 70 ? "bg-green-500" :
                      parseFloat(dept.readRate) >= 40 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, dept.readRate || 0)}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className={`text-xs font-medium uppercase ${
                  dept.recommendations?.includes("High") ? "text-green-400" : "text-amber-400"
                }`}>
                  {dept.recommendations || "Normal"}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={10} />
                  {dept.eventsCreated || 0} events
                </span>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}