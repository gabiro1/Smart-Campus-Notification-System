import GlassCard from "../cards/GlassCard";
import LoadingSkeleton from "./LoadingSkeleton";

/**
 * LoadingCard - Card skeleton with typical content layout
 *
 * @param {Object} props
 * @param {number} props.lines - Number of text lines to show (default: 3)
 * @param {boolean} props.showImage - Show image placeholder (default: false)
 * @param {string} props.className - Additional classes
 */
export default function LoadingCard({
  lines = 3,
  showImage = false,
  className = "",
}) {
  return (
    <GlassCard className={`space-y-4 ${className}`}>
      {showImage && (
        <div className="w-full h-40 rounded-lg bg-white/5 animate-pulse" />
      )}
      <div className="space-y-3">
        <LoadingSkeleton variant="text" width="w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <LoadingSkeleton key={i} variant="text" width="w-full" />
        ))}
      </div>
    </GlassCard>
  );
}
