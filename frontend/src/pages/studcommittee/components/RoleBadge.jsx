import { ShieldCheck } from "lucide-react";

export default function RoleBadge({ role }) {
  const colors = {
    Speaker: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    President: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    Minister: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${colors[role]}`}
    >
      <ShieldCheck size={12} />
      <span className="text-[10px] font-black uppercase tracking-tighter">
        Verified {role}
      </span>
    </div>
  );
}
