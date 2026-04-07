import GlassCard from "./GlassCard";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Unified StatCard component - consolidates 4 variants into one flexible component
 *
 * Displays a key metric with icon, value, label, and optional trend indicator.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Optional custom content instead of default layout
 * @param {string} props.title - Card title/label
 * @param {string|number} props.value - Main metric value
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.trend - Trend text (e.g., "+12%", "-5%")
 * @param {boolean} props.isPositive - Whether trend is positive (default inferred from trend starting with "+")
 * @param {number} props.delay - Animation delay in seconds
 * @param {string} props.iconSize - Icon size class (default "size-5" or size-20 via style)
 * @param {string} props.iconClass - Additional classes for icon
 * @param {string} props.iconBgClass - Background class for icon container
 * @param {string} props.iconPadding - Padding for icon container (default "p-3")
 * @param {string} props.titleClass - Additional classes for title
 * @param {string} props.valueClass - Additional classes for value
 * @param {string} props.trendClass - Additional classes for trend badge
 * @param {boolean} props.trendShowIcon - Show trend direction icon (default true)
 * @param {string} props.trendSize - Trend badge size/variant
 */
export default function StatCard({
  children,
  title,
  value,
  icon: Icon,
  trend,
  isPositive,
  delay = 0,
  iconSize = 20,
  iconClass = "",
  iconBgClass = "bg-white/[0.03]",
  iconPadding = "p-3",
  titleClass = "text-sm text-neutral-400 font-medium mt-1",
  valueClass = "text-3xl font-bold text-white tracking-tight",
  trendClass = "",
  trendShowIcon = true,
  trendSize = "text-xs",
}) {
  // Auto-detect positivity from trend string if not provided
  const positive = isPositive !== undefined ? isPositive : trend?.startsWith("+");

  // Default trend styling
  const defaultTrendClass = positive
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : "bg-rose-500/10 text-rose-400 border-rose-500/20";

  const finalTrendClass = `${trendSize} font-medium px-2.5 py-1 rounded-full border flex items-center gap-1 ${defaultTrendClass} ${trendClass}`.trim();

  return (
    <GlassCard delay={delay} className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`${iconPadding} rounded-xl border border-white/5 ${iconBgClass}`}>
          <Icon size={iconSize} className={iconClass} />
        </div>
        {trend && (
          <span className={finalTrendClass}>
            {trendShowIcon &&
              (positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className={valueClass}>{value}</h3>
        <p className={titleClass}>{title}</p>
      </div>
      {children}
    </GlassCard>
  );
}
