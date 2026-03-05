import GlassCard from "./GlassCard";

export default function StatCard({ title, value, icon: Icon, trend, delay }) {
  const isPositive = trend?.startsWith("+");

  return (
    <GlassCard delay={delay} className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-neutral-300">
          <Icon size={18} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-md border ${isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {value}
        </h3>
        <p className="text-sm text-neutral-400 font-medium mt-1">{title}</p>
      </div>
    </GlassCard>
  );
}
