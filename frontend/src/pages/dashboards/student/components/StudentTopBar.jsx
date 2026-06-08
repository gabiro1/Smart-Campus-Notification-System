import { useState, useRef, useEffect } from "react";
import { Menu, Bell, Sun, Moon, Search, X } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";

export default function StudentTopBar({ isMobile, setSidebarOpen }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={18} />
          </button>
        )}

        {showSearch ? (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search events, announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              className="w-64 lg:w-80 bg-background border border-border rounded-lg pl-9 pr-8 py-1.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-colors placeholder:text-muted-foreground/50"
            />
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50 border border-border text-muted-foreground text-xs hover:text-foreground transition-colors"
          >
            <Search size={14} />
            <span>Search...</span>
            <kbd className="hidden lg:inline-flex px-1.5 py-0.5 rounded bg-background border border-border text-[10px] text-muted-foreground font-medium">⌘K</kbd>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="relative p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        <div className="ml-2 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
          {user?.name?.charAt(0) || "S"}
        </div>
      </div>
    </header>
  );
}
