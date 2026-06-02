import { memo } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/shared/cards/GlassCard";

function StatusFilterCard({ label, value, color, isActive, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <GlassCard
        className={`p-4 text-center transition-all ${isActive ? "ring-2 ring-violet-500/50" : ""}`}
      >
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </GlassCard>
    </motion.div>
  );
}

export default memo(StatusFilterCard);
