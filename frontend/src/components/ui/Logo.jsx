import { Link } from "react-router-dom";

export default function Logo({ className = "", showText = false, size = "md", to }) {
  const sizeMap = { sm: 36, md: 44, lg: 56 };
  const px = sizeMap[size] || 44;
  const content = (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src="/logo/Uninotify.png"
        alt="UniNotify AI"
        style={{ height: px }}
        className="w-auto object-contain dark:brightness-0 dark:invert"
      />
      {showText && (
        <span className="text-lg font-bold text-foreground tracking-tight">
          Uni<span className="text-blue-500">Notify</span>
        </span>
      )}
    </div>
  );
  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
}
