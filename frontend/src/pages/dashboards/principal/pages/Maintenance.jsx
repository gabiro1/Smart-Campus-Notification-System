import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Database,
  Server,
  Terminal,
  Activity,
  RefreshCw,
  Trash2,
  HardDrive,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialLogs = [
  {
    id: 1,
    event: "System Diagnostics Run",
    status: "Success",
    time: "10 mins ago",
    node: "Core-01",
  },
  {
    id: 2,
    event: "Cache Purge",
    status: "Success",
    time: "2 hours ago",
    node: "Edge-DB",
  },
  {
    id: 3,
    event: "Scheduled Backup",
    status: "Warning",
    time: "Yesterday, 03:00 AM",
    node: "Main-DB",
  },
  {
    id: 4,
    event: "SSL Certificate Renewed",
    status: "Success",
    time: "Oct 20, 2026",
    node: "Auth-01",
  },
];

export default function Maintenance() {
  const [logs, setLogs] = useState(initialLogs);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const newLog = {
        id: Date.now(),
        event: "Manual Database Backup",
        status: "Success",
        time: "Just now",
        node: "Main-DB",
      };
      setLogs([newLog, ...logs]);
    }, 3000);
  };

  const handleClearLogs = () => {
    setIsClearing(true);
    setTimeout(() => {
      setLogs([]);
      setIsClearing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            System Maintenance
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Infrastructure controls, diagnostics, and database management.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-white/10 px-4 py-2 rounded-xl text-sm font-mono text-emerald-400">
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
            className={`p-4 rounded-full mb-4 border transition-all ${isBackingUp ? "bg-emerald-500/20 border-emerald-500/50" : "bg-[#111] border-white/10 group-hover:border-emerald-500/30"}`}
          >
            <Database
              size={32}
              className={`text-emerald-400 ${isBackingUp ? "animate-bounce" : ""}`}
            />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {isBackingUp ? "Backing up..." : "Force DB Backup"}
          </h3>
          <p className="text-xs text-neutral-500">
            Create a manual snapshot of all communications.
          </p>
        </GlassCard>

        <GlassCard
          hover={true}
          className="flex flex-col items-center justify-center text-center p-8 border-blue-500/20 group cursor-pointer"
        >
          <div className="p-4 rounded-full mb-4 border bg-[#111] border-white/10 group-hover:border-blue-500/30 transition-all">
            <Activity size={32} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Run Diagnostics</h3>
          <p className="text-xs text-neutral-500">
            Scan all nodes for latency and packet loss.
          </p>
        </GlassCard>

        <GlassCard
          hover={true}
          className="flex flex-col items-center justify-center text-center p-8 border-rose-500/20 group cursor-pointer"
          onClick={handleClearLogs}
        >
          <div
            className={`p-4 rounded-full mb-4 border transition-all ${isClearing ? "bg-rose-500/20 border-rose-500/50" : "bg-[#111] border-white/10 group-hover:border-rose-500/30"}`}
          >
            {isClearing ? (
              <RefreshCw size={32} className="text-rose-400 animate-spin" />
            ) : (
              <Trash2 size={32} className="text-rose-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Purge Cache</h3>
          <p className="text-xs text-neutral-500">
            Clear temporary files and local system logs.
          </p>
        </GlassCard>
      </div>

      {/* Server Health Overview */}
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
            className="bg-[#111]/80 border border-white/5 rounded-xl p-4 flex items-center gap-4"
          >
            <metric.icon size={20} className={metric.color} />
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                {metric.label}
              </p>
              <p className="text-xl font-bold text-white font-mono">
                {metric.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Logs Table */}
      <GlassCard className="p-0 flex flex-col min-h-[400px]">
        <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
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
              <tr className="bg-black/40 border-b border-white/5 text-[10px] uppercase tracking-widest text-neutral-600">
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">System Event</th>
                <th className="p-4 font-bold">Target Node</th>
                <th className="p-4 font-bold text-right">Status Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-neutral-500 text-xs">{log.time}</td>
                    <td className="p-4 font-bold text-white">{log.event}</td>
                    <td className="p-4 text-blue-400">{log.node}</td>
                    <td className="p-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${
                          log.status === "Success"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {log.status === "Success" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <RefreshCw size={12} />
                        )}
                        {log.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-neutral-600 font-sans"
                  >
                    System logs have been purged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
