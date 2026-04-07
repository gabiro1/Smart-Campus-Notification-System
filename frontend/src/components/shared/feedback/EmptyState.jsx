/**
 * EmptyState - Consistent empty data display
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Icon component to display (lucide-react)
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {string} props.action - Optional button label
 * {function} props.onAction - Optional callback for action button
 * @param {string} props.className - Additional classes
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
        <Icon size={32} className="text-neutral-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-6">{description}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}
