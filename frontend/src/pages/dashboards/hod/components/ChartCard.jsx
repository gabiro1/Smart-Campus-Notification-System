import GlassCard from "./GlassCard";

export default function ChartCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  delay = 0,
  height = "h-[400px]", // Default height required for responsive charts
}) {
  return (
    <GlassCard delay={delay} className={`flex flex-col ${height}`}>
      {/* Header Area */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Icon size={18} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && (
              <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Optional Action (like a "View All" link or dropdown) */}
        {action && <div>{action}</div>}
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full min-h-0 relative">
        {/* The children prop is where you pass your <ResponsiveContainer><AreaChart/></ResponsiveContainer> */}
        {children}
      </div>
    </GlassCard>
  );
}
