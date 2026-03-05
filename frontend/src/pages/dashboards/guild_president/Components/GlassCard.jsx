import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
              boxShadow:
                "0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.03)",
            }
          : {}
      }
      className={`bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-lg overflow-hidden relative ${className}`}
    >
      {/* Liquid subtle gradient highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </motion.div>
  );
}
