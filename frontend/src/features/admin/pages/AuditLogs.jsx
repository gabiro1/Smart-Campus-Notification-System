import { useState, useEffect } from "react";
import { Shield, Search, Filter } from "lucide-react";
import adminService from "../../../services/adminService";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const filters = actionFilter ? { action: actionFilter } : {};
      const res = await adminService.getAuditLogs(page, 20, filters);
      setLogs(res?.logs || []);
      setPagination(res?.pagination || null);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally { setLoading(false); }
  };

  const actions = [
    "", "CREATE_USER", "UPDATE_USER", "DELETE_USER", "PROMOTE_USER",
    "CREATE_STAFF_DRAFT", "SUBMIT_ROLE_ASSIGNMENT", "APPROVE_ROLE_ASSIGNMENT",
    "REJECT_ROLE_ASSIGNMENT", "ACTIVATE_ROLE", "CREATE_STUDENT_ACCOUNT",
    "CREATE_HR_ACCOUNT", "EMERGENCY_OVERRIDE", "LOGIN"
  ];

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('ACTIVATE')) return 'text-emerald-500';
    if (action.includes('DELETE') || action.includes('REJECT')) return 'text-red-500';
    if (action.includes('UPDATE') || action.includes('PROMOTE')) return 'text-blue-500';
    if (action.includes('SUBMIT') || action.includes('APPROVE')) return 'text-amber-500';
    if (action === 'EMERGENCY_OVERRIDE') return 'text-red-500 font-bold';
    return 'text-muted-foreground';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">System-wide immutable audit trail</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input placeholder="Search audit logs..." className="bg-transparent border-none outline-none text-foreground text-sm w-full" />
        </div>
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-blue-500">
          {actions.map(a => (
            <option key={a} value={a}>{a || 'All Actions'}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Admin</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Target Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-8"><div className="h-4 bg-muted rounded animate-pulse mx-auto max-w-md" /></td></tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Shield size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log._id || i} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${getActionColor(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{log.adminId?.name || log.adminId?.email || 'System'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{log.description}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{log.targetType || '\u2014'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>{log.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm bg-accent hover:bg-accent/80 disabled:opacity-50 rounded-lg">Previous</button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm bg-accent hover:bg-accent/80 disabled:opacity-50 rounded-lg">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
