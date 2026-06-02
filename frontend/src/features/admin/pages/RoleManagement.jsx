import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Save,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../../../services/adminService";

const defaultDashboardOptions = [
  "read-only", "academic", "guild", "registrar",
  "hod", "dean", "hr", "principal", "admin",
];

const defaultPermissions = {
  canCreate: false,
  canApprove: false,
  dashboard: "read-only",
  emergencyOverride: false,
};

const emptyForm = {
  name: "",
  displayName: "",
  level: "",
  description: "",
  canCreate: false,
  canApprove: false,
  dashboard: "read-only",
  emergencyOverride: false,
};

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [dashboardOptions, setDashboardOptions] = useState(defaultDashboardOptions);
  const [showCustomDashboard, setShowCustomDashboard] = useState(false);
  const [customDashboardInput, setCustomDashboardInput] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRoles(1, 100, true);
      setRoles(res.data || []);
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingRole(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      level: String(role.level),
      description: role.description || "",
      canCreate: role.permissions?.canCreate || false,
      canApprove: role.permissions?.canApprove || false,
      dashboard: role.permissions?.dashboard || "read-only",
      emergencyOverride: role.permissions?.emergencyOverride || false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setFormData(emptyForm);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    if (!editingRole && !formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (!formData.level || isNaN(parseInt(formData.level))) {
      toast.error("A valid level number is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        displayName: formData.displayName.trim(),
        level: parseInt(formData.level),
        description: formData.description.trim(),
        permissions: {
          canCreate: formData.canCreate,
          canApprove: formData.canApprove,
          dashboard: formData.dashboard,
          emergencyOverride: formData.emergencyOverride,
        },
      };
      if (!editingRole) {
        payload.name = formData.name.trim().toLowerCase();
      }

      if (editingRole) {
        await adminService.updateRole(editingRole._id, payload);
        toast.success("Role updated");
      } else {
        await adminService.createRole(payload);
        toast.success("Role created");
      }
      closeModal();
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (role.isSystem) {
      toast.error("System roles cannot be deleted");
      return;
    }
    setDeleteConfirm(role);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminService.deleteRole(deleteConfirm._id);
      toast.success("Role deleted");
      setDeleteConfirm(null);
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete role");
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Role Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage user roles with custom permissions
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add Role
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Level</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Display Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Create</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Approve</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Emergency</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredRoles.map((role) => (
                  <motion.tr
                    key={role._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-500/10 text-blue-500 text-xs font-bold">
                        {role.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Shield size={14} className="text-blue-500 shrink-0" />
                        <span>{role.name}</span>
                        {role.isSystem && <Lock size={12} className="text-amber-500 shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{role.displayName}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {role.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {role.permissions?.canCreate ? (
                        <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                      ) : (
                        <XCircle size={16} className="text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {role.permissions?.canApprove ? (
                        <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                      ) : (
                        <XCircle size={16} className="text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {role.permissions?.emergencyOverride ? (
                        <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                      ) : (
                        <XCircle size={16} className="text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {role.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit role"
                        >
                          <Pencil size={14} />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDelete(role)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete role"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredRoles.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Shield size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No roles found</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">
                  {editingRole ? "Edit Role" : "Create Role"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {editingRole && editingRole.isSystem && (
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
                    <Lock size={12} />
                    System role — some fields are locked
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Role Key {!editingRole && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={!!editingRole}
                      placeholder="e.g. moderator"
                      className={`w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${editingRole ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleChange("displayName", e.target.value)}
                      placeholder="e.g. Moderator"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Hierarchy Level <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => handleChange("level", e.target.value)}
                    placeholder="e.g. 10"
                    min="0"
                    max="999"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Higher number = more privileges (admin=9, student=0)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Role description..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Permissions</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-foreground">Can Create Content</span>
                      <div
                        onClick={() => handleChange("canCreate", !formData.canCreate)}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${formData.canCreate ? "bg-blue-500" : "bg-muted"}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.canCreate ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-foreground">Can Approve Content</span>
                      <div
                        onClick={() => handleChange("canApprove", !formData.canApprove)}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${formData.canApprove ? "bg-blue-500" : "bg-muted"}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.canApprove ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-foreground">Emergency Override</span>
                      <div
                        onClick={() => handleChange("emergencyOverride", !formData.emergencyOverride)}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${formData.emergencyOverride ? "bg-blue-500" : "bg-muted"}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.emergencyOverride ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                    </label>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Dashboard Type
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={dashboardOptions.includes(formData.dashboard) ? formData.dashboard : "custom"}
                          onChange={(e) => {
                            if (e.target.value === "custom") {
                              setShowCustomDashboard(true);
                              setCustomDashboardInput("");
                            } else {
                              handleChange("dashboard", e.target.value);
                            }
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          {dashboardOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                          <option value="custom">+ Add custom...</option>
                        </select>
                        {!showCustomDashboard && (
                          <button
                            onClick={() => { setShowCustomDashboard(true); setCustomDashboardInput(""); }}
                            className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title="Add custom dashboard type"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                      {showCustomDashboard && (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={customDashboardInput}
                            onChange={(e) => setCustomDashboardInput(e.target.value)}
                            placeholder="Type new dashboard name..."
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              const val = customDashboardInput.trim();
                              if (val && !dashboardOptions.includes(val)) {
                                setDashboardOptions(prev => [...prev, val]);
                              }
                              if (val) {
                                handleChange("dashboard", val);
                              }
                              setShowCustomDashboard(false);
                              setCustomDashboardInput("");
                            }}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => { setShowCustomDashboard(false); setCustomDashboardInput(""); }}
                            className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? "Saving..." : editingRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Delete Role</h3>
                  <p className="text-xs text-muted-foreground">
                    Are you sure you want to delete "{deleteConfirm.displayName}"?
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                This action cannot be undone. Users assigned to this role must be reassigned first.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
