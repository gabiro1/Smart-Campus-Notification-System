import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  padding = "p-6",
  bgOpacity = "bg-card",
  borderOpacity = "border-border",
  rounded = "rounded-2xl",
  shadow = "shadow-lg",
  initialY = 15,
  duration = 0.4,
  hoverOffset = -2,
  hoverScale = 1,
  showGradient = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: initialY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      whileHover={
        hover
          ? {
              y: hoverOffset,
              scale: hoverScale,
            }
          : {}
      }
      className={`${bgOpacity} backdrop-blur-xl ${borderOpacity} ${rounded} ${padding} ${shadow} relative overflow-hidden ${className}`}
    >
      {showGradient && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
