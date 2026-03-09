import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Search,
  Filter,
  Shield,
  MoreVertical,
  Eye,
  Ban,
  X,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Massive Mock DB Simulation
const userDatabase = [
  {
    id: 101,
    name: "Emily Watson",
    role: "Student",
    dept: "Computer Science",
    year: "Year 3",
    status: "Active",
    lastLogin: "2 mins ago",
    health: "100%",
  },
  {
    id: 102,
    name: "Dr. Gregory House",
    role: "Lecturer",
    dept: "Medicine",
    year: "N/A",
    status: "Active",
    lastLogin: "1 hr ago",
    health: "98%",
  },
  {
    id: 103,
    name: "Michael Chang",
    role: "Guild President",
    dept: "Engineering",
    year: "Year 4",
    status: "Active",
    lastLogin: "Today",
    health: "100%",
  },
  {
    id: 104,
    name: "Sarah Connor",
    role: "Student",
    dept: "Physics",
    year: "Year 1",
    status: "Suspended",
    lastLogin: "2 weeks ago",
    health: "0%",
  },
  {
    id: 105,
    name: "Prof. Albus D.",
    role: "Dean",
    dept: "Arts",
    year: "N/A",
    status: "Active",
    lastLogin: "5 mins ago",
    health: "100%",
  },
];

export default function AllUsers() {
  const [users, setUsers] = useState(userDatabase);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const [inspectUser, setInspectUser] = useState(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.dept.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          System Directory
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Master table of all provisioned accounts across the network.
        </p>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[600px]">
        {/* Advanced Toolbar */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-4 w-full">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user ID, name, or department..."
                className="w-full bg-[#050505] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-emerald-500/50 appearance-none w-48 hidden md:block"
            >
              <option value="All">All Entities</option>
              <option value="Student">Students</option>
              <option value="Lecturer">Lecturers</option>
              <option value="HoD">HoDs</option>
              <option value="Dean">Deans</option>
            </select>
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-white/10 w-full md:w-auto justify-center">
            <Filter size={16} /> Advanced Filter
          </button>
        </div>

        {/* Master User Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                <th className="p-5 font-bold">Identity</th>
                <th className="p-5 font-bold">System Role</th>
                <th className="p-5 font-bold">Domain</th>
                <th className="p-5 font-bold">Status / Node</th>
                <th className="p-5 font-bold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/[0.02] transition-colors group cursor-default"
                >
                  <td className="p-5">
                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                      UID: {user.id}
                    </p>
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${
                        user.role === "Student"
                          ? "bg-white/5 text-neutral-300 border-white/10"
                          : user.role === "Guild President"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-neutral-400">
                    {user.dept}{" "}
                    <span className="text-neutral-600 ml-1 text-xs">
                      {user.year !== "N/A" && `(${user.year})`}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-bold ${user.status === "Active" ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`}
                        />
                        {user.status}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        Last Seen: {user.lastLogin}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setInspectUser(user)}
                        className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5"
                        title="Inspect Node"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* User Inspection Modal */}
      <AnimatePresence>
        {inspectUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl z-10"
            >
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-blue-600 p-[2px]">
                    <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center font-bold text-white text-lg">
                      {inspectUser.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {inspectUser.name}
                    </h2>
                    <p className="text-sm text-neutral-400 font-mono">
                      UID: {inspectUser.id} • {inspectUser.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectUser(null)}
                  className="text-neutral-500 hover:text-white bg-white/5 p-2 rounded-xl border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">
                    Account Health
                  </p>
                  <p className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <Activity size={18} /> {inspectUser.health}
                  </p>
                </div>
                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">
                    Node Status
                  </p>
                  <p
                    className={`text-lg font-bold flex items-center gap-2 ${inspectUser.status === "Active" ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${inspectUser.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`}
                    />{" "}
                    {inspectUser.status}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-white/10 pt-6">
                <button className="px-5 py-2.5 text-sm font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors border border-rose-500/20 flex items-center gap-2">
                  <Ban size={16} /> Suspend Account
                </button>
                <button className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-neutral-200 transition-all">
                  Manage RBAC Rules
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
