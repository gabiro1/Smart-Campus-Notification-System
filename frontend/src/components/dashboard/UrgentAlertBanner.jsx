import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function UrgentAlertBanner({ message }) {
  const [dismissed, setDismissed] = useState(false);
  const [animating, setAnimating] = useState(false);

  if (!message) return null;

  const handleDismiss = () => {
    setAnimating(true);
    setTimeout(() => {
      setDismissed(true);
    }, 200);
  };

  if (dismissed) return null;

  return (
    <div
      className={`flex items-center gap-3 bg-card border-l-[3px] border-l-destructive rounded-lg p-3 transition-all duration-200 ${
        animating ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <AlertTriangle size={16} className="text-destructive shrink-0" />
      <span className="flex-1 text-[13px] text-foreground">{message}</span>
      <button
        onClick={handleDismiss}
        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
