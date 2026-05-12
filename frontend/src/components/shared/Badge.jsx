export default function Badge({ children, variant = "default", className = "" }) {
  const styles = {
    default: "bg-muted text-muted-foreground border border-border",
    success: "bg-success/10 text-success border border-success/20",
    danger: "bg-destructive/10 text-destructive border border-destructive/20",
    accent: "bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${styles[variant] || styles.default} ${className}`}
    >
      {children}
    </span>
  );
}
