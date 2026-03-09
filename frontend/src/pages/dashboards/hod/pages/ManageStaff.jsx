import GlassCard from "../components/GlassCard";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

const staffList = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    email: "s.jenkins@uni.edu",
    courses: "CS301, CS302",
    role: "Lecturer",
    trust: "High",
  },
  {
    id: 2,
    name: "Prof. Alan Turing",
    email: "a.turing@uni.edu",
    courses: "CS401, CS405",
    role: "Senior Lecturer",
    trust: "Auto-Approve",
  },
  {
    id: 3,
    name: "Dr. Grace Hopper",
    email: "g.hopper@uni.edu",
    courses: "CS101, CS102",
    role: "Lecturer",
    trust: "Requires Approval",
  },
];

export default function ManageStaff() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Manage Staff
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Control lecturer permissions and approval workflows.
          </p>
        </div>
        <button className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2">
          <UserPlus size={16} /> Add Lecturer
        </button>
      </header>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.01]">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search staff members..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] uppercase tracking-widest text-neutral-500">
                <th className="p-5 font-semibold">Lecturer Profile</th>
                <th className="p-5 font-semibold">Assigned Courses</th>
                <th className="p-5 font-semibold">Publishing Rights</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffList.map((staff) => (
                <tr
                  key={staff.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                        {staff.name.charAt(4)} {/* Quick initial grab */}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {staff.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {staff.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-neutral-300">
                    {staff.courses}
                  </td>
                  <td className="p-5">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        staff.trust === "Auto-Approve"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : staff.trust === "Requires Approval"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {staff.trust === "Auto-Approve" ? (
                        <ShieldCheck size={14} />
                      ) : (
                        <ShieldAlert size={14} />
                      )}
                      {staff.trust}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
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
