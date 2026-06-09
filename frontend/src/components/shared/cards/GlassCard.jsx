import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  padding = "p-6",
  bgOpacity = "bg-[#111111]",
  borderOpacity = "border-white/[0.06]",
  rounded = "rounded-2xl",
  initialY = 15,
  duration = 0.4,
  hoverOffset = -2,
  showGradient = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: initialY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={
        hover
          ? { y: hoverOffset, transition: { duration: 0.2 } }
          : {}
      }
      className={`relative overflow-hidden group ${bgOpacity} ${borderOpacity} ${rounded} ${padding} ${className}`}
    >
      {showGradient && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
