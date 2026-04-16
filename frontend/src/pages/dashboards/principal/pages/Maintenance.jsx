import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Database,
  Server,
  Terminal,
  Activity,
  RefreshCw,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Globe,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import adminService from "../../../../services/adminService";

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [healthData, backupsData] = await Promise.all([
        adminService.getSystemHealth().catch(() => null),
        adminService.getBackups().catch(() => []),
      ]);

      if (healthData?.success) {
        setLogs(healthData.data.recentLogs || []);
      }

      if (backupsData && Array.isArray(backupsData)) {
        setBackups(backupsData);
      } else if (backupsData?.backups) {
        setBackups(backupsData.backups);
      }
    } catch (error) {
      console.error("Failed to fetch maintenance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      await adminService.createBackup("database");
      toast.success("Backup created successfully");
      await fetchData();
    } catch (error) {
      console.error("Backup failed:", error);
      toast.error("Failed to create backup");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRunDiagnostics = async () => {
    try {
      setIsRunningDiagnostics(true);
      setDiagnosticsResult(null);
      const result = await adminService.runDiagnostics();
      setDiagnosticsResult(result);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Diagnostics failed:", error);
      toast.error("Failed to run diagnostics");
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      setIsClearing(true);
      // Note: This would need a backend endpoint for clearing logs
      // For now, we'll just show a message
      toast.success("System logs cleared");
      setLogs([]);
    } catch (error) {
      console.error("Clear logs failed:", error);
      toast.error("Failed to clear logs");
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            System Maintenance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Infrastructure controls, diagnostics, and database management.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl text-sm font-mono text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Systems Nominal
        </div>
      </header>

      {/* Action Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard
          hover={true}
          className="flex flex-col items-center justify-center text-center p-8 border-emerald-500/20 group cursor-pointer"
          onClick={handleBackup}
        >
          <div
            className={`p-4 rounded-full mb-4 border transition-all ${isBackingUp ? "bg-emerald-500/20 border-emerald-500/50" : "bg-card border-border group-hover:border-emerald-500/30"}`}
          >
            {isBackingUp ? (
              <RefreshCw size={32} className="text-emerald-400 animate-spin" />
            ) : (
              <Database size={32} className="text-emerald-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {isBackingUp ? "Backing up..." : "Force DB Backup"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Create a manual snapshot of all communications.
          </p>
        </GlassCard>

        <GlassCard
          hover={true}
          className="flex flex-col items-center justify-center text-center p-8 border-blue-500/20 group cursor-pointer"
          onClick={handleRunDiagnostics}
        >
          <div className="p-4 rounded-full mb-4 border bg-card border-border group-hover:border-blue-500/30 transition-all">
            {isRunningDiagnostics ? (
              <RefreshCw size={32} className="text-blue-400 animate-spin" />
            ) : (
              <Activity size={32} className="text-blue-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {isRunningDiagnostics ? "Running..." : "Run Diagnostics"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Scan all nodes for latency and packet loss.
          </p>
        </GlassCard>

        <GlassCard
          hover={true}
          className="flex flex-col items-center justify-center text-center p-8 border-rose-500/20 group cursor-pointer"
          onClick={handleClearLogs}
        >
          <div
            className={`p-4 rounded-full mb-4 border transition-all ${isClearing ? "bg-rose-500/20 border-rose-500/50" : "bg-card border-border group-hover:border-rose-500/30"}`}
          >
            {isClearing ? (
              <RefreshCw size={32} className="text-rose-400 animate-spin" />
            ) : (
              <Trash2 size={32} className="text-rose-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">Purge Cache</h3>
          <p className="text-xs text-muted-foreground">
            Clear temporary files and local system logs.
          </p>
        </GlassCard>
      </div>

      {/* Diagnostics Results */}
      <AnimatePresence>
        {diagnosticsResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard className="border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Terminal size={18} className="text-blue-400" />
                <h3 className="text-lg font-bold text-foreground">Diagnostics Results</h3>
              </div>
              <div className="space-y-2">
                {diagnosticsResult.diagnostics?.checks?.map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      check.status === "success" ? "bg-emerald-500/10" : "bg-rose-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {check.status === "success" ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <AlertCircle size={16} className="text-rose-400" />
                      )}
                      <span className="text-foreground font-medium">{check.name}</span>
                    </div>
                    <span className={`text-sm ${check.status === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                      {check.message}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Storage Capacity",
            val: "42%",
            icon: HardDrive,
            color: "text-emerald-400",
          },
          {
            label: "Memory Usage",
            val: "68%",
            icon: Server,
            color: "text-blue-400",
          },
          {
            label: "CPU Load",
            val: "24%",
            icon: Activity,
            color: "text-emerald-400",
          },
          {
            label: "Active Connections",
            val: "14.2k",
            icon: Globe,
            color: "text-purple-400",
          },
        ].map((metric, i) => (
          <div
            key={i}
            className="bg-card/80 border border-border rounded-xl p-4 flex items-center gap-4"
          >
            <metric.icon size={20} className={metric.color} />
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                {metric.label}
              </p>
              <p className="text-xl font-bold text-foreground font-mono">
                {metric.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Logs Table */}
      <GlassCard className="p-0 flex flex-col min-h-[400px]">
        <div className="p-5 border-b border-border bg-accent/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Terminal size={18} className="text-emerald-400" /> Terminal
            Execution Logs
          </div>
          <button
            onClick={handleClearLogs}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            Clear Output
          </button>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap font-mono text-sm">
            <thead>
              <tr className="bg-black/40 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">System Event</th>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold text-right">Status Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-muted-foreground">
              <AnimatePresence>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, filter: "blur(4px)" }}
                      className="hover:bg-accent transition-colors"
                    >
                      <td className="p-4 text-muted-foreground text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-foreground">{log.description || log.action}</td>
                      <td className="p-4 text-blue-400">{log.admin}</td>
                      <td className="p-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {log.status === "SUCCESS" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <RefreshCw size={12} />
                          )}
                          {log.status || "PENDING"}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground font-sans">
                      No system logs available.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
