import React, { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/shared"; 
import ClassCard from "../components/ClassCard";
import {
  Users,
  GraduationCap,
  MoreHorizontal,
  Loader2, 
  Mail,
  Search,
} from "lucide-react";
import classService from "../../../../services/classService";
import LoadingSpinner from '../../../../components/ui/LoadingSpinner.jsx'

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
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-400 text-lg font-semibold mb-2">Error</p>
        <p className="text-muted-foreground max-w-md text-center">{error}</p>
      </div>
    );
  }

  // --- Main UI Render ---
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
          My Classes
        </h1>
        <p className="text-muted-foreground">
          Monitor your assigned modules and view student enrollments.
        </p>
      </header>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title="No Classes Assigned"
              description="You are not assigned to any classes yet. Contact your department administrator for assistance."
            />
          </div>
        ) : (
          classes.map((cls, idx) => (
            <div key={cls._id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <ClassCard
                cls={cls}
                onClick={() => handleSelectClass(cls)}
                isSelected={selectedClass?._id === cls._id}
              />
            </div>
          ))
        )}
      </div>

      {/* Roster / Detail Area */}
      <GlassCard delay={0.4} className="min-h-[400px] border-dashed">
        {!selectedClass ? (
          // Empty State: No class selected
          <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto border border-border">
              <Users size={28} className="text-neutral-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                No Class Selected
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Select a class card above to view the detailed student roster
                and manage course attendees.
              </p>
            </div>
          </div>
        ) : (
          // Roster View
          <div className="p-2 flex flex-col h-full min-h-[400px]">
            {/* Roster Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedClass.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {selectedClass.code} • Student Roster ({roster.length})
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoadingRoster || roster.length === 0}
                  className="w-full bg-accent border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors disabled:opacity-50"
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
                <p className="text-muted-foreground text-sm">
                  Loading student records...
                </p>
              </div>
            ) : roster.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-center py-10">
                  No students are currently enrolled in this class.
                </p>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-center py-10">
                  No students found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                {filteredRoster.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-border hover:bg-accent hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar Placeholder */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/10 uppercase">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-foreground font-medium group-hover:text-blue-400 transition-colors">
                          {student.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`mailto:${student.email}`}
                      className="p-2 bg-accent hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400 rounded-md transition-colors tooltip-trigger"
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
