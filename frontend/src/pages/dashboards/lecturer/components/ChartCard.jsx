import GlassCard from "./GlassCard";
import { motion } from "framer-motion";

export default function ChartCard({
  title,
  subtitle,
  delay = 0,
  children,
  height = "h-96",
}) {
  return (
    <GlassCard delay={delay} className={`flex flex-col ${height}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex-1 w-full relative flex items-end justify-between gap-2 h-full">
        {/* If a real chart is passed, render it. Otherwise, show the liquid mock chart */}
        {children ? children : <LiquidMockChart />}
      </div>
    </GlassCard>
  );
}

// Built-in fallback to simulate liquid data filling up
function LiquidMockChart() {
  const mockData = [45, 80, 55, 90, 70, 85, 100];

  return (
    <div className="flex-1 flex items-end justify-between gap-3 h-full w-full border-b border-white/10 pb-2 relative">
      {/* Background grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-full h-px bg-white/20 border-b border-dashed border-white/20"
          />
        ))}
      </div>

      {mockData.map((height, i) => (
        <div
          key={i}
          className="w-full relative group h-full flex items-end z-10"
        >
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${height}%`, opacity: 1 }}
            transition={{
              duration: 1,
              delay: i * 0.1,
              type: "spring",
              bounce: 0.3,
            }}
            className="w-full bg-gradient-to-t from-blue-900/30 via-blue-600/50 to-blue-400/80 rounded-t-md relative overflow-hidden group-hover:via-blue-500/60 group-hover:to-blue-300 transition-all cursor-pointer"
          >
            {/* The "water surface" glow at the top of the bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/50 shadow-[0_0_12px_rgba(255,255,255,0.9)] rounded-t-md" />
          </motion.div>
        </div>
      ))}
    </div>
  );
}
