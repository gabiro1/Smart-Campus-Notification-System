import { useState } from "react";
import GlassCard from "../components/GlassCard";
import {
  Search,
  Filter,
  Eye,
  CalendarDays,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockAnnouncements = [
  {
    id: 1,
    title: "Revised Exam Timetable",
    dept: "Mathematics",
    sender: "Dr. K. Lee",
    target: "All Math",
    date: "Oct 24, 2026",
    status: "Published",
  },
  {
    id: 2,
    title: "Lab Safety Protocol Update",
    dept: "Physics",
    sender: "Prof. R. Vance",
    target: "Year 1 & 2",
    date: "Oct 23, 2026",
    status: "Published",
  },
  {
    id: 3,
    title: "CS Career Fair Registration",
    dept: "Computer Science",
    sender: "Dr. A. Smith",
    target: "Year 3 & 4",
    date: "Oct 21, 2026",
    status: "Published",
  },
  {
    id: 4,
    title: "Engineering Workshop Closure",
    dept: "Engineering",
    sender: "Prof. M. Johnson",
    target: "All Engineering",
    date: "Oct 20, 2026",
    status: "Archived",
  },
  {
    id: 5,
    title: "Dean's List Nominations",
    dept: "All Departments",
    sender: "Dean's Office",
    target: "All Staff",
    date: "Oct 18, 2026",
    status: "Published",
  },
];

export default function AllAnnouncements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const filteredData = mockAnnouncements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      filterDept === "All" ||
      item.dept === filterDept ||
      item.dept === "All Departments";
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          College Communications Archive
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Search and review every announcement dispatched across the college.
        </p>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[600px]">
        {/* Filters Toolbar */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or sender..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="md:col-span-3">
            <div className="relative">
              <Building2
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={16}
              />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 appearance-none"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-4 flex justify-end gap-3">
            <button className="flex items-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
              <CalendarDays size={18} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium">
              <Filter size={16} /> Advanced Filters
            </button>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                <th className="p-5 font-semibold">Announcement Details</th>
                <th className="p-5 font-semibold">Department</th>
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
                    <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      By {item.sender} • {item.date}
                    </p>
                  </td>
                  <td className="p-5 text-sm text-neutral-300">{item.dept}</td>
                  <td className="p-5">
                    <span className="px-2.5 py-1 text-xs font-medium bg-white/5 rounded-md border border-white/5 text-neutral-400">
                      {item.target}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium ${item.status === "Published" ? "text-emerald-400" : "text-neutral-500"}`}
                    >
                      <CheckCircle2 size={14} /> {item.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => setSelectedAnnouncement(item)}
                      className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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

      {/* Preview Modal */}
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
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl z-10"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedAnnouncement.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-400 border-b border-white/10 pb-4 mb-6">
                <span>
                  <strong>From:</strong> {selectedAnnouncement.sender}
                </span>
                <span>
                  <strong>Dept:</strong> {selectedAnnouncement.dept}
                </span>
                <span>
                  <strong>Date:</strong> {selectedAnnouncement.date}
                </span>
              </div>
              <div className="text-sm text-neutral-300 leading-relaxed mb-8 bg-white/[0.02] border border-white/5 p-6 rounded-xl min-h-[150px]">
                [Announcement body content would go here. This modal allows the
                Dean to review exactly what was sent out to the students.]
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium text-sm"
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
