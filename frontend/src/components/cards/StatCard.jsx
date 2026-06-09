import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  children,
  title,
  value,
  icon: Icon,
  trend,
  isPositive,
  delay = 0,
  iconSize = 20,
  iconColor = "text-blue-400",
  iconBgClass = "bg-blue-500/10",
  titleClass = "text-sm text-muted-foreground font-medium mt-1",
  valueClass = "text-2xl font-bold text-foreground tracking-tight",
  trendClass = "",
  trendShowIcon = true,
  animate = true,
}) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }
    const numericValue = parseInt(String(value).replace(/[^0-9]/g, "")) || 0;
    if (numericValue === 0) {
      setDisplayValue(value);
      return;
    }
    const duration = 1500;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        const suffix = String(value).replace(/[0-9]/g, "");
        setDisplayValue(Math.round(current) + suffix);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, animate]);

  const positive = isPositive !== undefined ? isPositive : trend?.startsWith("+");

  const trendBadgeClass = positive
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : "bg-rose-500/10 text-rose-400 border-rose-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative bg-[#111111] border border-white/[0.06] rounded-2xl p-5 overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl border border-white/[0.06] ${iconBgClass}`}>
            {Icon && <Icon size={iconSize} className={iconColor} />}
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1 ${trendBadgeClass} ${trendClass}`}>
              {trendShowIcon && (positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
              {trend}
            </span>
          )}
        </div>
        <div>
          <h3 className={valueClass}>{displayValue}</h3>
          <p className={titleClass}>{title}</p>
        </div>
        {children}
      </div>
    </motion.div>
  );
}
