import GlassCard from "./GlassCard";
import { ResponsiveContainer } from "recharts";

export default function AnalyticsChart({
  title,
  subtitle,
  action,
  children,
  delay = 0,
  height = "h-[400px]",
}) {
  return (
    <GlassCard delay={delay} className={`${height} flex flex-col`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
