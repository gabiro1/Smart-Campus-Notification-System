import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = false,
  padding = "p-6",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-2xl ${padding} shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Premium subtle top glare */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
