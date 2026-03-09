import { useState } from "react";
import GlassCard from "../components/GlassCard";
import { Search, Filter, Eye, Check, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Initial Mock Data
const initialApprovals = [
  {
    id: 1,
    hod: "Dr. A. Smith",
    dept: "Computer Science",
    title: "Urgent: Server Maintenance",
    target: "All CS Students",
    date: "Oct 24, 2026",
    status: "Pending Dean",
  },
  {
    id: 2,
    hod: "Prof. M. Johnson",
    dept: "Engineering",
    title: "Workshop Relocation",
    target: "Year 3 & 4",
    date: "Oct 24, 2026",
    status: "Pending Dean",
  },
  {
    id: 3,
    hod: "Dr. K. Lee",
    dept: "Mathematics",
    title: "Math Olympiad Registration",
    target: "All Math Students",
    date: "Oct 23, 2026",
    status: "Pending Dean",
  },
  {
    id: 4,
    hod: "Dr. A. Smith",
    dept: "Computer Science",
    title: "Hackathon Guidelines",
    target: "Year 2",
    date: "Oct 22, 2026",
    status: "Pending Dean",
  },
];

export default function HoDApprovals() {
  // Functional State
  const [approvals, setApprovals] = useState(initialApprovals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter Logic
  const filteredApprovals = approvals.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || item.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Action Logic (CRUD Simulation)
  const handleApprove = (id) => {
    setApprovals(approvals.filter((a) => a.id !== id));
    setSelectedItem(null); // close modal if open
  };

  const handleReject = (id) => {
    setApprovals(approvals.filter((a) => a.id !== id));
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            HoD Approvals
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Review and authorize cross-departmental broadcasts.
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 w-fit">
          <ShieldAlert size={16} /> {approvals.length} Pending Actions
        </div>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[600px]">
        {/* Functional Toolbar */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by HoD name or title..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 appearance-none"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 w-full bg-white/5 border border-white/10 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                <th className="p-5 font-semibold">HoD & Department</th>
                <th className="p-5 font-semibold">Announcement Info</th>
                <th className="p-5 font-semibold">Target Group</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredApprovals.map((item) => (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      x: -20,
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                    }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-5">
                      <p className="text-sm font-semibold text-white">
                        {item.hod}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {item.dept}
                      </p>
                    </td>
                    <td className="p-5">
                      <p className="text-sm text-neutral-200 group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Submitted: {item.date}
                      </p>
                    </td>
                    <td className="p-5">
                      <span className="px-2.5 py-1 text-xs font-medium bg-white/5 rounded-md border border-white/5 text-neutral-300">
                        {item.target}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2 text-neutral-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Review"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="p-2 text-neutral-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="p-2 text-neutral-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredApprovals.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-neutral-500">
                    <CheckCircle2
                      size={32}
                      className="mx-auto mb-3 text-neutral-600"
                    />
                    <p className="font-medium text-white">All caught up!</p>
                    <p className="text-sm mt-1">
                      No pending approvals match your criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Interactive Functional Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {selectedItem.title}
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Request by:{" "}
                    <span className="text-white">{selectedItem.hod}</span> •{" "}
                    {selectedItem.dept}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-neutral-500 hover:text-white bg-white/5 p-1.5 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 min-h-[150px] text-sm text-neutral-300 leading-relaxed mb-6">
                <p className="mb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Message Content:
                </p>
                Please be advised that the main server cluster will undergo
                emergency maintenance tonight. All virtual environments will be
                inaccessible from 23:00 to 02:00. Plan your final project
                submissions accordingly.
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-500 font-medium">
                  Target: {selectedItem.target}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(selectedItem.id)}
                    className="px-5 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedItem.id)}
                    className="px-6 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2"
                  >
                    <Check size={16} /> Approve & Publish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
