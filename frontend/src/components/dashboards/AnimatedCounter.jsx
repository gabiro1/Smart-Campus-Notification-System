/**
 * Animated Counter Component
 * Displays numbers with smooth animation
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedCounter({
  from = 0,
  to = 100,
  duration = 2,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "text-4xl font-bold",
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const value = Math.floor(from + (to - from) * progress);

      setCount(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [from, to, duration]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : count;

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
}
