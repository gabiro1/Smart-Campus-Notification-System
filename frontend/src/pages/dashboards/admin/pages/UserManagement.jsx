import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  X,
  Edit3,
  User as UserIcon,
  Mail,
  Building,
  GraduationCap,
  Save,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import ThemedToaster from "../../../../components/ui/ThemedToaster";
import adminService from "../../../../services/adminService";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    college: "",
    school: "",
    department: "",
    level: "",
  });

  // Academic hierarchy data
  const [hierarchy, setHierarchy] = useState({});
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);

  // Fetch hierarchy on mount
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoadingHierarchy(true);
        const data = await adminService.getHierarchy();
        setHierarchy(data.data || {});
      } catch (error) {
        console.error("Failed to fetch hierarchy:", error);
      } finally {
        setLoadingHierarchy(false);
      }
    };
    fetchHierarchy();
  }, []);

  // Computed options based on selections
  const collegeOptions = Object.keys(hierarchy);
  const schoolOptions = hierarchy[formData.college] ? Object.keys(hierarchy[formData.college]) : [];
  const departmentOptions = hierarchy[formData.college]?.[formData.school] || [];

  // View/Edit Drawer State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (roleFilter) filters.role = roleFilter;

      const data = await adminService.getUsers(page, 10, filters);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, roleFilter]);

  // Handle Form Submission for New User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.createUser(formData);
      toast.success("User registered successfully");
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
        college: "",
        school: "",
        department: "",
        level: "",
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle User Deletion
  const handleDelete = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (
      !window.confirm(
        `CRITICAL ACTION: Are you sure you want to permanently delete ${name}? All their associated data will be purged.`,
      )
    )
      return;
    try {
      await adminService.deleteUser(id);
      toast.success("User and associated data purged");
      if (selectedUser && selectedUser._id === id) closeDrawer();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  // Handle Inline Role Promotion
  const handleRoleChange = async (id, newRole, e) => {
    if (e) e.stopPropagation();
    try {
      await adminService.promoteUser(id, newRole);
      toast.success(
        `Role successfully updated to ${newRole.replace("_", " ")}`,
      );
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Role update failed");
    }
  };

  // Open the Right Side Drawer (Added initialEditMode parameter)
  const openDrawer = (user, initialEditMode = false) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college || "",
      school: user.school || "",
      department: user.department || "",
      profilePicture: user.profilePicture || "",
    });
    setImagePreview(user.profilePicture || null);
    setIsEditMode(initialEditMode);
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setImagePreview(null);
  };

  // Handle Profile Picture Selection (Preview)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      reader.onload = () =>
        setEditFormData({ ...editFormData, profilePicture: reader.result });
    }
  };

  // Handle Update User from Drawer (Now connected to database)
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // ACTUAL API CALL to update user in the database
      // Make sure adminService.updateUser is defined and calls PUT /api/admin/users/:id
      await adminService.updateUser(selectedUser._id, editFormData);

      toast.success("User profile updated successfully");
      fetchUsers(); // Refresh the table behind the drawer
      setSelectedUser({ ...selectedUser, ...editFormData }); // Update local drawer state
      setIsEditMode(false); // Switch back to view mode
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 lg:p-12 relative overflow-hidden w-full">
      <ThemedToaster />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black tracking-tight">Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage institutional accounts, roles, and permissions.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} /> Add User
        </motion.button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full bg-card border border-border rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 focus:bg-card outline-none transition-all text-sm shadow-xl"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 bg-card border border-border rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer shadow-xl"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="guild_president">Guild President</option>
            <option value="lecturer">Lecturer</option>
            <option value="hod">Head of Dept</option>
            <option value="dean">Dean</option>
            <option value="principal">Principal</option>
            <option value="admin">System Admin</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden shadow-2xl">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Activity className="animate-spin text-blue-500" size={32} />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Querying Database...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-accent text-[10px] uppercase font-black text-muted-foreground tracking-widest border-b border-border">
                <tr>
                  <th className="p-6">User Profile</th>
                  <th className="p-6">Role & Permissions</th>
                  <th className="p-6">Academic Unit</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-12 text-center text-muted-foreground font-bold uppercase tracking-widest"
                      >
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={user._id}
                        onClick={() => openDrawer(user, false)}
                        className="hover:bg-accent transition-colors group cursor-pointer"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            {/* DYNAMIC AVATAR */}
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-black shrink-0 overflow-hidden border border-blue-500/20">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-foreground group-hover:text-blue-400 transition-colors">
                                {user.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <select
                            value={user.role}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value, e)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none border ${
                              user.role === "admin"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : user.role === "principal"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : user.role === "dean"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : user.role === "hod" ||
                                        user.role === "lecturer"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      : "bg-neutral-800 text-muted-foreground border-neutral-700 hover:bg-neutral-700"
                            }`}
                          >
                            <option value="student">Student</option>
                            <option value="guild_president">
                              Guild President
                            </option>
                            <option value="lecturer">Lecturer</option>
                            <option value="hod">HoD</option>
                            <option value="dean">Dean</option>
                            <option value="principal">Principal</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-6">
                          <div className="text-sm text-foreground font-medium">
                            {user.department || "N/A"}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
                            {user.college ? `${user.college} - ` : ""}{" "}
                            {user.school || "No School"}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-end gap-2">
                            {/* EDIT BUTTON */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDrawer(user, true);
                              }}
                              className="p-2.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                              title="Edit User"
                            >
                              <Edit3 size={18} />
                            </button>
                            {/* DELETE BUTTON */}
                            <button
                              onClick={(e) =>
                                handleDelete(user._id, user.name, e)
                              }
                              className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Purge User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-accent">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider pl-4">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2 pr-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-accent hover:bg-primary/10 disabled:opacity-30 rounded-lg"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-accent hover:bg-primary/10 disabled:opacity-30 rounded-lg"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* 1. RIGHT-SIDE SLIDE OVER DRAWER (VIEW/EDIT) */}
      {/* ========================================= */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-8 border-b border-border relative bg-card">
                <button
                  onClick={closeDrawer}
                  className="absolute top-6 right-6 p-2 bg-accent hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col items-center mt-4 text-center">
                  {/* EDITABLE AVATAR */}
                  <div className="relative group mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-black text-foreground text-3xl shadow-xl shadow-blue-500/20 overflow-hidden border-2 border-[#111]">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedUser.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Camera Overlay (Only visible in edit mode) */}
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera size={24} className="text-foreground" />
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <h2 className="text-xl font-black text-foreground">
                    {selectedUser.name}
                  </h2>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                    {selectedUser.role.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* Toggle View/Edit */}
                <div className="flex bg-card p-1 rounded-xl mb-6 border border-border">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isEditMode ? "bg-accent text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Profile Details
                  </button>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${isEditMode ? "bg-blue-600 text-foreground shadow-md shadow-blue-900/20" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Edit3 size={14} /> Edit User
                  </button>
                </div>

                {!isEditMode ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                        Contact Information
                      </h3>
                      <InfoRow
                        icon={<UserIcon size={16} />}
                        label="Full Name"
                        value={selectedUser.name}
                      />
                      <InfoRow
                        icon={<Mail size={16} />}
                        label="Email Address"
                        value={selectedUser.email}
                      />
                    </div>
                    <hr className="border-border" />
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                        Academic Placement
                      </h3>
                      <InfoRow
                        icon={<Building size={16} />}
                        label="College"
                        value={selectedUser.college || "Not Assigned"}
                      />
                      <InfoRow
                        icon={<Building size={16} />}
                        label="School"
                        value={selectedUser.school || "Not Assigned"}
                      />
                      <InfoRow
                        icon={<GraduationCap size={16} />}
                        label="Department"
                        value={selectedUser.department || "Not Assigned"}
                      />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                        Full Name
                      </label>
                      <input
                        required
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-card border border-border p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        value={editFormData.email}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            email: e.target.value,
                          })
                        }
                        className="w-full bg-card border border-border p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                        System Role
                      </label>
                      <select
                        value={editFormData.role}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            role: e.target.value,
                          })
                        }
                        className="w-full bg-card border border-border p-3 rounded-xl focus:border-blue-500 outline-none text-sm appearance-none cursor-pointer text-foreground"
                      >
                        <option value="student">Student</option>
                        <option value="guild_president">Guild President</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="hod">Head of Dept</option>
                        <option value="dean">Dean</option>
                        <option value="principal">Principal</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </div>
                    <hr className="border-border my-4" />
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                        College
                      </label>
                      <input
                        placeholder="e.g. CST"
                        value={editFormData.college}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            college: e.target.value,
                          })
                        }
                        className="w-full bg-card border border-border p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                        School
                      </label>
                      <input
                        placeholder="e.g. School of ICT"
                        value={editFormData.school}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            school: e.target.value,
                          })
                        }
                        className="w-full bg-card border border-border p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                        Department
                      </label>
                      <input
                        placeholder="e.g. Information Technology"
                        value={editFormData.department}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            department: e.target.value,
                          })
                        }
                        className="w-full bg-card border border-border p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full bg-blue-600 text-foreground p-4 rounded-xl font-black tracking-widest uppercase text-sm mt-6 hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                      {isUpdating ? (
                        <Activity className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================= */}
      {/* 2. CREATE NEW USER MODAL (Centered) */}
      {/* ========================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card p-8 rounded-[24px] border border-border w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black mb-2 tracking-tight">
                Register User
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Add a new institutional account directly to the database.
              </p>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Institutional Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                  />
                </div>

                <input
                  required
                  type="password"
                  placeholder="Temporary Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground"
                />

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                    Initial Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="guild_president">Guild President</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="hod">Head of Dept</option>
                    <option value="dean">Dean</option>
                    <option value="principal">Principal</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <hr className="border-border my-4" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                      College
                    </label>
                    <select
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value, school: "", department: "" })}
                      disabled={loadingHierarchy}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">{loadingHierarchy ? "Loading..." : "Select College"}</option>
                      {collegeOptions.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                      School
                    </label>
                    <select
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value, department: "" })}
                      disabled={!formData.college || loadingHierarchy}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">{!formData.college ? "Select college first" : "Select School"}</option>
                      {schoolOptions.map(sch => (
                        <option key={sch} value={sch}>{sch}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={!formData.school || loadingHierarchy}
                    className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                  >
                    <option value="">{!formData.school ? "Select school first" : "Select Department"}</option>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {(formData.role === "student") && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">
                      Year / Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full bg-card border border-border p-4 rounded-xl focus:border-blue-500 outline-none text-sm text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">Select Year</option>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                      <option value="Year 5">Year 5</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-foreground p-4 rounded-xl font-black tracking-widest uppercase text-sm mt-4 hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <Activity className="animate-spin" size={20} />
                  ) : (
                    "Save User Record"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for Drawer Display Data
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-3 bg-accent border border-border rounded-xl hover:bg-accent transition-colors">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}
