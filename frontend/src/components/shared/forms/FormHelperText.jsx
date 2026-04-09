/**
 * FormHelperText - Optional helper text below input
 *
 * @param {Object} props
 * @param {string} props.children - Helper text
 * @param {string} props.className - Additional classes
 */
export default function FormHelperText({ children, className = "" }) {
  return (
    <p className={`text-xs text-muted-foreground mt-1 ${className}`}>
      {children}
    </p>
  );
}
