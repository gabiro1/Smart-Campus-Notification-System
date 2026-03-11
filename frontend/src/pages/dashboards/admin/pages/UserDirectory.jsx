import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  X,
  Award,
  Bell,
  ChevronLeft,
  ChevronRight,
  Edit3,
  User as UserIcon,
  Building,
  GraduationCap,
  Save,
  Camera,
  Eye,
} from "lucide-react";
import adminService from "../../../../services/adminService";
import toast, { Toaster } from "react-hot-toast";

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Profile Drawer States
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailedUser, setDetailedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit Mode States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch Directory List (Table Data)
  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (roleFilter) filters.role = roleFilter;
      if (deptFilter) filters.department = deptFilter;

      // Fetch with pagination
      const data = await adminService.getUsers(page, 15, filters);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to search directory",
      );
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDirectory();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter, deptFilter, page]);

  // Open Drawer and Fetch Individual User Details & Stats
  const openProfile = async (userId, startInEditMode = false) => {
    setSelectedUserId(userId);
    setLoadingDetails(true);
    setIsEditMode(startInEditMode);

    try {
      const data = await adminService.getUser(userId);
      setDetailedUser(data);

      // Pre-fill edit form data from the fetched detailed user
      const u = data.user;
      setEditFormData({
        name: u.name,
        email: u.email,
        phoneNumber: u.phoneNumber || "",
        role: u.role,
        college: u.college || "",
        school: u.school || "",
        department: u.department || "",
        profilePicture: u.profilePicture || "",
      });
      setImagePreview(u.profilePicture || null);
    } catch (error) {
      toast.error("Failed to load user profile");
      closeProfile();
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeProfile = () => {
    setSelectedUserId(null);
    setDetailedUser(null);
    setIsEditMode(false);
    setImagePreview(null);
  };

  // Handle Profile Picture Selection (Preview)
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      reader.onload = () =>
        setEditFormData({ ...editFormData, profilePicture: reader.result });
    }
  };

  // Handle Update User from Drawer
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Send update to backend
      const res = await adminService.updateUser(
        detailedUser.user._id,
        editFormData,
      );

      toast.success("User profile updated successfully");

      // Update local state so drawer doesn't need to re-fetch
      setDetailedUser({
        ...detailedUser,
        user: { ...detailedUser.user, ...res.user }, // Assuming backend returns updated user
      });

      // Refresh background table
      fetchDirectory();
      setIsEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-12 overflow-x-hidden relative w-full">
      <Toaster theme="dark" position="top-right" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-black tracking-tight">Global Directory</h1>
        <p className="text-neutral-500 mt-1">
          Search and manage all contacts across the university network.
        </p>
      </motion.div>

      {/* Advanced Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            size={20}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search students, lecturers, admins by name or email..."
            className="w-full bg-[#0D0D0D] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-all text-sm shadow-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative w-40">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0D0D0D] border border-white/5 rounded-2xl py-4 pl-10 pr-4 focus:border-blue-500 outline-none transition-all text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="hod">HoD</option>
              <option value="dean">Dean</option>
              <option value="principal">Principal</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="relative w-48">
            <MapPin
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              placeholder="Department..."
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0D0D0D] border border-white/5 rounded-2xl py-4 pl-10 pr-4 focus:border-blue-500 outline-none transition-all text-xs font-bold uppercase tracking-wider"
            />
          </div>
        </div>
      </motion.div>

      {/* DIRECTORY DATA TABLE */}
      <div className="bg-[#0D0D0D] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Activity className="animate-spin text-blue-500" size={32} />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Scanning Directory...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] text-[10px] uppercase font-black text-neutral-500 tracking-widest border-b border-white/5">
                <tr>
                  <th className="p-6">User Profile</th>
                  <th className="p-6">Role</th>
                  <th className="p-6">Academic Unit</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-12 text-center text-neutral-500 font-bold uppercase tracking-widest"
                      >
                        No contacts found matching your criteria.
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
                        onClick={() => openProfile(user._id, false)}
                        className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
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
                              <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                {user.name}
                              </div>
                              <div className="text-xs text-neutral-500 mt-0.5">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                              user.role === "admin"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : user.role === "principal"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : user.role === "dean"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : user.role === "hod" ||
                                        user.role === "lecturer"
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                            }`}
                          >
                            {user.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="text-sm text-neutral-300 font-medium">
                            {user.department || "N/A"}
                          </div>
                          <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mt-1">
                            {user.college ? `${user.college} - ` : ""}{" "}
                            {user.school || "No School"}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProfile(user._id, false);
                              }}
                              className="p-2.5 text-neutral-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                              title="View Profile"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProfile(user._id, true);
                              }}
                              className="p-2.5 text-neutral-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                              title="Edit User"
                            >
                              <Edit3 size={18} />
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

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider pl-4">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2 pr-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* RIGHT-SIDE SLIDE OVER DRAWER (VIEW/EDIT)  */}
      {/* ========================================= */}
      <AnimatePresence>
        {selectedUserId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProfile}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 shadow-2xl flex flex-col"
            >
              {loadingDetails || !detailedUser ? (
                <div className="h-full flex items-center justify-center">
                  <Activity className="animate-spin text-blue-500" size={32} />
                </div>
              ) : (
                <>
                  {/* Drawer Header */}
                  <div className="p-8 border-b border-white/5 relative bg-[#111]">
                    <button
                      onClick={closeProfile}
                      className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>

                    <div className="flex flex-col items-center mt-4 text-center">
                      {/* EDITABLE AVATAR */}
                      <div className="relative group mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-3xl shadow-xl shadow-blue-500/20 overflow-hidden border-2 border-[#111]">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            detailedUser.user.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Camera Overlay (Only visible in edit mode) */}
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Camera size={24} className="text-white" />
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

                      <h2 className="text-2xl font-black text-white">
                        {detailedUser.user.name}
                      </h2>
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                        {detailedUser.user.role.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Drawer Body (Scrollable) */}
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Toggle View/Edit */}
                    <div className="flex bg-[#111] p-1 rounded-xl mb-6 border border-white/5">
                      <button
                        onClick={() => setIsEditMode(false)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isEditMode ? "bg-[#222] text-white shadow-md" : "text-neutral-500 hover:text-neutral-300"}`}
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => setIsEditMode(true)}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${isEditMode ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "text-neutral-500 hover:text-neutral-300"}`}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                    </div>

                    {!isEditMode ? (
                      /* VIEW MODE */
                      <div className="space-y-8">
                        {/* Contact Info */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] uppercase font-black tracking-widest text-neutral-500">
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            <InfoRow
                              icon={<Mail size={16} />}
                              label="Email"
                              value={detailedUser.user.email}
                            />
                            <InfoRow
                              icon={<Phone size={16} />}
                              label="Phone"
                              value={
                                detailedUser.user.phoneNumber || "Not provided"
                              }
                            />
                            <InfoRow
                              icon={<Calendar size={16} />}
                              label="Joined"
                              value={new Date(
                                detailedUser.user.createdAt,
                              ).toLocaleDateString()}
                            />
                          </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* Academic Placement */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] uppercase font-black tracking-widest text-neutral-500">
                            Academic Placement
                          </h3>
                          <InfoRow
                            icon={<Building size={16} />}
                            label="College"
                            value={detailedUser.user.college || "Not Assigned"}
                          />
                          <InfoRow
                            icon={<Building size={16} />}
                            label="School"
                            value={detailedUser.user.school || "Not Assigned"}
                          />
                          <InfoRow
                            icon={<GraduationCap size={16} />}
                            label="Department"
                            value={
                              detailedUser.user.department || "Not Assigned"
                            }
                          />
                        </div>

                        <hr className="border-white/5" />

                        {/* Communication History Stats */}
                        <div className="space-y-4">
                          <h3 className="text-[10px] uppercase font-black tracking-widest text-neutral-500">
                            Communication History
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <StatBox
                              icon={
                                <Award size={18} className="text-blue-500" />
                              }
                              label="Events Created"
                              value={detailedUser.stats.eventsCreated}
                              bg="bg-blue-500/10"
                            />
                            <StatBox
                              icon={
                                <Bell size={18} className="text-purple-500" />
                              }
                              label="Notifs Received"
                              value={detailedUser.stats.notificationsReceived}
                              bg="bg-purple-500/10"
                            />
                            <StatBox
                              icon={
                                <Calendar
                                  size={18}
                                  className="text-amber-500"
                                />
                              }
                              label="Personal Reminders"
                              value={detailedUser.stats.remindersCreated}
                              bg="bg-amber-500/10"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* EDIT MODE FORM */
                      <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
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
                            className="w-full bg-[#111] border border-white/5 p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
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
                              className="w-full bg-[#111] border border-white/5 p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
                              Phone Number
                            </label>
                            <input
                              value={editFormData.phoneNumber}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  phoneNumber: e.target.value,
                                })
                              }
                              placeholder="+250..."
                              className="w-full bg-[#111] border border-white/5 p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
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
                            className="w-full bg-[#111] border border-white/5 p-3 rounded-xl focus:border-blue-500 outline-none text-sm appearance-none cursor-pointer text-white"
                          >
                            <option value="student">Student</option>
                            <option value="guild_president">
                              Guild President
                            </option>
                            <option value="lecturer">Lecturer</option>
                            <option value="hod">Head of Dept</option>
                            <option value="dean">Dean</option>
                            <option value="principal">Principal</option>
                            <option value="admin">System Admin</option>
                          </select>
                        </div>
                        <hr className="border-white/5 my-4" />
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
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
                            className="w-full bg-[#111] border border-white/5 p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
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
                            className="w-full bg-[#111] border border-white/5 p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider pl-1">
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
                            className="w-full bg-[#111] border border-white/5 p-3 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="w-full bg-blue-600 text-white p-4 rounded-xl font-black tracking-widest uppercase text-sm mt-6 hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20"
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
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponents for Drawer
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
      <div className="text-neutral-500 mt-0.5">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          {label}
        </p>
        <p className="text-sm font-medium text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, bg }) {
  return (
    <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col gap-2 shadow-inner">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1 leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}
