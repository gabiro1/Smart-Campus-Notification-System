import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  ShieldCheck,
  Search,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import adminService from "../../../../services/adminService";
import toast from "react-hot-toast";

const ACTION_ICONS = {
  CREATE_USER: <User size={14} />,
  UPDATE_USER: <User size={14} />,
  DELETE_USER: <User size={14} />,
  PROMOTE_USER: <User size={14} />,
  CREATE_EVENT: <FileText size={14} />,
  UPDATE_EVENT: <FileText size={14} />,
  DELETE_EVENT: <FileText size={14} />,
  CREATE_ANNOUNCEMENT: <FileText size={14} />,
  UPDATE_ANNOUNCEMENT: <FileText size={14} />,
  DELETE_ANNOUNCEMENT: <FileText size={14} />,
  BROADCAST_MESSAGE: <FileText size={14} />,
  LOGIN: <User size={14} />,
  LOGOUT: <User size={14} />,
};

export default function PrincipalAudit() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, searchQuery]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchQuery) filters.adminId = searchQuery;
      if (actionFilter) filters.action = actionFilter;

      const res = await adminService.getAuditLogs(page, 15, filters);
      setLogs(res.logs || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch (error) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const actionOptions = [
    "CREATE_USER", "UPDATE_USER", "DELETE_USER", "PROMOTE_USER",
    "CREATE_EVENT", "DELETE_EVENT", "CREATE_ANNOUNCEMENT",
    "LOGIN", "LOGOUT"
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <header className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all system activities and administrative actions.
        </p>
      </header>

      {/* Filters */}
      <GlassCard padding="p-0">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by admin..."
                className="w-full bg-accent border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-accent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Actions</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>{action.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button
            onClick={() => { setActionFilter(""); setSearchQuery(""); }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-lg text-sm font-medium transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] uppercase font-black text-muted-foreground tracking-widest border-b border-border">
              <tr>
                <th className="p-3 w-40">Timestamp</th>
                <th className="p-3">Admin</th>
                <th className="p-3">Action</th>
                <th className="p-3 w-32">Details</th>
                <th className="p-3 w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="animate-pulse h-4 bg-white/10 rounded w-32 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No audit logs found.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                          {log.adminId?.name?.charAt(0) || "S"}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {log.adminId?.name || "System"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${
                          log.action?.includes("DELETE") ? "bg-red-500/10 text-red-400" :
                          log.action?.includes("CREATE") ? "bg-green-500/10 text-green-400" :
                          log.action?.includes("LOGIN") ? "bg-blue-500/10 text-blue-400" :
                          "bg-amber-500/10 text-amber-400"
                        }`}>
                          {ACTION_ICONS[log.action] || <FileText size={14} />}
                        </span>
                        <span className="text-xs font-medium">
                          {log.action?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 w-32">
                      <p className="text-xs text-muted-foreground truncate">{log.description}</p>
                    </td>
                    <td className="p-3 w-20">
                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded border ${
                        log.status === "SUCCESS"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        <CheckCircle size={10} className="inline mr-1" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-accent hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-accent hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}