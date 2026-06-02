import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  HardDrive,
  Clock,
  CloudLightning,
  DownloadCloud,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Save,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import ThemedToaster from "../../../components/ui/ThemedToaster";
import adminService from "../../../services/adminService";

export default function Backups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action States
  const [isCreating, setIsCreating] = useState(false);
  const [backupType, setBackupType] = useState("Database"); // Database, Media, Full
  const [restoringId, setRestoringId] = useState(null);

  // Automated Schedule State
  const [autoBackup, setAutoBackup] = useState(true);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBackups();
      setBackups(data);
    } catch (error) {
      toast.error("Failed to load backup history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    toast("Compressing data and securing snapshot...", { icon: "📦" });
    try {
      await adminService.createBackup(backupType);
      toast.success(`${backupType} Snapshot Secured`);

      // Add new backup to UI locally for demonstration
      const newBackup = {
        id: `bk-new-${Math.floor(Math.random() * 1000)}`,
        type: backupType,
        size: backupType === "Database" ? "145 MB" : "1.3 GB",
        date: new Date().toISOString(),
        status: "Completed",
      };
      setBackups([newBackup, ...backups]);
    } catch (error) {
      toast.error("Backup creation failed.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (id, type, date) => {
    if (
      !window.confirm(
        `CRITICAL WARNING: Are you sure you want to restore the ${type} from ${new Date(date).toLocaleDateString()}? This will overwrite all current system data and CANNOT be undone.`,
      )
    )
      return;

    setRestoringId(id);
    toast.loading("Restoring system state. Do not close this window...", {
      id: "restore",
    });

    try {
      await adminService.restoreBackup(id);
      toast.success("System restored successfully. Please refresh the page.", {
        id: "restore",
      });
    } catch (error) {
      toast.error("Restoration failed. Contact DevOps immediately.", {
        id: "restore",
      });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 lg:p-12">
      <ThemedToaster />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Database className="text-blue-500" size={36} /> Data Protection
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage system snapshots, automated backups, and disaster recovery.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Backup Controls */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create Backup Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[24px] p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Save size={22} className="text-blue-500" /> Manual Snapshot
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                  Payload Type
                </label>
                <select
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value)}
                  disabled={isCreating}
                  className="w-full bg-card border border-border rounded-xl py-4 px-4 focus:border-blue-500 outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="Database">MongoDB (Database Only)</option>
                  <option value="Media Assets">
                    Cloud Storage (Media Only)
                  </option>
                  <option value="Full System">
                    Full System (DB + Media + Configs)
                  </option>
                </select>
              </div>

              <button
                onClick={handleCreateBackup}
                disabled={isCreating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-foreground p-4 rounded-xl font-black tracking-widest uppercase text-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />{" "}
                    Compressing...
                  </>
                ) : (
                  <>
                    <CloudLightning size={18} /> Secure Backup Now
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Automated Schedule Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-[24px] p-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
                <Clock size={22} className="text-purple-500" /> Auto-Schedule
              </h2>
              <ToggleSwitch
                isOn={autoBackup}
                onToggle={() => setAutoBackup(!autoBackup)}
              />
            </div>

            <div
              className={`transition-opacity ${autoBackup ? "opacity-100" : "opacity-40 pointer-events-none"}`}
            >
              <div className="p-4 bg-accent border border-border rounded-xl space-y-2 mb-4">
                <p className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Next Scheduled Run
                </p>
                <p className="text-2xl font-black text-purple-400">03:00 AM</p>
                <p className="text-[10px] text-muted-foreground">
                  Frequency: Daily (Database Only)
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Automated backups are retained for 30 days before being purged.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Backup History & Restore */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-[24px] overflow-hidden shadow-2xl h-full flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center gap-3 bg-accent">
              <HardDrive className="text-green-500" size={20} />
              <h3 className="text-lg font-bold text-foreground">
                Recovery Vault
              </h3>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Decrypting Vault...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-accent text-[10px] uppercase font-black text-muted-foreground tracking-widest border-b border-border">
                    <tr>
                      <th className="p-6">Snapshot Detail</th>
                      <th className="p-6">Size</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Disaster Recovery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <AnimatePresence>
                      {backups.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-8 text-center text-muted-foreground"
                          >
                            No backups found in vault.
                          </td>
                        </tr>
                      ) : (
                        backups.map((backup) => (
                          <motion.tr
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={backup.id}
                            className="hover:bg-accent transition-colors group"
                          >
                            <td className="p-6">
                              <div className="font-bold text-foreground text-sm">
                                {backup.type}
                              </div>
                                <div className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
                                {new Date(backup.date).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-6">
                              <span className="text-sm font-mono text-foreground bg-accent px-2 py-1 rounded-md">
                                {backup.size}
                              </span>
                            </td>
                            <td className="p-6">
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 rounded-md w-max border border-green-500/20">
                                <CheckCircle size={12} /> {backup.status}
                              </span>
                            </td>
                            <td className="p-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="p-2.5 bg-accent hover:bg-accent text-blue-400 rounded-xl transition-all"
                                  title="Download Backup locally"
                                >
                                  <DownloadCloud size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRestore(
                                      backup.id,
                                      backup.type,
                                      backup.date,
                                    )
                                  }
                                  disabled={restoringId !== null}
                                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 border border-red-500/20"
                                >
                                  {restoringId === backup.id ? (
                                    <RefreshCw
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <ShieldAlert size={14} />
                                  )}
                                  Restore
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-4 border-t border-border bg-red-500/[0.02] flex items-start gap-3">
              <AlertTriangle
                className="text-red-500 shrink-0 mt-0.5"
                size={16}
              />
              <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest leading-relaxed">
                Warning: Restoring a database snapshot will permanently
                overwrite all active users, events, and audit logs created after
                the snapshot date.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Reusable Custom Toggle Switch
function ToggleSwitch({ isOn, onToggle }) {
  return (
    <div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isOn ? "bg-purple-600" : "bg-neutral-700"}`}
      onClick={onToggle}
    >
        <motion.div
          className="bg-foreground w-4 h-4 rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        animate={{ x: isOn ? 24 : 0 }}
      />
    </div>
  );
}
