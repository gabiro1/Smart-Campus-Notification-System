import GlassCard from "./GlassCard";
import { Terminal, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LogViewer({ logs, onClear, height = "h-[400px]" }) {
  return (
    <GlassCard className={`p-0 flex flex-col ${height}`}>
      <div className="p-4 border-b border-border bg-background flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <Terminal size={16} className="text-emerald-400" /> System Terminal
        </div>
        <button
          onClick={onClear}
          className="text-xs font-bold text-muted-foreground hover:text-rose-400 transition-colors flex items-center gap-1"
        >
          <Trash2 size={12} /> Purge
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-4 bg-[#020202] font-mono text-xs custom-scrollbar">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="mb-2 border-l-2 border-border pl-3 py-1"
            >
              <span className="text-muted-foreground">[{log.timestamp}]</span>{" "}
              <span
                className={
                  log.type === "error"
                    ? "text-rose-400"
                    : log.type === "warning"
                      ? "text-amber-400"
                      : "text-emerald-400"
                }
              >
                {log.prefix}
              </span>{" "}
              <span className="text-muted-foreground">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
          <div className="text-muted-foreground animate-pulse">
            _ Waiting for system events...
          </div>
        )}
      </div>
    </GlassCard>
  );
}
