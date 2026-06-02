import { useState } from "react";
import { AlertTriangle, Shield, UserCheck, UserX, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../../../services/adminService";

export default function EmergencyOverride() {
  const [action, setAction] = useState("ACTIVATE_USER");
  const [targetEmail, setTargetEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Reason is required for emergency override");
    if (!targetEmail.trim()) return toast.error("Target user email is required");

    setSubmitting(true);
    try {
      const usersRes = await adminService.getUsers(1, 1, { search: targetEmail });
      const user = usersRes?.users?.[0];
      if (!user) return toast.error("User not found");

      await adminService.runDiagnostics(); // Just to have the endpoint pattern
      
      const res = await fetch(`http://localhost:8000/api/admin/emergency-override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action,
          targetUserId: user._id,
          reason: reason.trim()
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(`Emergency override executed: ${action}`);
        setReason("");
        setTargetEmail("");
      } else {
        toast.error(data.message || "Override failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Emergency override failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-500/10 rounded-lg">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emergency Override</h1>
          <p className="text-sm text-muted-foreground">System administrator emergency controls - All actions are audited</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
        <p className="text-sm text-red-500 font-medium flex items-center gap-2">
          <AlertCircle size={16} /> Warning: Emergency overrides bypass standard approval workflows.
          Use only when normal processes cannot be followed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 max-w-xl space-y-4">
        <h2 className="font-semibold text-foreground">Execute Override</h2>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Override Action</label>
          <select value={action} onChange={e => setAction(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm">
            <option value="ACTIVATE_USER">Activate User</option>
            <option value="SUSPEND_USER">Suspend User</option>
            <option value="BYPASS_APPROVAL">Bypass Approval</option>
            <option value="OVERRIDE_ROLE">Override Role</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Target User Email</label>
          <input value={targetEmail} onChange={e => setTargetEmail(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-red-500"
            placeholder="user@university.edu" />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Reason *</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-red-500"
            placeholder="Explain why this emergency override is necessary..." />
        </div>

        <button type="submit" disabled={submitting || !reason.trim() || !targetEmail.trim()}
          className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium">
          <Shield size={16} /> {submitting ? "Executing..." : "Execute Emergency Override"}
        </button>
      </form>
    </div>
  );
}
