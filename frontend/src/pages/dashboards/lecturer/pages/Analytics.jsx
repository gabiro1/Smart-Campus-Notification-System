import GlassCard from "../components/GlassCard";
import { motion } from "framer-motion";
import { MousePointerClick, Eye, Send } from "lucide-react";

export default function Analytics() {
  // Mock data for the liquid bar chart
  const weekData = [65, 40, 85, 70, 95, 60, 80];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
          Performance Analytics
        </h1>
        <p className="text-neutral-400">
          Deep dive into how students interact with your messages.
        </p>
      </header>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Total Deliveries",
            val: "4,209",
            icon: Send,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
          },
          {
            label: "Unique Opens",
            val: "3,892",
            icon: Eye,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
          },
          {
            label: "Link Clicks",
            val: "1,430",
            icon: MousePointerClick,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
          },
        ].map((stat, i) => (
          <GlassCard
            key={i}
            delay={i * 0.1}
            className="flex items-center gap-5"
          >
            <div className={`p-4 rounded-2xl border ${stat.bg} ${stat.border}`}>
              <stat.icon size={28} className={stat.color} />
            </div>
            <div>
              <p className="text-sm text-neutral-400 font-medium">
                {stat.label}
              </p>
              <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
                {stat.val}
              </h3>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liquid Bar Chart */}
        <GlassCard delay={0.3} className="h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">
            Open Rates (Past 7 Days)
          </h3>

          <div className="flex-1 w-full flex items-end justify-between gap-3 relative pb-6 border-b border-white/10">
            {/* Background Grid */}
            <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none opacity-20 z-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-full h-px border-b border-dashed border-white/50"
                />
              ))}
            </div>

            {/* Liquid Bars */}
            {weekData.map((height, i) => (
              <div
                key={i}
                className="w-full relative group h-full flex items-end z-10 flex-col justify-end"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    type: "spring",
                    bounce: 0.2,
                  }}
                  className="w-full bg-gradient-to-t from-blue-900/40 via-blue-600/60 to-blue-400 rounded-t-lg relative overflow-hidden cursor-pointer"
                >
                  {/* Liquid surface highlight */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                </motion.div>
                {/* X-Axis labels */}
                <span className="text-[10px] text-neutral-500 mt-3 font-medium uppercase absolute -bottom-6">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Engagement Heatmap Mock */}
        <GlassCard delay={0.4} className="h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">
            Engagement by Time of Day
          </h3>
          <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col gap-2">
            {/* Simulated Heatmap Rows */}
            {["Morning", "Afternoon", "Evening"].map((time, rowIdx) => (
              <div key={time} className="flex-1 flex items-center gap-3">
                <span className="text-xs text-neutral-500 w-16">{time}</span>
                <div className="flex-1 h-full flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((colIdx) => {
                    // Randomize opacity to simulate heatmap intensity
                    const intensity = Math.random() * 0.8 + 0.1;
                    return (
                      <motion.div
                        key={colIdx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: rowIdx * 0.1 + colIdx * 0.05 }}
                        className="flex-1 rounded-md bg-blue-500 hover:border-white/50 border border-transparent cursor-pointer transition-all"
                        style={{ opacity: intensity }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-2">
              <span className="w-16"></span>
              <div className="flex-1 flex justify-between text-[10px] text-neutral-600 uppercase font-medium">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
