export default function AvatarInitials({ name, size = 32, className = "" }) {
  const getInitials = (fullName) => {
    if (!fullName) return "?";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || "?";
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-muted border border-border text-muted-foreground font-medium shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.375) }}
    >
      {getInitials(name)}
    </div>
  );
}
