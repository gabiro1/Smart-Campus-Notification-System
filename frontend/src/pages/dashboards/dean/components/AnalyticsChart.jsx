import GlassCard from "./GlassCard";
import { ResponsiveContainer } from "recharts";

export default function AnalyticsChart({
  title,
  action,
  children,
  delay = 0,
  height = "h-[400px]",
}) {
  return (
    <GlassCard delay={delay} className={`${height} flex flex-col`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
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
