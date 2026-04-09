import { Menu, Bell, ShieldCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";
import NotificationCenter from "../../../../components/common/NotificationCenter";
import FloatingCopilot from "../../../../components/FloatingCopilot";
import EmergencyBanner from "../../../../components/common/EmergencyBanner";

export default function TopBar({ isMobile, setSidebarOpen }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  const initials = user?.name
    ?.split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PA";

  return (
    <>
      <EmergencyBanner />
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md shrink-0 z-40 sticky top-0">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground bg-accent rounded-lg border border-border transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-medium">
            <ShieldCheck size={14} /> System Secured
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent hover:bg-accent/80 transition-all duration-200 border border-border"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <NotificationCenter />
          </div>

          <div className="flex items-center gap-3 pl-5 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{user?.name || 'Principal'}</p>
              <p className="text-xs text-muted-foreground">{user?.college?.name || 'Root Access'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-blue-600 p-0.5">
              <div className="w-full h-full bg-card rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </header>
      <FloatingCopilot />
    </>
  );
}