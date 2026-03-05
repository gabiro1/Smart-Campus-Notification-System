import GlassCard from "../components/GlassCard";
import { Search, Filter, MoreVertical, Mail } from "lucide-react";

const members = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Vice President",
    department: "Engineering",
    status: "Active",
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Secretary",
    department: "Business",
    status: "Active",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Treasurer",
    department: "Finance",
    status: "Away",
  },
  {
    id: 4,
    name: "David Kim",
    role: "Events Head",
    department: "Arts",
    status: "Active",
  },
];

export default function Members() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Guild Members
          </h1>
          <p className="text-neutral-400">
            Manage student representatives and roles.
          </p>
        </div>
        <button className="bg-white text-black hover:bg-neutral-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          + Add Member
        </button>
      </header>

      <GlassCard className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex gap-4 bg-white/[0.01]">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search members..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-600"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-neutral-300 hover:bg-white/[0.08] transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/10 text-xs uppercase tracking-wider text-neutral-500">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-neutral-300">
                    <select className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer hover:text-white appearance-none outline-none">
                      <option className="bg-[#1A1A1A]">{member.role}</option>
                      <option className="bg-[#1A1A1A]">Admin</option>
                      <option className="bg-[#1A1A1A]">Moderator</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm text-neutral-400">
                    {member.department}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        member.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-neutral-400 hover:text-white bg-white/[0.05] rounded-md transition-colors">
                        <Mail size={16} />
                      </button>
                      <button className="p-1.5 text-neutral-400 hover:text-white bg-white/[0.05] rounded-md transition-colors">
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
