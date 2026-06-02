import { motion } from "framer-motion";

/**
 * Unified GlassCard component - consolidates 5 variants into one flexible component
 *
 * Features:
 * - Smooth entrance animation with configurable delay
 * - Optional hover effects (lift, scale, shadow)
 * - Top gradient highlight line
 * - Glassmorphism styling with backdrop blur
 * - Responsive padding control
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes
 * @param {number} props.delay - Animation delay in seconds
 * @param {boolean} props.hover - Enable hover lift effect (default: true)
 * @param {string} props.padding - Padding class (default: "p-6")
 * @param {string} props.bgOpacity - Background opacity override (default: "bg-white/[0.02]")
 * @param {string} props.borderOpacity - Border opacity override (default: "border-white/10")
 * @param {number} props.rounded - Border radius (default: "rounded-2xl")
 * @param {string} props.shadow - Shadow class (default: "shadow-lg")
 * @param {number} props.initialY - Initial Y offset for animation (default: 15)
 * @param {number} props.duration - Animation duration in seconds (default: 0.4)
 * @param {number} props.hoverOffset - Y offset on hover in pixels (default: -2)
 * @param {number} props.hoverScale - Scale on hover (default: 1, no scale)
 * @param {boolean} props.showGradient - Show top gradient line (default: true)
 * @param {string} props.gradientOpacity - Gradient line opacity (default: "via-white/10")
 */
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
