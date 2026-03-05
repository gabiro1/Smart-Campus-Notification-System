import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Search,
  Shield,
  MoreVertical,
  Edit2,
  Ban,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialUsers = [
  {
    id: 1,
    name: "Dr. Amanda Clarke",
    role: "Head of Dept",
    dept: "Physics",
    status: "Active",
  },
  {
    id: 2,
    name: "Prof. John Davies",
    role: "Lecturer",
    dept: "Computer Science",
    status: "Active",
  },
  {
    id: 3,
    name: "Dr. Mark Spector",
    role: "Lecturer",
    dept: "Engineering",
    status: "Suspended",
  },
  {
    id: 4,
    name: "Sarah Williams",
    role: "Admin Staff",
    dept: "Dean's Office",
    status: "Active",
  },
];

export default function RoleManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [tempRole, setTempRole] = useState("");

  // Filtering
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.dept.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Modal Actions
  const openEditModal = (user) => {
    setEditingUser(user);
    setTempRole(user.role);
  };

  const saveRole = () => {
    setUsers(
      users.map((u) =>
        u.id === editingUser.id ? { ...u, role: tempRole } : u,
      ),
    );
    setEditingUser(null);
  };

  const toggleStatus = (id) => {
    setUsers(
      users.map((u) => {
        if (u.id === id)
          return {
            ...u,
            status: u.status === "Active" ? "Suspended" : "Active",
          };
        return u;
      }),
    );
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Role Management
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Administer permissions and access across all departments.
        </p>
      </header>

      <GlassCard className="p-0 overflow-hidden min-h-[500px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or department..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Shield size={16} /> Invite User
          </button>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                <th className="p-5 font-semibold">Staff Member</th>
                <th className="p-5 font-semibold">Assigned Role</th>
                <th className="p-5 font-semibold">Department</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-5 font-medium text-white">{user.name}</td>
                  <td className="p-5">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border ${
                        user.role === "Head of Dept"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : user.role === "Admin Staff"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-white/5 text-neutral-300 border-white/10"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-neutral-400">{user.dept}</td>
                  <td className="p-5">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium ${user.status === "Active" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`}
                      />
                      {user.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 text-neutral-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-md transition-all"
                        title="Edit Role"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={`p-1.5 bg-white/5 rounded-md transition-all ${user.status === "Active" ? "text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"}`}
                        title={
                          user.status === "Active" ? "Suspend" : "Reactivate"
                        }
                      >
                        {user.status === "Active" ? (
                          <Ban size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-white">
                  Edit Permissions
                </h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-neutral-400 mb-4">
                  Update role for{" "}
                  <strong className="text-white">{editingUser.name}</strong>
                </p>
                <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">
                  Select Role
                </label>
                <select
                  value={tempRole}
                  onChange={(e) => setTempRole(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="Lecturer">Lecturer</option>
                  <option value="Head of Dept">Head of Department</option>
                  <option value="Admin Staff">Admin Staff</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRole}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                >
                  Save Role
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
