import GlassCard from "./GlassCard";

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  delay = 0,
}) {
  return (
    <GlassCard delay={delay} className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
          <Icon
            size={20}
            className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
          />
        </div>
        {trend && (
          <span className="text-xs font-medium bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.05] text-neutral-400">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {value}
        </h3>
        <p className="text-sm text-neutral-400 font-medium mt-1">{label}</p>
      </div>
    </GlassCard>
  );
}
