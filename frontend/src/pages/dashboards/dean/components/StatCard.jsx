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
            className={`text-xs font-medium bg-white/5 px-2 py-1 rounded-md flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
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
        <p className="text-sm text-neutral-400 font-medium mt-1">{title}</p>
      </div>
    </GlassCard>
  );
}
