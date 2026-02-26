import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Plus,
  Moon,
  Sun,
  Loader2,
  Trash2,
  X,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "../../../context/ThemeContext";
import adminService from "../../../services/adminService";
import StatusBadge from "../../../components/ui/StatusBadge";
import Navbar from "../../../layouts/Navbar";
import Footer from "../../../layouts/Footer";

const ROLES = ["student", "guild_president", "lecturer", "hod", "admin"];

export default function UserManagement() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    school: "",
  });

  // 1. FETCH DATA FROM DATABASE
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      toast.error("Failed to load users from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. CREATE NEW USER
  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      await toast.promise(adminService.createUser(newUser), {
        loading: "Creating user...",
        success: (data) => {
          setUsers([data.user, ...users]);
          setIsModalOpen(false);
          setNewUser({
            name: "",
            email: "",
            password: "",
            role: "student",
            department: "",
            school: "",
          });
          return "User added successfully!";
        },
        error: (err) => err.response?.data?.message || "Failed to create user",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 3. EXPORT TO CSV
  const handleExport = () => {
    const headers = ["Name,Email,Role,Department,School,JoinedDate"];
    const rows = users.map(
      (u) =>
        `${u.name},${u.email},${u.role},${u.department || "N/A"},${u.school || "N/A"},${u.createdAt || ""}`,
    );

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `uninotify_users_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    toast.success("Exporting user database...");
  };

  // 4. ROLE UPDATE & DELETE
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await adminService.promoteUser(userId, newRole);
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
      toast.success(`Access level changed to ${newRole}`);
    } catch (error) {
      toast.error("Permission update failed");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanent Action: Delete this user from database?"))
      return;
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
      toast.success("User purged from system");
    } catch (error) {
      toast.error("Delete operation failed");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 flex flex-col">
      <Toaster />

      <main className="flex-1 p-6 md:p-12 pt-32 max-w-10xl mx-auto w-full space-y-5">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              Access control
            </h1>
            {/* <p className="text-neutral-500 font-medium">
                Managing {users.length} institutional accounts from MongoDB
              </p> */}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-3 glass dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl text-neutral-600 dark:text-neutral-400 hover:scale-105 transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 hover:scale-105"
            >
              <UserPlus size={18} /> Add user
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center   p-4 ">
          <div className="relative w-full md:max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-white/5 py-3 pl-12 pr-4 rounded-[10px] outline-none transition-all"
              placeholder="Search by name or email..."
            />
          </div>
          <div className="flex gap-2">
            <button className="p-3 glass dark:bg-white/5 border border-neutral-200 hover:text-white dark:border-white/10 rounded-xl text-neutral-500  transition-colors">
              <Filter size={18} />
            </button>
            <button
              onClick={handleExport}
              className="p-3 glass dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[10px] text-neutral-500 hover:text-white transition-colors flex items-center"
            >
              <Download size={18} />{" "}
              <span className="text-xs font-bold uppercase"></span>
            </button>
          </div>
        </div>

        {/* Database Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-[10px] overflow-hidden border border-neutral-200 dark:border-white/5 shadow-2xl">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest px-10">
                Synchronizing with UniNotify Cloud Database...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-50 dark:bg-white/[0.02] text-neutral-400 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-neutral-200 dark:border-white/5">
                  <tr>
                    <th className="p-6 text-center w-16 italic text-blue-500">
                      #
                    </th>
                    <th className="p-6">User profile</th>
                    <th className="p-6">Department</th>
                    <th className="p-6">Role</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={user._id}
                        className="hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors group"
                      >
                        <td className="p-6 text-center text-neutral-400 font-mono text-xs">
                          {index + 1}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-600 text-xs">
                              {user.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {user.name}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                            {user.department || "N/A"}
                          </span>
                          <div className="text-[10px] text-neutral-400 uppercase font-bold">
                            {user.school || "No School"}
                          </div>
                        </td>
                        <td className="p-6">
                          <StatusBadge
                            currentRole={user.role}
                            options={ROLES}
                            onUpdate={(role) =>
                              handleRoleUpdate(user._id, role)
                            }
                          />
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Policy Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-8 glass dark:bg-blue-600/5 border border-blue-500/20 rounded-[10px] flex gap-6 items-center"
        >
          <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 shrink-0">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h4 className="text-blue-600 dark:text-blue-400 font-black text-lg uppercase tracking-tighter">
              Security protocol
            </h4>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 leading-relaxed max-w-2xl">
              Elevating roles to <strong>HoD</strong> or{" "}
              <strong>Lecturer</strong> enables broadcasting privileges. These
              changes are logged in the system audit trail and tied to your
              administrator ID.
            </p>
          </div>
        </motion.div>
      </main>

      {/* --- ADD USER MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass dark:bg-neutral-900 p-8 rounded-[10px] border border-white/10 w-full max-w-lg relative shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-2">Create New Account</h2>
              <p className="text-neutral-500 text-sm mb-8">
                Register a user directly into the system database.
              </p>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Full Name"
                    className="bg-white/5 border border-white/10 p-4 rounded-[10px] outline-none focus:border-blue-500 transition-all text-sm"
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                  <input
                    required
                    type="email"
                    placeholder="Institutional Email"
                    className="bg-white/5 border border-white/10 p-4 rounded-[10px] outline-none focus:border-blue-500 transition-all text-sm"
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>

                <input
                  required
                  type="password"
                  placeholder="Initial Password"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-[10px] outline-none focus:border-blue-500 transition-all text-sm"
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="bg-neutral-800 border border-white/10 p-4 rounded-[10px] outline-none text-sm appearance-none"
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Department (e.g., IT)"
                    className="bg-white/5 border border-white/10 p-4 rounded-[10px] outline-none focus:border-blue-500 transition-all text-sm"
                    onChange={(e) =>
                      setNewUser({ ...newUser, department: e.target.value })
                    }
                  />
                </div>

                <button className="w-full bg-white text-black py-5 rounded-[10px] shadow-lg transition-all flex items-center justify-center gap-2 mt-4 group">
                  Confirm & Save{" "}
                  <CheckCircle2
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
