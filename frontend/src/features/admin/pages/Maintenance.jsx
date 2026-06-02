import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Play,
  ShieldAlert,
  Activity,
  Server,
  Database,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import ThemedToaster from "../../../components/ui/ThemedToaster";
import adminService from "../../../services/adminService";

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logFilter, setLogFilter] = useState("all"); // 'all', 'error', 'security', 'api'

  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Fetch System Logs
  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      // Fallback dummy data if endpoint isn't ready yet, simulating a real server log
      const dummyLogs = [
        {
          id: 1,
          type: "security",
          message: "Failed login attempt from IP 192.168.1.45",
          timestamp: new Date(Date.now() - 1000 * 60).toISOString(),
        },
        {
          id: 2,
          type: "api",
          message: "GET /api/admin/users - 200 OK - 45ms",
          timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
        },
        {
          id: 3,
          type: "error",
          message: "SMS Gateway Timeout connecting to provider",
          timestamp: new Date(Date.now() - 1000 * 3600).toISOString(),
        },
        {
          id: 4,
          type: "api",
          message: "POST /api/events/parse-flyer - 200 OK - 1204ms",
          timestamp: new Date(Date.now() - 1000 * 7200).toISOString(),
        },
        {
          id: 5,
          type: "security",
          message: "JWT Token expired for user ID: 8945a...",
          timestamp: new Date(Date.now() - 1000 * 8400).toISOString(),
        },
      ];

      // Replace with your actual service call when ready:
      // const data = await adminService.getSystemLogs(logFilter);
      // setLogs(data.logs);

      setLogs(
        dummyLogs.filter(
          (log) => logFilter === "all" || log.type === logFilter,
        ),
      );
    } catch (error) {
      toast.error("Failed to fetch system logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [logFilter]);

  // Run Diagnostics
  const handleRunDiagnostics = async () => {
    setIsTesting(true);
    setTestResults(null);
    toast("Initiating system diagnostics...", { icon: "⚙️" });

    try {
      // Replace with actual service call:
      // const data = await adminService.runSystemTests();

      // Simulating a 2-second diagnostic test
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setTestResults({
        database: {
          status: "pass",
          latency: "12ms",
          message: "MongoDB connection stable",
        },
        smsGateway: {
          status: "warn",
          latency: "450ms",
          message: "High latency detected",
        },
        firebaseAuth: {
          status: "pass",
          latency: "45ms",
          message: "FCM connected",
        },
        geminiAI: {
          status: "pass",
          latency: "850ms",
          message: "OCR Vision model responding",
        },
      });
      toast.success("Diagnostics completed");
    } catch (error) {
      toast.error("Diagnostics failed to run");
    } finally {
      setIsTesting(false);
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case "error":
        return "text-red-400";
      case "security":
        return "text-amber-400";
      case "api":
        return "text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="p-4 lg:p-6 w-full text-foreground">
      <ThemedToaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Activity className="text-red-500" size={24} /> Maintenance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            System diagnostics, connection tests, and raw server logs.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleRunDiagnostics}
          disabled={isTesting}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isTesting ? (
            <Activity className="animate-spin" size={16} />
          ) : (
            <Play size={16} />
          )}
          Run Diagnostic
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left Column: Diagnostics Results */}
        <div className="space-y-5 lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-neutral-300">
              <Server size={22} className="text-blue-500" /> Service Health
            </h2>

            {!testResults && !isTesting ? (
              <div className="p-8 text-center border border-border border-dashed rounded-2xl bg-white/[0.02]">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                  Awaiting Test Execution
                </p>
              </div>
            ) : isTesting ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-accent rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-3">
                  <TestResultRow
                    label="MongoDB Cluster"
                    result={testResults.database}
                    icon={<Database size={16} />}
                  />
                  <TestResultRow
                    label="SMS Gateway"
                    result={testResults.smsGateway}
                    icon={<Activity size={16} />}
                  />
                  <TestResultRow
                    label="Firebase FCM"
                    result={testResults.firebaseAuth}
                    icon={<ShieldAlert size={16} />}
                  />
                  <TestResultRow
                    label="Gemini AI (OCR)"
                    result={testResults.geminiAI}
                    icon={<Server size={16} />}
                  />
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>

        {/* Right Column: Terminal Logs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-h-[500px]"
        >
          {/* Terminal Header */}
          <div className="bg-card p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-muted-foreground" />
              <span className="text-sm font-bold font-mono text-neutral-300">
                server_syslog.tail
              </span>
            </div>

            {/* Log Filters */}
            <div className="flex gap-2">
              {["all", "error", "security", "api"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    logFilter === filter
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-6 overflow-y-auto font-mono text-xs md:text-sm flex-1 custom-scrollbar">
            {loadingLogs ? (
              <p className="text-neutral-600 animate-pulse">
                Establishing secure connection to log stream...
              </p>
            ) : logs.length === 0 ? (
              <p className="text-neutral-600">
                No logs found for the selected filter.
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col md:flex-row md:gap-4 group hover:bg-white/[0.02] p-1 rounded transition-colors"
                  >
                    <span className="text-neutral-600 shrink-0">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      className={`w-20 shrink-0 uppercase tracking-widest font-bold ${getLogColor(log.type)}`}
                    >
                      {log.type}
                    </span>
                    <span className="text-neutral-300">{log.message}</span>
                  </div>
                ))}
                {/* Simulated Cursor */}
                <div className="w-2 h-4 bg-accent0 animate-pulse mt-4" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Sub-component for Diagnostic Results
function TestResultRow({ label, result, icon }) {
  const isPass = result.status === "pass";
  const isWarn = result.status === "warn";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 bg-white/[0.02] border border-border rounded-xl flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div
          className={`text-${isPass ? "green" : isWarn ? "amber" : "red"}-500`}
        >
          {isPass ? (
            <CheckCircle size={18} />
          ) : isWarn ? (
            <ShieldAlert size={18} />
          ) : (
            <XCircle size={18} />
          )}
        </div>
        <div>
          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
            {label}
          </h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            {result.message}
          </p>
        </div>
      </div>
      <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-1 rounded">
        {result.latency}
      </span>
    </motion.div>
  );
}
