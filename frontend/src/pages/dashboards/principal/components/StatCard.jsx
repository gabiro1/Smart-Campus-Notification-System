import GlassCard from "./GlassCard";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  trend,
  isPositive = true,
  delay = 0,
}) {
  return (
    <GlassCard delay={delay} className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl border border-white/5 ${bgClass}`}>
          <Icon size={20} className={colorClass} />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 uppercase tracking-wider ${isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {value}
        </h3>
        <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">
          {title}
        </p>
      </div>
    </GlassCard>
  );
}
