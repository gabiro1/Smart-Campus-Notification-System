import { motion } from "framer-motion";

export default function StatsGrid({
  cards = [],
  columns = 4,
  gap = 4,
  animated = true,
  delay = 0.08,
}) {
  const gridClass = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${columns} gap-${gap}`;

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
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
