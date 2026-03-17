import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Paperclip,
  Calendar,
  User as UserIcon,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import dashboardService from "../../../../../services/dashboardService"; // Adjust path if needed

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // --- DATA MOUNTING ENGINE ---
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // Call the actual backend!
        const response = await dashboardService.getNoticeBoard();

        // Stress Test: Ensure we actually got the data array
        if (response && response.success) {
          setAnnouncements(response.data || []);
        } else {
          setAnnouncements([]);
        }
      } catch (error) {
        console.error("Notice Board Error:", error);
        toast.error("Failed to sync notice board.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // --- UX ENGINE: Real-time search and filtering ---
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      // Defensive check: Ensure title and content exist before calling .toLowerCase()
      const title = ann.title || "";
      const content = ann.content || "";

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = activeFilter === "All" || ann.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [announcements, searchQuery, activeFilter]);

  // Date Formatter
  const formatDate = (dateString) => {
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white p-8 flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-500 text-sm font-bold tracking-widest uppercase">
          Decrypting Feed...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER & SEARCH BARS */}
        <header className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Notice Board
            </h1>
            <p className="text-neutral-400 text-sm">
              Every broadcast, note, and update for your cohort.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input - Sleeker design */}
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search keywords or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            {/* UI UPGRADE: Professional Segmented Control */}
            <div className="flex bg-[#0D0D0D] p-1.5 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto scrollbar-hide">
              {["All", "General", "Assignment", "Urgent"].map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 text-white shadow-sm" // Sleek, modern active state
                        : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ANNOUNCEMENT FEED */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[#0D0D0D] border border-white/5 rounded-[32px]">
              <div className="bg-white/5 p-4 rounded-full mb-4">
                <Filter size={32} className="text-neutral-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                No matches found
              </h3>
              <p className="text-neutral-500 text-sm text-center max-w-sm">
                We couldn't find any announcements matching "{searchQuery}" in
                the {activeFilter} category.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => (
              <div
                key={ann._id}
                className={`bg-[#0D0D0D] border rounded-[24px] p-6 transition-all duration-300 ${
                  ann.type === "Urgent"
                    ? "border-red-500/30 hover:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        ann.type === "Urgent"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {ann.type === "Urgent" ? (
                        <AlertCircle size={20} />
                      ) : (
                        <UserIcon size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {ann.lecturer?.name || "Faculty Member"}
                      </h4>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> {formatDate(ann.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2">
                    {ann.type === "Urgent" && (
                      <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Urgent
                      </span>
                    )}
                    {ann.course && (
                      <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <BookOpen size={10} /> {ann.course.code || "Course"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="sm:pl-13 space-y-3">
                  <h3 className="text-xl font-bold text-white leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>

                  {/* Attachments UI - Professional Pill Design */}
                  {ann.attachments && ann.attachments.length > 0 && (
                    <div className="pt-5 mt-5 border-t border-white/5 flex flex-wrap gap-3">
                      {ann.attachments.map((file, idx) => {
                        // Extract filename from the URL for a cleaner look
                        const fileName =
                          file.split("/").pop() || `Attachment ${idx + 1}`;
                        return (
                          <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-neutral-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all group"
                          >
                            <Paperclip
                              size={14}
                              className="text-neutral-500 group-hover:text-blue-400 transition-colors"
                            />
                            <span className="truncate max-w-[200px]">
                              {fileName}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
