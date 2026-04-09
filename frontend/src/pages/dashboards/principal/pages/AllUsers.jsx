import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared";
import {
  Search,
  Filter,
  Shield,
  MoreVertical,
  Eye,
  Ban,
  X,
  Activity,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import adminService from "../../../../services/adminService";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(1, 100, {});
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      setProcessingId(userId);
      await adminService.updateUser(userId, { isActive: false });
      toast.success("User has been suspended");
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to suspend user:", error);
      toast.error(error.response?.data?.message || "Failed to suspend user");
    } finally {
      setProcessingId(null);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      setProcessingId(userId);
      await adminService.updateUser(userId, { isActive: true });
      toast.success("User has been activated");
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to activate user:", error);
      toast.error(error.response?.data?.message || "Failed to activate user");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive !== false) ||
      (statusFilter === "suspended" && user.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const colors = {
      student: "bg-blue-500/20 text-blue-400",
      lecturer: "bg-purple-500/20 text-purple-400",
      hod: "bg-amber-500/20 text-amber-400",
      dean: "bg-emerald-500/20 text-emerald-400",
      principal: "bg-cyan-500/20 text-cyan-400",
      admin: "bg-red-500/20 text-red-400",
      guild_president: "bg-pink-500/20 text-pink-400",
    };
    return colors[role] || "bg-gray-500/20 text-gray-400";
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          All Users
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage and monitor all users across the system.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="lecturer">Lecturers</option>
            <option value="hod">HoDs</option>
            <option value="dean">Deans</option>
            <option value="principal">Principal</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Login</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      {user.department?.name || user.school?.name || user.college?.name || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-xs ${user.isActive !== false ? 'text-emerald-500' : 'text-red-500'}`}>
                        <Activity size={12} />
                        {user.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        {user.isActive !== false ? (
                          <button
                            onClick={() => handleBanUser(user._id)}
                            disabled={processingId === user._id}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            {processingId === user._id ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user._id)}
                            disabled={processingId === user._id}
                            className="p-2 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors"
                          >
                            {processingId === user._id ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card rounded-2xl border border-border p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                    {selectedUser.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Role</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Department</span>
                  <span className="text-foreground">{selectedUser.department?.name || selectedUser.school?.name || selectedUser.college?.name || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <span className={selectedUser.isActive !== false ? 'text-emerald-500' : 'text-red-500'}>
                    {selectedUser.isActive !== false ? 'Active' : 'Suspended'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="text-foreground">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {selectedUser.isActive !== false ? (
                  <button
                    onClick={() => handleBanUser(selectedUser._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium"
                  >
                    <Ban size={18} />
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivateUser(selectedUser._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    <UserCheck size={18} />
                    Activate User
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}