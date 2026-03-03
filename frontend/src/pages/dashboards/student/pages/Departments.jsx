/**
 * @page Departments
 * @description Preference management for the AI filtering engine.
 */
import { Landmark, Check } from "lucide-react";

export default function Departments() {
  const depts = [
    { name: "Information Technology", isFollowing: true, code: "IT" },
    { name: "Computer Science", isFollowing: false, code: "CS" },
    { name: "Guild Sports & Culture", isFollowing: true, code: "GSC" },
  ];

  return (
    <div className="pt-24 px-6 pb-20 max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          Channels
        </h2>
        <p className="text-neutral-500 text-xs font-bold uppercase mt-1">
          Customize your AI News Feed
        </p>
      </div>

      <div className="grid gap-4">
        {depts.map((dept) => (
          <div
            key={dept.code}
            className="glass p-6 rounded-[32px] border border-white/5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:text-blue-500 transition-colors">
                <Landmark size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">{dept.name}</h3>
                <span className="text-[10px] text-neutral-500 font-black uppercase">
                  Channel ID: {dept.code}
                </span>
              </div>
            </div>
            <button
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                dept.isFollowing
                  ? "bg-blue-600/10 text-blue-500 border border-blue-500/20"
                  : "bg-white/5 text-neutral-500 border border-white/10 hover:bg-white/10"
              }`}
            >
              {dept.isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
