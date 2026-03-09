/**
 * Professional Stats Grid Component
 * Responsive grid layout for dashboard cards
 */

import { motion } from "framer-motion";

export default function StatsGrid({
  cards = [],
  columns = 3,
  gap = 3,
  animated = true,
  delay = 0.1,
}) {
  const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-${gap}`;

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  if (!animated) {
    return (
      <div className={gridClass}>
        {cards.map((card, idx) => (
          <div key={idx}>{card}</div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={gridClass}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {cards.map((card, idx) => (
        <motion.div key={idx} variants={itemVariants}>
          {card}
        </motion.div>
      ))}
    </motion.div>
  );
}
