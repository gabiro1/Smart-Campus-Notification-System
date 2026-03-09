import { useState } from "react";
import GlassCard from "../components/GlassCard";
import { Check, X, Eye, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const pendingData = [
  {
    id: 1,
    lecturer: "Dr. Sarah Jenkins",
    title: "CS301 Lab Update",
    class: "Year 3 CS",
    date: "Oct 24, 10:00 AM",
  },
  {
    id: 2,
    lecturer: "Prof. Alan Turing",
    title: "Cryptography Guest Lecture",
    class: "Year 4 CS",
    date: "Oct 24, 09:15 AM",
  },
  {
    id: 3,
    lecturer: "Dr. Grace Hopper",
    title: "Compiler Construction Notes",
    class: "Year 2 CS",
    date: "Oct 23, 14:30 PM",
  },
];

export default function Approvals() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Pending Approvals
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Review and authorize announcements before publication.
        </p>
      </header>

      <GlassCard className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-white/[0.01]">
          <div className="relative max-w-md w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search pending..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-neutral-300 hover:bg-white/[0.08] transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-neutral-500">
                <th className="p-4 font-semibold">Lecturer</th>
                <th className="p-4 font-semibold">Announcement Title</th>
                <th className="p-4 font-semibold">Target Class</th>
                <th className="p-4 font-semibold">Date Submitted</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pendingData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-white">
                    {item.lecturer}
                  </td>
                  <td className="p-4 text-sm text-neutral-300">{item.title}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-medium bg-white/5 rounded-md border border-white/5 text-neutral-400">
                      {item.class}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-neutral-400">{item.date}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 text-neutral-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-md transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-neutral-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 rounded-md transition-all">
                        <Check size={16} />
                      </button>
                      <button className="p-1.5 text-neutral-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-md transition-all">
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
                    By {selectedItem.lecturer} • Target: {selectedItem.class}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 min-h-[150px] text-sm text-neutral-300 leading-relaxed mb-6">
                Please note that the upcoming lab session has been moved to Room
                402. Ensure you have your environments configured beforehand.
              </div>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                  Reject
                </button>
                <button className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                  Approve & Publish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
