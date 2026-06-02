import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import hrService from "../../../services/hrService";
import { TARGET_ROLE_LIST } from "../constants/hrStatus";

const INITIAL_STATE = {
  fullName: "",
  email: "",
  phoneNumber: "",
  targetRole: "lecturer",
};

export default function EditDraftModal({ open, onClose, draft, onSaved }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && draft) {
      setForm({
        fullName: draft.fullName || "",
        email: draft.email || "",
        phoneNumber: draft.phoneNumber || "",
        targetRole: draft.targetRole || "lecturer",
      });
      setError(null);
    }
  }, [open, draft]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft) return;

    setSaving(true);
    setError(null);

    try {
      await hrService.updateStaffDraft(draft._id, form);
      setSaving(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err.response?.data?.message || "Failed to update draft");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">Edit Staff Draft</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={handleChange("fullName")}
                required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="e.g. john@university.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange("phoneNumber")}
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="e.g. +256 700 000 000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Target Role</label>
              <select
                value={form.targetRole}
                onChange={handleChange("targetRole")}
                required
                className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none"
              >
                {TARGET_ROLE_LIST.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
