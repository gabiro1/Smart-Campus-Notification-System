import { useState } from "react";
import GlassCard from "../components/GlassCard";
import { Search, Filter, MoreVertical, Archive, Eye } from "lucide-react";

const allAnnouncements = [
  {
    id: 1,
    title: "Lab 3 Requirements",
    lecturer: "Dr. Grace Hopper",
    target: "Year 2",
    date: "Oct 22, 2026",
    status: "Published",
    openRate: "88%",
  },
  {
    id: 2,
    title: "Guest Speaker: AI Ethics",
    lecturer: "Prof. Alan Turing",
    target: "Year 4",
    date: "Oct 20, 2026",
    status: "Published",
    openRate: "94%",
  },
  {
    id: 3,
    title: "Assignment Extension",
    lecturer: "Dr. Sarah Jenkins",
    target: "Year 3",
    date: "Oct 18, 2026",
    status: "Archived",
    openRate: "99%",
  },
  {
    id: 4,
    title: "Welcome to Sem 2",
    lecturer: "HoD Broadcast",
    target: "All Students",
    date: "Sep 01, 2026",
    status: "Published",
    openRate: "100%",
  },
];

export default function AllAnnouncements() {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Department Archive
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Global view of all communications across your department.
        </p>
      </header>

      <GlassCard className="p-0 overflow-hidden flex flex-col min-h-[600px]">
        {/* Filters */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by title or keyword..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="md:col-span-3">
            <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 appearance-none">
              <option value="">All Lecturers</option>
              <option value="hopper">Dr. Grace Hopper</option>
              <option value="turing">Prof. Alan Turing</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-300 focus:outline-none focus:border-blue-500/50 appearance-none">
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="md:col-span-1 flex justify-end">
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                <th className="p-5 font-semibold">Title & Lecturer</th>
                <th className="p-5 font-semibold">Target Group</th>
                <th className="p-5 font-semibold">Date Sent</th>
                <th className="p-5 font-semibold">Open Rate</th>
                <th className="p-5 font-semibold text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allAnnouncements.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-5">
                    <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {item.lecturer}
                    </p>
                  </td>
                  <td className="p-5">
                    <span className="px-2.5 py-1 text-xs font-medium bg-white/5 rounded-md border border-white/5 text-neutral-300">
                      {item.target}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-neutral-400">{item.date}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {item.openRate}
                      </span>
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: item.openRate }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-amber-400 bg-white/5 hover:bg-amber-500/10 rounded-lg transition-all">
                        <Archive size={16} />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                        <MoreVertical size={16} />
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
