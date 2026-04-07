/**
 * LoadingSkeleton - Pulsing placeholder block
 *
 * @param {Object} props
 * @param {'text'|'circular'|'card'} props.variant - Visual style (default: 'text')
 * @param {string} props.className - Additional classes
 * @param {number} props.width - Optional width (e.g., "w-1/4")
 * @param {number} props.height - Optional height (e.g., "h-4")
 */
export default function LoadingSkeleton({
  variant = "text",
  className = "",
  width,
  height,
}) {
  const baseClasses = "animate-pulse bg-white/5 rounded";

  const variantClasses = {
    text: "h-4 w-full",
    circular: "rounded-full",
    card: "w-full h-48",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <div
      className={combinedClasses}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    />
  );
}
