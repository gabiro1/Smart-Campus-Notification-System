import { Loader2 } from "lucide-react";

/**
 * LoadingSpinner - Circular loading indicator
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} props.size - Spinner size (default: 'md')
 * @param {'primary'|'white'|'muted'} props.color - Color variant (default: 'primary')
 * @param {string} props.className - Additional classes
 */
export default function LoadingSpinner({
  size = "md",
  color = "primary",
  className = "",
}) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12",
  };

  const colorClasses = {
    primary: "text-blue-400",
    white: "text-foreground",
    muted: "text-muted-foreground",
  };

  return (
    <Loader2
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
}
