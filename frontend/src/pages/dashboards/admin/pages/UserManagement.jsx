import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity,
  X,
  Pencil,
  Mail,
  Phone,
  Calendar,
  Building,
  GraduationCap,
  Save,
  Camera,
  Shield,
  Users,
  Filter,
  Eye,
  Bell,
  Award,
  Clock,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import ThemedToaster from "../../../../components/ui/ThemedToaster";
import { useTheme } from "../../../../context/ThemeContext";
import adminService from "../../../../services/adminService";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "lecturer", label: "Lecturer" },
  { value: "hod", label: "Head of Dept" },
  { value: "dean", label: "Dean" },
  { value: "principal", label: "Principal" },
  { value: "admin", label: "System Admin" },
  { value: "guild_president", label: "Guild President" },
];

const FILTER = [
  { value: "", label: "All" },
  ...ROLES
];

export default function UserManagement() {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "student",
    college: "", school: "", department: "", level: "",
  });

  const [hierarchy, setHierarchy] = useState({});
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailedUser, setDetailedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editSchoolOptions, setEditSchoolOptions] = useState([]);
  const [editDeptOptions, setEditDeptOptions] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const filterRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoadingHierarchy(true);
        const response = await adminService.getHierarchy();
        setHierarchy(response.data || response || {});
      } catch (error) {
        console.error("Failed to fetch hierarchy:", error);
      } finally {
        setLoadingHierarchy(false);
      }
    };
    fetchHierarchy();
  }, []);

  const collegeOptions = Object.keys(hierarchy);
  const schoolOptions = hierarchy[formData.college] ? Object.keys(hierarchy[formData.college]) : [];
  const departmentOptions = hierarchy[formData.college]?.[formData.school] || [];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (roleFilter) filters.role = roleFilter;
      const data = await adminService.getUsers(page, 15, filters);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchUsers(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, roleFilter]);

  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    if (userIdParam && users.length > 0) {
      const targetUser = users.find(u => u._id === userIdParam || u.id === userIdParam);
      if (targetUser) {
        openDrawer(targetUser, false);
      }
    }
  }, [searchParams, users]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.createUser(formData);
      toast.success("User registered successfully");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "student", college: "", school: "", department: "", level: "" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await adminService.deleteUser(id);
      toast.success("User deleted");
      if (selectedUserId === id) closeDrawer();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleRoleChange = async (id, newRole, e) => {
    if (e) e.stopPropagation();
    try {
      await adminService.promoteUser(id, newRole);
      toast.success(`Role updated to ${newRole.replace("_", " ")}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Role update failed");
    }
  };

  const openDrawer = async (user, startInEditMode = false) => {
    setSelectedUserId(user._id);
    setLoadingDetails(true);
    setIsEditMode(startInEditMode);
    setActiveTab("profile");

    try {
      const data = await adminService.getUser(user._id);
      setDetailedUser(data);
      const u = data.user;
      
      let userCollege = "";
      for (const [college, schools] of Object.entries(hierarchy)) {
        if (schools && Object.keys(schools).includes(u.school || "")) {
          userCollege = college;
          break;
        }
      }
      
      setEditFormData({
        name: u.name,
        email: u.email,
        phoneNumber: u.phoneNumber || "",
        role: u.role,
        college: userCollege,
        school: u.school || "",
        department: u.department || "",
        profilePicture: u.profilePicture || "",
      });
      setImagePreview(u.profilePicture || null);
    } catch (error) {
      toast.error("Failed to load user profile");
      closeDrawer();
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeDrawer = () => {
    setSelectedUserId(null);
    setDetailedUser(null);
    setIsEditMode(false);
    setImagePreview(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setEditFormData({ ...editFormData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await adminService.updateUser(detailedUser.user._id, editFormData);
      toast.success("User updated successfully");
      fetchUsers();
      const data = await adminService.getUser(detailedUser.user._id);
      setDetailedUser(data);
      setIsEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (isEditMode && editFormData.college) {
      setEditSchoolOptions(Object.keys(hierarchy[editFormData.college] || {}));
    }
  }, [isEditMode, editFormData.college, hierarchy]);

  useEffect(() => {
    if (isEditMode && editFormData.college && editFormData.school) {
      setEditDeptOptions(hierarchy[editFormData.college]?.[editFormData.school] || []);
    }
  }, [isEditMode, editFormData.college, editFormData.school, hierarchy]);

  const roleCounts = ROLES.reduce((acc, role) => {
    acc[role.value] = users.filter(u => u.role === role.value).length;
    return acc;
  }, {});
  const totalUsers = users.length;

  return (
    <div className={`min-h-screen p-6 lg:p-8 ${isDarkMode ? "bg-neutral-950 text-white" : "bg-gray-50 text-neutral-900"}`} style={{ overflow: 'visible' }}>
      <ThemedToaster />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Access Control</h1>
          </div>
          <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Manage users, roles, and permissions</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${
            isDarkMode ? "bg-white text-neutral-950 hover:bg-neutral-200" : "bg-neutral-900 text-white hover:bg-neutral-800"
          }`}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-neutral-500" : "text-neutral-400"}`} size={18} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className={`w-full border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none transition-colors ${
              isDarkMode 
                ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500" 
                : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400"
            }`}
          />
        </div>
        
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm hover:transition-colors ${
              isDarkMode 
                ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700" 
                : "bg-white border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <Filter size={16} className={isDarkMode ? "text-neutral-400" : "text-neutral-500"} />
            <span className={isDarkMode ? "text-white" : "text-neutral-700"}>
              {roleFilter ? ROLES.find(r => r.value === roleFilter)?.label : "All"}
            </span>
            <span className={isDarkMode ? "text-neutral-500" : "text-neutral-400"}>({totalUsers})</span>
            <ChevronDown size={16} className={`${isDarkMode ? "text-neutral-400" : "text-neutral-500"} transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-full right-0 mt-2 w-56 border rounded-lg shadow-xl z-30 overflow-hidden ${
                  isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
                }`}
              >
                {FILTER.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => { setRoleFilter(role.value); setIsFilterOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:transition-colors ${
                      isDarkMode 
                        ? "hover:bg-neutral-800" 
                        : "hover:bg-neutral-100"
                    } ${roleFilter === role.value ? "text-blue-500" : isDarkMode ? "text-white" : "text-neutral-700"}`}
                  >
                    <span>{role.label}</span>
                    <span className={isDarkMode ? "text-neutral-500" : "text-neutral-400"} text-xs>
                      {role.value === "" ? totalUsers : roleCounts[role.value] || 0}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Activity className="animate-spin text-blue-500 mb-3" size={24} />
            <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={40} className={isDarkMode ? "text-neutral-700 mb-3" : "text-neutral-300 mb-3"} />
            <p className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className={isDarkMode ? "bg-neutral-950 border-b border-neutral-800" : "bg-gray-50 border-b border-neutral-200"}>
              <tr>
                <th className={`text-left p-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>User</th>
                <th className={`text-left p-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>Role</th>
                <th className={`text-left p-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>School / Dept</th>
                <th className={`text-left p-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>Status</th>
                <th className={`text-right p-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={isDarkMode ? "divide-y divide-neutral-800" : "divide-y divide-neutral-200"}>
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => openDrawer(user, false)}
                    className={`transition-colors cursor-pointer ${isDarkMode ? "hover:bg-neutral-800/50" : "hover:bg-gray-50"}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ${
                            user.profilePicture 
                              ? "" 
                              : isDarkMode 
                                ? "bg-blue-600 text-white" 
                                : "bg-blue-700 text-white"
                          }`}>
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{user.name}</p>
                          <p className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleRoleChange(user._id, e.target.value, e)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-md border-0 cursor-pointer ${isDarkMode ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-700"}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <p className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-700"}`}>{user.school || "—"}</p>
                      <p className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>{user.department || "No department"}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-emerald-500 font-medium">Active</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openDrawer(user, false); }}
                          className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}
                          title="View"
                        >
                          <Eye size={16} className={isDarkMode ? "text-neutral-400" : "text-neutral-500"} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openDrawer(user, true); }}
                          className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}
                          title="Edit"
                        >
                          <Pencil size={16} className={isDarkMode ? "text-neutral-400" : "text-neutral-500"} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(user._id, user.name, e)}
                          className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-red-900/30" : "hover:bg-red-50"}`}
                          title="Delete"
                        >
                          <Trash size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}

        {!loading && totalPages > 1 && (
          <div className={`flex items-center justify-between p-4 ${isDarkMode ? "border-t border-neutral-800" : "border-t border-neutral-200"}`}>
            <span className={`text-sm ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-neutral-800 disabled:opacity-50" : "hover:bg-neutral-100 disabled:opacity-50"} disabled:cursor-not-allowed transition-colors`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-neutral-800 disabled:opacity-50" : "hover:bg-neutral-100 disabled:opacity-50"} disabled:cursor-not-allowed transition-colors`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

{/* Modal */}
      <AnimatePresence>
        {selectedUserId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={closeDrawer} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 50, scale: 0.9, rotate: 5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden z-[101] flex flex-col ${
                loadingDetails || !detailedUser ? "bg-transparent" : isDarkMode ? "bg-neutral-900" : "bg-white"
              } ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}
            >
              {loadingDetails || !detailedUser ? (
                <svg className="w-20 h-20 m-auto" viewBox="0 0 240 240">
                    <circle className="ring ring-a" cx={120} cy={120} r={105} fill="none" stroke="currentColor" strokeWidth={20} strokeDasharray="0 660" strokeDashoffset={-330} strokeLinecap="round" />
                    <circle className="ring ring-b" cx={120} cy={120} r={35} fill="none" stroke="currentColor" strokeWidth={20} strokeDasharray="0 220" strokeDashoffset={-110} strokeLinecap="round" />
                    <circle className="ring ring-c" cx={85} cy={120} r={70} fill="none" stroke="currentColor" strokeWidth={20} strokeDasharray="0 440" strokeLinecap="round" />
                    <circle className="ring ring-d" cx={155} cy={120} r={70} fill="none" stroke="currentColor" strokeWidth={20} strokeDasharray="0 440" strokeLinecap="round" />
                    <style>{`
                      .ring { animation: ringA 2s linear infinite; }
                      .ring-a { stroke: #f42f25; animation-name: ringA; }
                      .ring-b { animation-name: ringB; stroke: #f49725; }
                      .ring-c { animation-name: ringC; stroke: #255ff4; }
                      .ring-d { animation-name: ringD; stroke: #f42582; }
                      @keyframes ringA {
                        from, 4% { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -330; }
                        12% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -335; }
                        32% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -595; }
                        40%, 54% { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -660; }
                        62% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -665; }
                        82% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -925; }
                        90%, to { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -990; }
                      }
                      @keyframes ringB {
                        from, 12% { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -110; }
                        20% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -115; }
                        40% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -195; }
                        48%, 62% { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -220; }
                        70% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -225; }
                        90% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -305; }
                        98%, to { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -330; }
                      }
                      @keyframes ringC {
                        from { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: 0; }
                        8% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -5; }
                        28% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -175; }
                        36%, 58% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -220; }
                        66% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -225; }
                        86% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -395; }
                        94%, to { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -440; }
                      }
                      @keyframes ringD {
                        from, 8% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: 0; }
                        16% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -5; }
                        36% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -175; }
                        44%, 50% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -220; }
                        58% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -225; }
                        78% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -395; }
                        86%, to { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -440; }
                      }
                    `}</style>
                  </svg>
              ) : (
                <>
                  <div className={`p-5 border-b flex items-center justify-between ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                    <h2 className="font-semibold text-lg">User Details</h2>
                    <button onClick={closeDrawer} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"}`}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="flex flex-col items-center mb-4">
                      <div className="relative group mb-3">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden ring-4 ${
                          imagePreview
                            ? ""
                            : isDarkMode 
                              ? "bg-blue-600 text-white ring-neutral-800" 
                              : "bg-blue-700 text-white ring-blue-100"
                        }`}>
                          {imagePreview ? (
                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            detailedUser.user.name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        {isEditMode && (
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            className={`absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                              isDarkMode ? "bg-black/50" : "bg-black/30"
                            }`}
                          >
                            <Camera size={20} className="text-white" />
                          </button>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                      </div>
                      
                      {!isEditMode ? (
                        <>
                          <h3 className="font-semibold text-lg text-center mb-1">{detailedUser.user.name}</h3>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                            {detailedUser.user.role?.replace("_", " ")}
                          </span>
                        </>
                      ) : (
                        <div className="w-full space-y-3">
                          <input 
                            value={editFormData.name} 
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} 
                            className={`w-full border rounded-lg p-2.5 text-sm text-center ${isDarkMode ? "bg-neutral-950 border-neutral-800" : "bg-gray-50 border-neutral-200"}`} 
                          />
                          <select 
                            value={editFormData.role} 
                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })} 
                            className={`w-full border rounded-lg p-2.5 text-sm ${isDarkMode ? "bg-neutral-950 border-neutral-800" : "bg-gray-50 border-neutral-200"}`}
                          >
                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Toggle Tabs */}
                    <div className={`flex p-1 rounded-xl mb-4 ${isDarkMode ? "bg-neutral-950" : "bg-gray-100"}`}>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                          activeTab === "profile" 
                            ? isDarkMode ? "bg-neutral-800 text-white" : "bg-white text-neutral-900 shadow"
                            : isDarkMode ? "text-neutral-400" : "text-neutral-500"
                        }`}
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => setActiveTab("stats")}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                          activeTab === "stats" 
                            ? isDarkMode ? "bg-neutral-800 text-white" : "bg-white text-neutral-900 shadow"
                            : isDarkMode ? "text-neutral-400" : "text-neutral-500"
                        }`}
                      >
                        Stats
                      </button>
                      {isEditMode && (
                        <button
                          onClick={() => setActiveTab("edit")}
                          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                            activeTab === "edit" 
                              ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                              : isDarkMode ? "text-neutral-400" : "text-neutral-500"
                          }`}
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                    </div>

                    {!isEditMode && activeTab === "profile" && (
                      <div className="space-y-3">
                        <InfoRow icon={<Mail size={16}/>} label="Email" value={detailedUser.user.email} isDarkMode={isDarkMode} />
                        <InfoRow icon={<Phone size={16}/>} label="Phone" value={detailedUser.user.phoneNumber || "Not provided"} isDarkMode={isDarkMode} />
                        <InfoRow icon={<Building size={16}/>} label="School" value={detailedUser.user.school || "Not assigned"} isDarkMode={isDarkMode} />
                        <InfoRow icon={<GraduationCap size={16}/>} label="Department" value={detailedUser.user.department || "Not assigned"} isDarkMode={isDarkMode} />
                        <InfoRow icon={<Calendar size={16}/>} label="Joined" value={new Date(detailedUser.user.createdAt).toLocaleDateString()} isDarkMode={isDarkMode} />
                      </div>
                    )}

                    {!isEditMode && activeTab === "stats" && detailedUser.stats && (
                      <div className="grid grid-cols-2 gap-3">
                        <StatBox icon={<Award size={18} className="text-blue-500" />} label="Events" value={detailedUser.stats.eventsCreated || 0} isDarkMode={isDarkMode} />
                        <StatBox icon={<Bell size={18} className="text-purple-500" />} label="Notifications" value={detailedUser.stats.notificationsReceived || 0} isDarkMode={isDarkMode} />
                        <StatBox icon={<Clock size={18} className="text-amber-500" />} label="Reminders" value={detailedUser.stats.remindersCreated || 0} isDarkMode={isDarkMode} />
                        <StatBox icon={<Activity size={18} className="text-emerald-500" />} label="RSVPs" value={detailedUser.stats.rsvpsCreated || 0} isDarkMode={isDarkMode} />
                      </div>
                    )}

                    {isEditMode && activeTab === "edit" && (
                      <div className="space-y-3 pt-2">
                        <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className={`w-full border rounded-lg p-2.5 text-sm ${isDarkMode ? "bg-neutral-950 border-neutral-800" : "bg-gray-50 border-neutral-200"}`} placeholder="Email" />
                        <input type="tel" value={editFormData.phoneNumber} onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })} className={`w-full border rounded-lg p-2.5 text-sm ${isDarkMode ? "bg-neutral-950 border-neutral-800" : "bg-gray-50 border-neutral-200"}`} placeholder="Phone Number" />
                        <select value={editFormData.college} onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value, school: "", department: "" })} className={`w-full border rounded-lg p-2.5 text-sm ${isDarkMode ? "bg-neutral-950 border-neutral-800" : "bg-gray-50 border-neutral-200"}`}>
                          <option value="">Select College</option>
                          {collegeOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={editFormData.school} onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value, department: "" })} className={`w-full border rounded-lg p-2.5 text-sm ${isDarkMode ? "bg-neutral-950 border-neutral-800" : "bg-gray-50 border-neutral-200"}`}>
                          <option value="">Select School</option>
                          {editSchoolOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={editFormData.department} onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })} className={`w-full border rounded-lg p-2.5 text-sm ${isDarkMode ? "bg-neutral-950 border-neutral-800" : "bg-gray-50 border-neutral-200"}`}>
                          <option value="">Select Department</option>
                          {editDeptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className={`p-5 border-t flex gap-3 ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isDarkMode ? "bg-neutral-800 hover:bg-neutral-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-neutral-900"
                    }`}>
                      {isEditMode ? "Cancel" : "Edit Profile"}
                    </button>
                    {isEditMode ? (
                      <button onClick={handleUpdateUser} disabled={isUpdating} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                        isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}>
                        {isUpdating ? <Activity size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
                      </button>
                    ) : (
                      <button onClick={(e) => handleDelete(detailedUser.user._id, detailedUser.user.name, e)} className="py-3 px-5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl transition-colors flex items-center gap-2">
                        <Trash size={16} /> Delete
                      </button>
                    )}
                  </div>
                </>
)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`rounded-xl border w-full max-w-md shadow-2xl ${
              isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}>
              <div className={`p-5 border-b flex items-center justify-between ${isDarkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                <h2 className="font-semibold text-lg">Register New User</h2>
                <button onClick={() => setIsModalOpen(false)} className={`p-1.5 rounded-lg ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`border rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none ${
                    isDarkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-gray-50 border-neutral-200 text-neutral-900"
                  }`} />
                  <input required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`border rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none ${
                    isDarkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-gray-50 border-neutral-200 text-neutral-900"
                  }`} />
                </div>
                <input required type="password" placeholder="Temporary Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`w-full border rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none ${
                    isDarkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-gray-50 border-neutral-200 text-neutral-900"
                  }`} />
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={`w-full border rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none ${
                    isDarkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-gray-50 border-neutral-200 text-neutral-900"
                  }`}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <select value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value, school: "", department: "" })} disabled={loadingHierarchy} className={`border rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none ${
                    isDarkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-gray-50 border-neutral-200 text-neutral-900"
                  }`}>
                    <option value="">{loadingHierarchy ? "Loading..." : "College"}</option>
                    {collegeOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value, department: "" })} disabled={!formData.college} className={`border rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none ${
                    isDarkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-gray-50 border-neutral-200 text-neutral-900"
                  }`}>
                    <option value="">{!formData.college ? "Select college" : "School"}</option>
                    {schoolOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} disabled={!formData.school} className={`w-full border rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none ${
                    isDarkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-gray-50 border-neutral-200 text-neutral-900"
                  }`}>
                  <option value="">{!formData.school ? "Select school first" : "Department"}</option>
                  {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {formData.role === "student" && (
                  <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className={`w-full border rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none ${
                    isDarkMode ? "bg-neutral-950 border-neutral-800 text-white" : "bg-gray-50 border-neutral-200 text-neutral-900"
                  }`}>
                    <option value="">Select Year</option>
                    <option value="Year 1">Year 1</option><option value="Year 2">Year 2</option><option value="Year 3">Year 3</option><option value="Year 4">Year 4</option><option value="Year 5">Year 5</option>
                  </select>
                )}
                <button type="submit" disabled={isSubmitting} className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                } disabled:opacity-50`}>
                  {isSubmitting ? <Activity size={16} className="animate-spin" /> : <Save size={16} />} Register User
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ icon, label, value, isDarkMode }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? "bg-neutral-950" : "bg-gray-50"}`}>
      <div className={isDarkMode ? "text-neutral-500" : "text-neutral-400"}>{icon}</div>
      <div>
        <p className={`text-[10px] uppercase tracking-wider ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>{label}</p>
        <p className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{value}</p>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, isDarkMode }) {
  return (
    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-neutral-950 border-neutral-800" : "bg-gray-50 border-neutral-200"}`}>
      <div className="mb-2">{icon}</div>
      <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-neutral-900"}`}>{value}</p>
      <p className={`text-xs ${isDarkMode ? "text-neutral-500" : "text-neutral-500"}`}>{label}</p>
    </div>
  );
}