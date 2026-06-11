import { useState } from "react";
import GlassCard from "../../../../components/cards/GlassCard";
import {
  Search,
  Filter,
  Eye,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockAnnouncements = [
  {
    id: 1,
    title: "Department Meeting Rescheduled",
    sender: "Dr. K. Lee",
    target: "All Staff",
    date: "Oct 24, 2026",
    status: "Published",
  },
  {
    id: 2,
    title: "Lab Schedule Update",
    sender: "Prof. R. Vance",
    target: "Year 1 & 2",
    date: "Oct 23, 2026",
    status: "Published",
  },
  {
    id: 3,
    title: "Exam Invigilation Roster",
    sender: "Dr. A. Smith",
    target: "All Lecturers",
    date: "Oct 21, 2026",
    status: "Published",
  },
  {
    id: 4,
    title: "Department Budget Proposal",
    sender: "HoD Office",
    target: "All Staff",
    date: "Oct 20, 2026",
    status: "Archived",
  },
  {
    id: 5,
    title: "Guest Lecture Announcement",
    sender: "Dr. M. Johnson",
    target: "Year 3 & 4",
    date: "Oct 18, 2026",
    status: "Published",
  },
];

export default function AllAnnouncements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const filteredData = mockAnnouncements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Department Announcements
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review all announcements published within your department.
        </p>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or sender..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="md:col-span-3">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-muted-foreground focus:outline-none focus:border-blue-500/50 appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-end gap-3">
            <button className="flex items-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
              <CalendarDays size={18} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors text-sm font-medium">
              <Filter size={16} /> Advanced Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="p-5 font-semibold">Announcement Details</th>
                <th className="p-5 font-semibold">Target Group</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-5">
                    <p className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      By {item.sender} • {item.date}
                    </p>
                  </td>
                  <td className="p-5">
                    <span className="px-2.5 py-1 text-xs font-medium bg-white/5 rounded-md border border-white/5 text-muted-foreground">
                      {item.target}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium ${item.status === "Published" ? "text-emerald-400" : "text-muted-foreground"}`}
                    >
                      <CheckCircle2 size={14} /> {item.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => setSelectedAnnouncement(item)}
                      className="p-2 text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-white/10 rounded-2xl p-8 shadow-2xl z-10"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {selectedAnnouncement.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b border-white/10 pb-4 mb-6">
                <span>
                  <strong>From:</strong> {selectedAnnouncement.sender}
                </span>
                <span>
                  <strong>Date:</strong> {selectedAnnouncement.date}
                </span>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed mb-8 bg-white/[0.02] border border-white/5 p-6 rounded-xl min-h-[150px]">
                [Announcement body content would go here. This modal allows the
                HoD to review details of department announcements.]
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-foreground rounded-xl transition-colors font-medium text-sm"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
