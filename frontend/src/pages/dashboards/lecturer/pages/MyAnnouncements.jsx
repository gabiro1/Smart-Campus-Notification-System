import { useState } from "react";
import GlassCard from "../components/GlassCard";
import { motion } from "framer-motion";
import { Edit3, Trash2, BarChart2, Search, Filter } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "Midterm Exam Schedule",
    class: "CS101",
    status: "Active",
    date: "Oct 24, 2026",
    engagement: "84%",
  },
  {
    id: 2,
    title: "Assignment 3 Extended",
    class: "ENG201",
    status: "Active",
    date: "Oct 23, 2026",
    engagement: "92%",
  },
  {
    id: 3,
    title: "Guest Lecturer Tomorrow",
    class: "CS101",
    status: "Draft",
    date: "-",
    engagement: "-",
  },
  {
    id: 4,
    title: "Welcome to the Semester",
    class: "All Classes",
    status: "Archived",
    date: "Sep 1, 2026",
    engagement: "98%",
  },
];

export default function MyAnnouncements() {
  const [activeTab, setActiveTab] = useState("Active");
  const tabs = ["Active", "Draft", "Archived"];

  const filteredData = announcements.filter((a) => a.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          My Announcements
        </h1>
        <p className="text-neutral-400">
          Manage, edit, and track your sent broadcasts.
        </p>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[500px]">
        {/* Top Bar & Liquid Tabs */}
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.01]">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 relative">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2 text-sm font-medium transition-colors z-10 ${
                  activeTab === tab
                    ? "text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <button className="p-2 bg-black/40 border border-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-neutral-500">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Target Class</th>
                <th className="p-4 font-semibold">Send Date</th>
                <th className="p-4 font-semibold">Engagement</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-4 font-medium text-white">{item.title}</td>
                  <td className="p-4 text-sm text-neutral-400">
                    <span className="px-2.5 py-1 bg-white/5 rounded-md border border-white/5">
                      {item.class}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-neutral-400">{item.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {item.engagement}
                      </span>
                      {item.engagement !== "-" && (
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: item.engagement }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-neutral-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-lg transition-all">
                        <BarChart2 size={16} />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
