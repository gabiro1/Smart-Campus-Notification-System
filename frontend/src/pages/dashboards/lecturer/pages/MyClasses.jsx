import React, { useState, useEffect, useMemo } from "react";
import GlassCard from "../components/GlassCard"; // Adjust path if needed
import {
  Users,
  GraduationCap,
  MoreHorizontal,
  Loader2,
  Mail,
  Search,
} from "lucide-react";
import classService from "../../../../services/classService";

export default function MyClasses() {
  // --- State Management ---
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [error, setError] = useState("");

  const [selectedClass, setSelectedClass] = useState(null);
  const [roster, setRoster] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // New state for the student search bar
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. Fetch Classes on Mount ---
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        setError(""); // Clear any old errors
        const data = await classService.getMyClasses();
        setClasses(data);
      } catch (err) {
        // Safely extract the error message from the API response
        setError(
          err.response?.data?.message ||
            "Failed to load your classes. Please try again.",
        );
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // --- 2. Fetch Class Roster ---
  const handleSelectClass = async (cls) => {
    // Prevent fetching again if they click the already selected class
    if (selectedClass?._id === cls._id) return;

    setSelectedClass(cls);
    setIsLoadingRoster(true);
    setRoster([]);
    setSearchQuery(""); // Reset search when changing classes

    try {
      const data = await classService.getClassStudents(cls._id);
      setRoster(data);
    } catch (err) {
      console.error("Roster fetch error:", err);
      // In a real app, you might show a toast notification here
    } finally {
      setIsLoadingRoster(false);
    }
  };

  // --- 3. Optimized Local Search ---
  // useMemo remembers the filtered list so React doesn't recalculate it on every tiny render
  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return roster;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return roster.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerCaseQuery) ||
        student.email.toLowerCase().includes(lowerCaseQuery),
    );
  }, [roster, searchQuery]);

  // --- Render Loading / Error States ---
  if (isLoadingClasses) {
    return (
      <div className="flex h-64 items-center justify-center text-blue-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center mt-10 p-4 bg-red-400/10 border border-red-400/20 rounded-xl">
        {error}
      </div>
    );
  }

  // --- Main UI Render ---
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          My Classes
        </h1>
        <p className="text-neutral-400">
          Monitor your assigned modules and view student enrollments.
        </p>
      </header>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white/5 border border-white/10 rounded-xl">
            <p className="text-neutral-400">
              You are not assigned to any classes yet.
            </p>
          </div>
        ) : (
          classes.map((cls, idx) => (
            <GlassCard
              key={cls._id}
              delay={idx * 0.1}
              onClick={() => handleSelectClass(cls)}
              className={`flex flex-col relative group cursor-pointer border transition-all duration-300 ${
                selectedClass?._id === cls._id
                  ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  : "border-white/5 hover:border-blue-500/50 hover:bg-white/5"
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // Stops the card click event from firing
                    console.log("Open menu for", cls.name);
                  }}
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div
                className={`p-3 w-fit rounded-xl border mb-4 group-hover:scale-110 transition-transform duration-500 ${
                  selectedClass?._id === cls._id
                    ? "bg-blue-500/20 border-blue-500/40"
                    : "bg-blue-500/10 border-blue-500/20"
                }`}
              >
                <GraduationCap size={24} className="text-blue-400" />
              </div>

              <h3
                className="text-xl font-bold text-white mb-1 truncate"
                title={cls.name}
              >
                {cls.name}
              </h3>
              <p className="text-sm text-neutral-400 font-medium mb-6">
                {cls.code} • {cls.level}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Enrolled</p>
                  <p className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users size={14} className="text-blue-400" />{" "}
                    {cls.studentCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Status</p>
                  <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active
                  </p>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Roster / Detail Area */}
      <GlassCard delay={0.4} className="min-h-[400px] border-dashed">
        {!selectedClass ? (
          // Empty State: No class selected
          <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto border border-white/5">
              <Users size={28} className="text-neutral-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">
                No Class Selected
              </h3>
              <p className="text-neutral-400 max-w-sm mx-auto">
                Select a class card above to view the detailed student roster
                and manage course attendees.
              </p>
            </div>
          </div>
        ) : (
          // Roster View
          <div className="p-2 flex flex-col h-full min-h-[400px]">
            {/* Roster Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedClass.name}
                </h2>
                <p className="text-neutral-400 text-sm">
                  {selectedClass.code} • Student Roster ({roster.length})
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoadingRoster || roster.length === 0}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Roster List */}
            {isLoadingRoster ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2
                  className="animate-spin text-blue-400 mb-2"
                  size={32}
                />
                <p className="text-neutral-500 text-sm">
                  Loading student records...
                </p>
              </div>
            ) : roster.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-neutral-500 text-center py-10">
                  No students are currently enrolled in this class.
                </p>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-neutral-500 text-center py-10">
                  No students found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                {filteredRoster.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar Placeholder */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/10 uppercase">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                          {student.name}
                        </p>
                        <p className="text-neutral-500 text-xs">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`mailto:${student.email}`}
                      className="p-2 bg-white/5 hover:bg-blue-500/20 text-neutral-400 hover:text-blue-400 rounded-md transition-colors tooltip-trigger"
                      title="Send Email"
                    >
                      <Mail size={16} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
