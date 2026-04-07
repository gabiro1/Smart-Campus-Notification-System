import { Search } from "lucide-react";
import NotificationCenter from "../../../../components/common/NotificationCenter";

export default function AdminTopbar() {
  return (
    <div className="sticky top-0 z-[40] w-full bg-background/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-end gap-6">
      {/* Date + Location */}
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-white">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-neutral-500">
          Kigali, Rwanda
        </p>
      </div>

      {/* Notification Bell */}
      <div className="relative z-50">
        <NotificationCenter />
      </div>
    </div>
  );
}
