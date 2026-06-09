import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  Mail,
  Phone,
  Calendar,
  Building,
  GraduationCap,
  Save,
  Shield,
  Users,
  Eye,
  EyeOff,
  Bell,
  Award,
  Clock,
  MoreVertical,
  Filter,
  LayoutGrid,
  List,
  UserPlus,
  UserMinus,
  AlertCircle,
  KeyRound,
  Upload,
  Hash,
  BadgeCheck,
} from "lucide-react";
import GlassCard from "@/components/cards/GlassCard";
import adminService from "../../../services/adminService";
import BulkUploadModal from "../../../shared/BulkUploadModal";
import toast from "react-hot-toast";

const ROLE_COLORS = [
  { color: "text-blue-400", bg: "bg-blue-500/15" },
  { color: "text-green-400", bg: "bg-green-500/15" },
  { color: "text-purple-400", bg: "bg-purple-500/15" },
  { color: "text-amber-400", bg: "bg-amber-500/15" },
  { color: "text-cyan-400", bg: "bg-cyan-500/15" },
  { color: "text-red-400", bg: "bg-red-500/15" },
  { color: "text-pink-400", bg: "bg-pink-500/15" },
  { color: "text-teal-400", bg: "bg-teal-500/15" },
  { color: "text-indigo-400", bg: "bg-indigo-500/15" },
  { color: "text-orange-400", bg: "bg-orange-500/15" },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: "", email: "", phoneNumber: "", role: "student", school: "", department: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [allRoles, setAllRoles] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const getRoleInfo = useCallback((roleName) => {
    const idx = allRoles.findIndex(r => r.name === roleName);
    if (idx === -1) return { label: roleName || 'Unknown', color: "text-gray-400", bg: "bg-gray-500/15" };
    const colors = ROLE_COLORS[idx % ROLE_COLORS.length];
    return { label: allRoles[idx].displayName || roleName, ...colors };
  }, [allRoles]);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await adminService.getRoles(1, 200, true);
      if (data?.data) setAllRoles(data.data);
    } catch { /* roles fetch non-critical */ }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (roleFilter !== "all") filters.role = roleFilter;

      const data = await adminService.getUsers(page, 12, filters);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(delay);
  }, [search, roleFilter, page]);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(userId);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleCreateUser = async () => {
    setIsCreating(true);
    try {
      await adminService.createUser(newUserData);
      toast.success("User created successfully");
      setShowNewUserModal(false);
      setNewUserData({ name: "", email: "", phoneNumber: "", role: "student", school: "", department: "" });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleView = async (user) => {
    try {
      const res = await adminService.getUser(user._id || user.id);
      const detailUser = res?.user || res;
      const detailStats = res?.stats;
      const merged = { ...user, ...detailUser, stats: detailStats };
      const isObjectId = (v) => typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v);
      if (isObjectId(merged.school)) merged.school = user.school;
      if (isObjectId(merged.department)) merged.department = user.department;
      setSelectedUser(merged);
      setShowModal(true);
      if (isEditMode) {
        setEditData({
          name: detailUser.name || user.name,
          email: detailUser.email || user.email,
          phoneNumber: detailUser.phoneNumber || user.phoneNumber || "",
          role: detailUser.role || user.role || "student",
          school: user.school || "",
          department: user.department || "",
        });
      }
    } catch {
      toast.error("Failed to load user details");
    }
  };

  const handleEditToggle = () => {
    if (!isEditMode && selectedUser) {
      setEditData({
        name: selectedUser.name,
        email: selectedUser.email,
        phoneNumber: selectedUser.phoneNumber || "",
        role: selectedUser.role,
        school: selectedUser.school || "",
        department: selectedUser.department || "",
        registrationNumber: selectedUser.registrationNumber || "",
        studentID: selectedUser.studentID || "",
        level: selectedUser.level || "",
        status: selectedUser.status || "ACTIVE",
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    try {
      await adminService.updateUser(selectedUser._id || selectedUser.id, editData);
      toast.success("User updated");
      fetchUsers();
      setIsEditMode(false);
      const res = await adminService.getUser(selectedUser._id || selectedUser.id);
      const detailUser = res?.user || res;
      const detailStats = res?.stats;
      setSelectedUser({ ...selectedUser, ...detailUser, stats: detailStats });
    } catch {
      toast.error("Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || resetPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (resetPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsResetting(true);
    try {
      await adminService.resetUserPassword(selectedUser._id || selectedUser.id, resetPassword);
      toast.success("Password reset successfully");
      setShowResetPassword(false);
      setResetPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  const roleStats = useMemo(() => {
    const stats = { total: users.length };
    allRoles.forEach(role => {
      stats[role.name] = users.filter(u => u.role === role.name).length;
    });
    return stats;
  }, [users, allRoles]);

  return (
    <div className="p-4 lg:p-6 w-full text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Shield className="text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Access Control</h1>
              <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBulkUpload(true)}
              className="group relative px-5 py-3 rounded-xl font-medium flex items-center gap-2.5 transition-all duration-300 overflow-hidden border border-blue-500/20 hover:border-blue-500/40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-blue-300 hover:text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.08)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            >
              <Upload size={16} className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
              <span className="hidden sm:inline">Import CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewUserModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Add User</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: roleStats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/15" },
            { label: "Students", value: roleStats.student, icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-500/15" },
            { label: "Lecturers", value: roleStats.lecturer, icon: Award, color: "text-green-400", bg: "bg-green-500/15" },
            { label: "Admins", value: (roleStats.admin || 0) + (roleStats.principal || 0) + (roleStats.dean || 0) + (roleStats.hod || 0), icon: Shield, color: "text-purple-400", bg: "bg-purple-500/15" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none whitespace-nowrap"
        >
          <option value="all">All Roles</option>
          {allRoles.map(r => (
            <option key={r.name} value={r.name}>{r.displayName || r.name}</option>
          ))}
        </select>

        <div className="flex bg-card border border-border rounded-xl overflow-hidden shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 ${viewMode === "grid" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-3 ${viewMode === "list" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List size={18} />
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-accent mb-4" />
              <div className="h-4 bg-accent rounded w-2/3 mb-2" />
              <div className="h-3 bg-accent rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Users Found</h3>
          <p className="text-muted-foreground">Adjust your filters or add a new user.</p>
        </GlassCard>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {users.map((user, i) => {
              const roleInfo = getRoleInfo(user.role);
              return (
                <motion.div
                  key={user._id || user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleView(user)}
                  className="group bg-card border border-border rounded-2xl p-5 hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleView(user)} className="p-2 rounded-lg hover:bg-accent"><Eye size={14} /></button>
                      <button onClick={() => { const u = user; setSelectedUser(u); setShowModal(true); setIsEditMode(true); const d = { name: u.name, email: u.email, phoneNumber: u.phoneNumber || "", role: u.role || "student", school: u.school || "", department: u.department || "" }; setEditData(d); }} className="p-2 rounded-lg hover:bg-accent"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(user._id || user.id, user.name)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1 truncate">{user.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 truncate">{user.email}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${roleInfo.bg} ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-emerald-400">Active</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <GlassCard padding="p-0" className="min-w-0">
            <table className="w-full">
              <thead className="bg-card border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">School/Dept</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-transparent">
              <AnimatePresence>
                {users.map((user, i) => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <motion.tr
                      key={user._id || user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleView(user)}
                      className="hover:bg-accent/30 transition-all duration-200 cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                            {user.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.phoneNumber || "No phone"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground truncate max-w-[200px]">{user.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${roleInfo.bg} ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{user.school || "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.department || "No dept"}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs text-emerald-400">Active</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleView(user)} className="p-2 rounded-lg hover:bg-accent"><Eye size={16} /></button>
                          <button onClick={() => { const u = user; setSelectedUser(u); setShowModal(true); setIsEditMode(true); const d = { name: u.name, email: u.email, phoneNumber: u.phoneNumber || "", role: u.role || "student", school: u.school || "", department: u.department || "" }; setEditData(d); }} className="p-2 rounded-lg hover:bg-accent"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(user._id || user.id, user.name)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </GlassCard>
          </div>
        )}

      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <span className="text-sm text-muted-foreground order-2 sm:order-1">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-3 bg-card border border-border rounded-xl hover:bg-accent disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-3 bg-card border border-border rounded-xl hover:bg-accent disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-12 sm:pt-16 p-2 sm:p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg p-4 sm:p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-bold text-foreground">User Details</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 border border-border hover:border-blue-500/30 transition-all group"
                >
                  <X size={18} className="text-muted-foreground group-hover:text-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl sm:text-2xl">
                  {selectedUser.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground truncate">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {selectedUser.role && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {selectedUser.role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                )}
                {selectedUser.status && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    selectedUser.status === "ACTIVE" ? "bg-green-500/15 text-green-400 border-green-500/30" :
                    selectedUser.status === "PENDING" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                    selectedUser.status === "SUSPENDED" ? "bg-red-500/15 text-red-400 border-red-500/30" :
                    "bg-muted text-muted-foreground border-border"
                  }`}>
                    {selectedUser.status}
                  </span>
                )}
                {selectedUser.emailVerified && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Phone size={14} />
                    <span className="text-xs uppercase">Phone</span>
                  </div>
                  <p className="font-medium text-foreground">{selectedUser.phoneNumber || "Not provided"}</p>
                </div>
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar size={14} />
                    <span className="text-xs uppercase">Joined</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                {selectedUser.registrationNumber && (
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Hash size={14} />
                    <span className="text-xs uppercase">Reg Number</span>
                  </div>
                  <p className="font-medium text-foreground">{selectedUser.registrationNumber}</p>
                </div>
                )}
                {selectedUser.studentID && (
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BadgeCheck size={14} />
                    <span className="text-xs uppercase">Student ID</span>
                  </div>
                  <p className="font-medium text-foreground">{selectedUser.studentID}</p>
                </div>
                )}
                {selectedUser.level && (
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <GraduationCap size={14} />
                    <span className="text-xs uppercase">Level</span>
                  </div>
                  <p className="font-medium text-foreground">{selectedUser.level}</p>
                </div>
                )}
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Building size={14} />
                    <span className="text-xs uppercase">School</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {typeof selectedUser.school === "string" ? selectedUser.school : selectedUser.school?.name || "Not assigned"}
                  </p>
                </div>
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Building size={14} />
                    <span className="text-xs uppercase">Department</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {typeof selectedUser.department === "string" ? selectedUser.department : selectedUser.department?.name || "Not assigned"}
                  </p>
                </div>
                {selectedUser.lastActiveAt && (
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock size={14} />
                    <span className="text-xs uppercase">Last Active</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {new Date(selectedUser.lastActiveAt).toLocaleDateString()}
                  </p>
                </div>
                )}
              </div>

              {!isEditMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 pt-4 border-t border-border">
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Award size={14} />
                    <span className="text-xs uppercase">Events</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedUser.stats?.eventsCreated ?? selectedUser.eventsCreated?.length ?? 0}
                  </p>
                </div>
                <div className="bg-accent/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Bell size={14} />
                    <span className="text-xs uppercase">Notifications</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedUser.stats?.notificationsReceived ?? selectedUser.notificationsReceived?.length ?? 0}
                  </p>
                </div>
              </div>
            )}

            {isEditMode && (
              <div className="space-y-4 mb-6 pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Name</label>
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Email</label>
                    <input
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Phone</label>
                    <input
                      type="tel"
                      value={editData.phoneNumber || ""}
                      onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Role</label>
                    <select
                      value={editData.role || ""}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    >
                      {allRoles.map(r => (
                        <option key={r.name} value={r.name}>{r.displayName || r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Reg Number</label>
                    <input
                      type="text"
                      value={editData.registrationNumber || ""}
                      onChange={(e) => setEditData({ ...editData, registrationNumber: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Student ID</label>
                    <input
                      type="text"
                      value={editData.studentID || ""}
                      onChange={(e) => setEditData({ ...editData, studentID: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Level</label>
                    <select
                      value={editData.level || ""}
                      onChange={(e) => setEditData({ ...editData, level: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Not set</option>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Year 5">Year 5</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Status</label>
                    <select
                      value={editData.status || "ACTIVE"}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="flex-1 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

              {showResetPassword ? (
                <div className="space-y-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground">Reset Password for {selectedUser.name}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-xs text-muted-foreground uppercase">New Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          className="w-full bg-accent border border-border rounded-xl px-4 py-3 pr-12 text-foreground focus:outline-none focus:border-blue-500/50"
                          placeholder="Min 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="text-xs text-muted-foreground uppercase">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-accent border border-border rounded-xl px-4 py-3 pr-12 text-foreground focus:outline-none focus:border-blue-500/50"
                          placeholder="Repeat password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleResetPassword}
                      disabled={isResetting || !resetPassword || !confirmPassword}
                      className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <KeyRound size={16} /> {isResetting ? "Resetting..." : "Reset Password"}
                    </button>
                    <button
                      onClick={() => { setShowResetPassword(false); setResetPassword(""); setConfirmPassword(""); }}
                      className="flex-1 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleEditToggle}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil size={16} /> Edit User
                </button>
                <button
                  onClick={() => setShowResetPassword(true)}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound size={16} /> Reset Password
                </button>
                <button
                  onClick={() => handleDelete(selectedUser._id || selectedUser.id, selectedUser.name)}
                  className="flex-1 sm:flex-none px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => { setShowBulkUpload(false); }}
        entity="users"
        onComplete={() => fetchUsers()}
      />

      <AnimatePresence>
        {showNewUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-12 sm:pt-16 p-2 sm:p-4 overflow-y-auto"
            onClick={() => setShowNewUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg p-4 sm:p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-bold text-foreground">Create New User</h2>
                <button 
                  onClick={() => setShowNewUserModal(false)} 
                  className="p-2.5 rounded-xl bg-accent hover:bg-accent/80 border border-border hover:border-blue-500/30 transition-all group"
                >
                  <X size={18} className="text-muted-foreground group-hover:text-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs block text-muted-foreground uppercase">Full Name *</label>
                      <input
                        type="text"
                        value={newUserData.name}
                        onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Email *</label>
                      <input
                        type="email"
                        value={newUserData.email}
                        onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                        placeholder="username@university.edu"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Phone</label>
                      <input
                        type="tel"
                        value={newUserData.phoneNumber}
                        onChange={(e) => setNewUserData({ ...newUserData, phoneNumber: e.target.value })}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                        placeholder="+234..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Role *</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                      className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                    >
                      {allRoles.map(r => (
                      <option key={r.name} value={r.name}>{r.displayName || r.name}</option>
                    ))}
                    </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">School</label>
                      <input
                        type="text"
                        value={newUserData.school}
                        onChange={(e) => setNewUserData({ ...newUserData, school: e.target.value })}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                        placeholder="School name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Department</label>
                      <input
                        type="text"
                        value={newUserData.department}
                        onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                        className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500/50"
                        placeholder="Department"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    <button
                      onClick={handleCreateUser}
                      disabled={isCreating || !newUserData.name || !newUserData.email}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save size={16} /> {isCreating ? "Creating..." : "Create User"}
                    </button>
                    <button
                      onClick={() => setShowNewUserModal(false)}
                      className="flex-1 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-xl font-medium transition-colors"
                    >
                      Cancel
</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
