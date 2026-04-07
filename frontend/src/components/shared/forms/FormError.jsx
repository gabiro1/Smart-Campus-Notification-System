/**
 * FormError - Displays field-level validation errors
 *
 * @param {Object} props
 * @param {string} props.message - Error text
 * @param {string} props.className - Additional classes
 */
export default function FormError({ message, className = "" }) {
  if (!message) return null;
  return (
    <p className={`text-xs text-rose-400 mt-1 flex items-center gap-1 ${className}`}>
      <span className="w-1 h-1 bg-rose-400 rounded-full" />
      {message}
    </p>
  );
}
