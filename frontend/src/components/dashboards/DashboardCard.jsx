/**
 * Professional Dashboard Card Component
 * Reusable card with animations and visual depth
 */

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function DashboardCard({
  title,
  value,
  subtitle = "",
  change = 0,
  changeType = "increase",
  icon: Icon = null,
  color = "from-blue-600 to-blue-400",
  hover = true,
  children,
  onClick,
  className = "",
}) {
  const isPositive = changeType === "increase";
  const changeColor = isPositive ? "text-green-400" : "text-red-400";

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: hover ? { y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" } : {},
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 cursor-pointer
        bg-gradient-to-br ${color}
        border border-white/10 backdrop-blur-sm
        ${hover ? "transition-all duration-300" : ""}
        ${className}
      `}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />

      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
            {subtitle && <p className="text-white/50 text-xs">{subtitle}</p>}
          </div>

          {Icon && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Icon size={24} className="text-white/40" />
            </motion.div>
          )}
        </div>

        {/* Main value */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4"
        >
          <h3 className="text-4xl font-bold text-white mb-2">{value}</h3>

          {/* Change indicator */}
          {change !== 0 && (
            <div
              className={`flex items-center gap-1 ${changeColor} text-sm font-semibold`}
            >
              {isPositive ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              <span>{Math.abs(change)}% this month</span>
            </div>
          )}
        </motion.div>

        {/* Children content */}
        {children}
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
    </motion.div>
  );
}
