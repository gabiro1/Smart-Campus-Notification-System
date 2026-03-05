import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = true,
  padding = "p-6",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl ${padding} shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
