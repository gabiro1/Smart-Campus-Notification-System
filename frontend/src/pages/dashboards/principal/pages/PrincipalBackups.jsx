import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Database,
  Clock,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import adminService from "../../../../services/adminService";
import toast from "react-hot-toast";

export default function PrincipalBackups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBackups();
      setBackups(data.backups || []);
    } catch (error) {
      toast.error("Failed to load backups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <header className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          System Backups
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage system backup history.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard delay={0.1} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Database size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Total Backups</p>
              <p className="text-xl font-bold text-foreground">{backups.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Successful</p>
              <p className="text-xl font-bold text-foreground">
                {backups.filter(b => b.status === "Completed").length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wide">Latest</p>
              <p className="text-sm font-bold text-foreground">
                {backups[0] ? new Date(backups[0].createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Backup History Table */}
      <GlassCard padding="p-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Backup History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-b border-border">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Size</th>
                <th className="p-3">Created</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="animate-pulse h-4 bg-white/10 rounded w-32 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <Database size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No backups found.</p>
                  </td>
                </tr>
              ) : (
                backups.map((backup, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3">
                      <span className="font-medium text-foreground">{backup.type || "Full"}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">{backup.size || "N/A"}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {backup.createdAt ? new Date(backup.createdAt).toLocaleString() : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded border ${
                        backup.status === "Completed"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {backup.status || "Completed"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Download size={14} className="text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}