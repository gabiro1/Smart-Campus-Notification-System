import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Search,
  Filter,
  Shield,
  MoreVertical,
  Edit,
  Ban,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Database
const initialRoles = [
  {
    id: 1,
    name: "Dr. Robert Vance",
    role: "Dean",
    dept: "Sciences",
    status: "Active",
  },
  {
    id: 2,
    name: "Prof. Sarah Jenkins",
    role: "HoD",
    dept: "Computer Science",
    status: "Active",
  },
  {
    id: 3,
    name: "Admin Support",
    role: "System Admin",
    dept: "IT Support",
    status: "Active",
  },
  {
    id: 4,
    name: "Dr. Mark Spector",
    role: "HoD",
    dept: "Engineering",
    status: "Suspended",
  },
];

export default function AdminPanel() {
  const [users, setUsers] = useState(initialRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: "", status: "" });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.dept.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditOpen = (user) => {
    setEditingUser(user);
    setEditForm({ role: user.role, status: user.status });
  };

  const handleSave = () => {
    setUsers(
      users.map((u) => (u.id === editingUser.id ? { ...u, ...editForm } : u)),
    );
    setEditingUser(null);
  };

  const toggleSuspend = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin Control Panel
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Manage executive roles, access tiers, and global permissions.
          </p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2">
          <Shield size={16} /> Provision New Admin
        </button>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admin users..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-emerald-500/50 appearance-none"
            >
              <option value="All">All Admin Roles</option>
              <option value="Dean">Deans</option>
              <option value="HoD">Heads of Department</option>
              <option value="System Admin">System Admins</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 w-full bg-white/5 border border-white/10 rounded-xl text-sm text-neutral-300 hover:text-white transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                <th className="p-5 font-semibold">Administrator</th>
                <th className="p-5 font-semibold">Access Role</th>
                <th className="p-5 font-semibold">Domain / Dept</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Manage</th>
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
                    <span className="px-2.5 py-1 text-xs font-semibold bg-white/5 rounded-md border border-white/10 text-neutral-300">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-neutral-400">{user.dept}</td>
                  <td className="p-5">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-bold ${user.status === "Active" ? "text-emerald-400" : "text-rose-400"}`}
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
                        onClick={() => handleEditOpen(user)}
                        className="p-1.5 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-all"
                        title="Edit Permissions"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleSuspend(user.id)}
                        className={`p-1.5 rounded-md transition-all ${user.status === "Active" ? "text-neutral-400 bg-white/5 hover:text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10 hover:text-emerald-300"}`}
                        title={
                          user.status === "Active"
                            ? "Suspend Account"
                            : "Reactivate"
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
              className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-white">Modify Access</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">
                    Target User
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.name}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-neutral-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">
                    System Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="Dean">Dean</option>
                    <option value="HoD">Head of Department</option>
                    <option value="System Admin">System Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                >
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
