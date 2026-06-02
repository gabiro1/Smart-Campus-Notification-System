import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, UserPlus, Plus, Pencil, Trash2, X, Search, Save,
  CheckCircle2, XCircle, Mail, Phone, Calendar,
  LayoutGrid, List, MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../../../services/adminService";
import { format } from "date-fns";

const emptyForm = { name: "", email: "", phoneNumber: "" };

export default function HRAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phoneNumber: "", status: "ACTIVE" });
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => { fetchAccounts(); }, [page, search]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getHRAccounts(page, 20, search);
      setAccounts(res.data || []);
    } catch { toast.error("Failed to load HR accounts"); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error("Name and email are required");
    setSubmitting(true);
    try {
      await adminService.createHRAccount(form);
      toast.success("HR account created");
      setForm(emptyForm);
      setShowForm(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create");
    } finally { setSubmitting(false); }
  };

  const openEdit = (acc) => {
    setEditingId(acc._id);
    setEditForm({ name: acc.name, email: acc.email, phoneNumber: acc.phoneNumber || "", status: acc.status || "ACTIVE" });
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editForm.name || !editForm.email) return toast.error("Name and email are required");
    try {
      await adminService.updateHRAccount(editingId, editForm);
      toast.success("HR account updated");
      setEditModalOpen(false);
      setEditingId(null);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminService.deleteHRAccount(deleteConfirm._id);
      toast.success("HR account deleted");
      setDeleteConfirm(null);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">HR Account Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage Human Resources staff accounts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          {showForm ? <X size={16} /> : <UserPlus size={16} />}
          {showForm ? "Cancel" : "New HR Account"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6"
          >
            <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                <Shield size={16} className="text-blue-500" /> Create New HR Account
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Patrick Habimana" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="p.habimana@university.edu" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                  <input value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="+250 788 123 456" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg mb-4">
                <Mail size={14} />
                A setup email will be sent to the user with a link to set their password
              </div>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium">
                <Save size={14} /> {submitting ? "Creating..." : "Create HR Account"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search HR accounts by name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:text-foreground"}`}
            title="List view"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:text-foreground"}`}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === "list" ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {accounts.map(acc => (
                  <motion.tr key={acc._id} layout initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0">
                          {acc.name?.charAt(0) || "?"}
                        </div>
                        <span className="font-medium text-foreground">{acc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail size={12} /> {acc.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {acc.phoneNumber ? (
                        <div className="flex items-center gap-1.5"><Phone size={12} /> {acc.phoneNumber}</div>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {acc.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {acc.status || "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {acc.createdAt ? format(new Date(acc.createdAt), "MMM d, yyyy") : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(acc)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(acc)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {accounts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Shield size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No HR accounts found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {accounts.map(acc => (
              <motion.div
                key={acc._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-card rounded-xl border border-border hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
                <div className="relative p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                        {acc.name?.charAt(0) || "?"}
                      </div>
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${acc.status === "ACTIVE" ? "bg-green-500" : "bg-muted-foreground"}`} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(acc)}
                        className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(acc)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{acc.name}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{acc.email}</span>
                    </div>
                    {acc.phoneNumber && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone size={12} className="shrink-0" />
                        <span>{acc.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar size={12} className="shrink-0" />
                      <span>Created {acc.createdAt ? format(new Date(acc.createdAt), "MMM d, yyyy") : "-"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      acc.status === "ACTIVE"
                        ? "text-green-500 bg-green-500/10"
                        : "text-muted-foreground bg-muted"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${acc.status === "ACTIVE" ? "bg-green-500" : "bg-muted-foreground"}`} />
                      {acc.status === "ACTIVE" ? "Active" : acc.status || "Inactive"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">HR Staff</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {accounts.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Shield size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No HR accounts found</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {editModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">Edit HR Account</h2>
                <button onClick={() => setEditModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                  <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
                  <input value={editForm.phoneNumber} onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="DRAFT">Draft</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
                <button onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Delete HR Account</h3>
                  <p className="text-xs text-muted-foreground">
                    Delete "{deleteConfirm.name}" ({deleteConfirm.email})?
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
