import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Search,
  Filter,
  Shield,
  Edit,
  Ban,
  Check,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import adminService from "../../../../services/adminService";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [processingId, setProcessingId] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: "", status: "" });

  useEffect(() => {
    fetchExecutiveUsers();
  }, []);

  const fetchExecutiveUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(1, 100, {}, true);
      const allUsers = data.users || [];
      
      const executiveRoles = ['admin', 'principal', 'dean', 'hod'];
      const executiveUsers = allUsers.filter(
        user => executiveRoles.includes(user.role?.toLowerCase())
      );
      
      setUsers(executiveUsers);
    } catch (error) {
      console.error("Failed to fetch executive users:", error);
      toast.error("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleEditOpen = (user) => {
    setEditingUser(user);
    setEditForm({ 
      role: user.role, 
      status: user.isActive !== false ? "Active" : "Suspended" 
    });
  };

  const handleSave = async () => {
    try {
      setProcessingId(editingUser._id);
      await adminService.updateUser(editingUser._id, { 
        role: editForm.role,
        isActive: editForm.status === "Active"
      });
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchExecutiveUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleSuspend = async (user) => {
    try {
      setProcessingId(user._id);
      const newStatus = user.isActive !== false;
      await adminService.updateUser(user._id, { isActive: !newStatus });
      toast.success(newStatus ? "User suspended" : "User activated");
      fetchExecutiveUsers();
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: "System Admin",
      principal: "Principal",
      dean: "Dean",
      hod: "HoD",
    };
    return labels[role?.toLowerCase()] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Admin Control Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage executive roles, access tiers, and global permissions.
          </p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2">
          <Plus size={16} /> Provision New Admin
        </button>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 md:p-5 border-b border-border bg-accent/50 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin users..."
              className="w-full bg-black/40 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-black/40 border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground focus:outline-none focus:border-emerald-500/50 appearance-none"
            >
              <option value="All">All Admin Roles</option>
              <option value="dean">Deans</option>
              <option value="hod">Heads of Department</option>
              <option value="admin">System Admins</option>
              <option value="principal">Principal</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 w-full bg-accent border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-accent border-b border-border text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="p-5 font-semibold">Administrator</th>
                <th className="p-5 font-semibold">Access Role</th>
                <th className="p-5 font-semibold">Domain / Dept</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No executive users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-accent transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-accent rounded-md border border-border text-muted-foreground">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-muted-foreground">
                      {user.department || user.school || user.college || '-'}
                    </td>
                    <td className="p-5">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-bold ${user.isActive !== false ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? "bg-emerald-400" : "bg-rose-400"}`}
                        />
                        {user.isActive !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditOpen(user)}
                          className="p-1.5 text-muted-foreground hover:text-foreground bg-accent hover:bg-accent rounded-md transition-all"
                          title="Edit Permissions"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => toggleSuspend(user)}
                          disabled={processingId === user._id}
                          className={`p-1.5 rounded-md transition-all ${user.isActive !== false ? "text-muted-foreground bg-accent hover:text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10 hover:text-emerald-300"}`}
                          title={
                            user.isActive !== false
                              ? "Suspend Account"
                              : "Reactivate"
                          }
                        >
                          {processingId === user._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : user.isActive !== false ? (
                            <Ban size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-foreground">Modify Access</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Target User
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.name}
                    className="w-full bg-black/20 border border-border rounded-xl px-4 py-2.5 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    System Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="dean">Dean</option>
                    <option value="hod">Head of Department</option>
                    <option value="admin">System Admin</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={processingId === editingUser._id}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-foreground rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {processingId === editingUser._id && <Loader2 size={14} className="animate-spin" />}
                  Update Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
