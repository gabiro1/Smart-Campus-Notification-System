export default function Logo({ className = "", showText = false, size = "md" }) {
  const sizeMap = { sm: 24, md: 28, lg: 36 };
  const px = sizeMap[size] || 28;
  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src="/logo/Uninotify.png"
        alt="UniNotify AI"
        style={{ height: px }}
        className="w-auto object-contain dark:brightness-0 dark:invert"
      />
      {showText && (
        <span className="text-base font-bold text-foreground tracking-tight">
          Uni<span className="text-blue-500">Notify</span>
        </span>
      )}
    </div>
  );
}
