/**
 * FormHelperText - Optional helper text below input
 *
 * @param {Object} props
 * @param {string} props.children - Helper text
 * @param {string} props.className - Additional classes
 */
export default function FormHelperText({ children, className = "" }) {
  return (
    <p className={`text-xs text-neutral-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}
