import { Search, Sun, Moon } from "lucide-react";
import NotificationCenter from "../../../../components/common/NotificationCenter";
import { useTheme } from "../../../../context/ThemeContext";

export default function AdminTopbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className="sticky top-0 z-[40] w-full bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4 flex items-center justify-end gap-6">
      {/* Date + Location */}
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Kigali, Rwanda
        </p>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-accent transition-all duration-200 border border-border"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-foreground" />
        ) : (
          <Moon className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Notification Bell */}
      <div className="relative z-50">
        <NotificationCenter />
      </div>
    </div>
  );
}
