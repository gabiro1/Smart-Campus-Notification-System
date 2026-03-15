import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  Mail,
  Phone,
  X,
  Loader2,
} from "lucide-react";

const LecturerManagement = () => {
  // --- STATE ---
  const [lecturers, setLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    lecturerId: null,
  });
  const [selectedClassId, setSelectedClassId] = useState("");

  const [removeModal, setRemoveModal] = useState({
    isOpen: false,
    lecturerId: null,
    classId: null,
    className: "",
    lecturerName: "",
  });

  const [processingAction, setProcessingAction] = useState(false);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Run both API calls at the same time for better performance
      const [lecturersRes, classesRes] = await Promise.all([
        axios.get("/api/hod/lecturers"),
        axios.get("/api/classes"),
      ]);
      setLecturers(lecturersRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load department data. Please check your connection.");
      toast.error("Failed to load department data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---
  const handleAssignClass = async (e) => {
    e.preventDefault();
    if (!selectedClassId) return;

    setProcessingAction(true);
    try {
      await axios.post(`/api/hod/lecturers/${assignModal.lecturerId}/assign`, {
        classId: selectedClassId,
      });
      // Refresh data to show changes
      await fetchData();
      toast.success("Class assigned successfully!");
      setAssignModal({ isOpen: false, lecturerId: null });
      setSelectedClassId("");
    } catch (err) {
      toast.error("Error assigning class to lecturer.");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRemoveClass = async () => {
    setProcessingAction(true);
    try {
      await axios.delete(
        `/api/hod/lecturers/${removeModal.lecturerId}/remove/${removeModal.classId}`,
      );
      // Refresh data to show changes
      await fetchData();
      toast.success("Class removed successfully!");
      setRemoveModal({
        isOpen: false,
        lecturerId: null,
        classId: null,
        className: "",
        lecturerName: "",
      });
    } catch (err) {
      toast.error("Error removing class from lecturer.");
    } finally {
      setProcessingAction(false);
    }
  };

  // --- FILTERING & PAGINATION ---
  const filteredLecturers = useMemo(() => {
    return lecturers.filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [lecturers, searchQuery]);

  const totalPages = Math.ceil(filteredLecturers.length / itemsPerPage);

  const paginatedLecturers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLecturers.slice(start, start + itemsPerPage);
  }, [filteredLecturers, currentPage]);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- UI RENDER ---
  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8 font-sans">
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#141414",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          success: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Department Lecturers
        </h1>
        <p className="text-neutral-400 mt-2 text-sm">
          Manage class assignments and details for your department's teaching
          staff.
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="ml-auto underline text-xs hover:text-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-neutral-400 font-medium animate-pulse">
            Loading department data...
          </p>
        </div>
      ) : (
        <>
          {/* ---------------- DESKTOP TABLE ---------------- */}
          <div className="hidden md:block overflow-x-auto bg-[#141414] border border-white/10 rounded-2xl shadow-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#1A1A1A] text-neutral-400 uppercase tracking-wider text-xs font-semibold border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Lecturer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Assigned Classes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedLecturers.length > 0 ? (
                  paginatedLecturers.map((lecturer) => (
                    <tr
                      key={lecturer.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                            {lecturer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {lecturer.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              ID: {lecturer.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-neutral-300">
                            <Mail size={14} className="text-neutral-500" />{" "}
                            {lecturer.email}
                          </div>
                          <div className="flex items-center gap-2 text-neutral-300">
                            <Phone size={14} className="text-neutral-500" />{" "}
                            {lecturer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 max-w-[300px]">
                          {lecturer.assignedClasses?.map((cls) => (
                            <div
                              key={cls.id}
                              className="group flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg text-xs font-medium"
                            >
                              <BookOpen size={12} />
                              {cls.name}
                              <button
                                onClick={() =>
                                  setRemoveModal({
                                    isOpen: true,
                                    lecturerId: lecturer.id,
                                    classId: cls.id,
                                    className: cls.name,
                                    lecturerName: lecturer.name,
                                  })
                                }
                                title="Remove class"
                                className="ml-1 text-blue-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-full p-0.5 transition-all"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {(!lecturer.assignedClasses ||
                            lecturer.assignedClasses.length === 0) && (
                            <span className="text-neutral-500 italic text-xs">
                              No classes assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setAssignModal({
                                isOpen: true,
                                lecturerId: lecturer.id,
                              })
                            }
                            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold border border-white/10"
                          >
                            <Plus size={14} /> Assign Class
                          </button>
                          <button
                            title="Edit Info"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-neutral-500"
                    >
                      No lecturers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ---------------- MOBILE CARDS ---------------- */}
          <div className="md:hidden space-y-4">
            {paginatedLecturers.length > 0 ? (
              paginatedLecturers.map((lecturer) => (
                <div
                  key={lecturer.id}
                  className="bg-[#141414] border border-white/10 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                        {lecturer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {lecturer.name}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          ID: {lecturer.id}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-neutral-400 hover:text-white bg-white/5 rounded-lg">
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4 bg-black/50 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 text-sm text-neutral-300">
                      <Mail size={16} className="text-neutral-500" />{" "}
                      {lecturer.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-300">
                      <Phone size={16} className="text-neutral-500" />{" "}
                      {lecturer.phone}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-2">
                      Assigned Classes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lecturer.assignedClasses?.map((cls) => (
                        <div
                          key={cls.id}
                          className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} /> {cls.name}
                          </div>
                          <button
                            onClick={() =>
                              setRemoveModal({
                                isOpen: true,
                                lecturerId: lecturer.id,
                                classId: cls.id,
                                className: cls.name,
                                lecturerName: lecturer.name,
                              })
                            }
                            className="p-1 text-blue-400/60 hover:text-red-400 bg-black/20 hover:bg-red-400/10 rounded-md transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {(!lecturer.assignedClasses ||
                        lecturer.assignedClasses.length === 0) && (
                        <span className="text-neutral-500 italic text-sm">
                          No classes assigned
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setAssignModal({ isOpen: true, lecturerId: lecturer.id })
                    }
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    <Plus size={18} /> Assign New Class
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500 bg-[#141414] rounded-2xl border border-white/10">
                No lecturers found.
              </div>
            )}
          </div>

          {/* ---------------- PAGINATION ---------------- */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-[#141414] p-4 rounded-xl border border-white/10">
              <p className="text-sm text-neutral-400 hidden sm:block">
                Showing{" "}
                <span className="text-white font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="text-white font-medium">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredLecturers.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="text-white font-medium">
                  {filteredLecturers.length}
                </span>
              </p>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "text-neutral-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ---------------- ASSIGN CLASS MODAL ---------------- */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                Assign Class to Lecturer
              </h3>
              <button
                onClick={() =>
                  setAssignModal({ isOpen: false, lecturerId: null })
                }
                className="text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssignClass} className="p-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Select Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>
                  -- Choose a class from the list --
                </option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>

              <div className="mt-8 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setAssignModal({ isOpen: false, lecturerId: null })
                  }
                  className="px-4 py-2 rounded-xl text-sm font-bold text-neutral-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingAction || !selectedClassId}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                >
                  {processingAction ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Save Assignment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- REMOVE CONFIRMATION MODAL ---------------- */}
      {removeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Remove Assignment
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              Are you sure you want to remove{" "}
              <span className="text-white font-bold">
                {removeModal.className}
              </span>{" "}
              from{" "}
              <span className="text-white font-bold">
                {removeModal.lecturerName}
              </span>
              ? This action takes effect immediately.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() =>
                  setRemoveModal({
                    isOpen: false,
                    lecturerId: null,
                    classId: null,
                    className: "",
                    lecturerName: "",
                  })
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveClass}
                disabled={processingAction}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
              >
                {processingAction ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Yes, Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerManagement;
