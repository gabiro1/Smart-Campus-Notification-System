import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  X,
  Sun,
  Moon,
  Bell,
  Calendar,
  Users,
  Megaphone,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import NotificationCenter from "../common/NotificationCenter";

export default function UniHeader({
  title = "Dashboard",
  onMenuClick,
  showMenuButton = true,
  role = "student",
}) {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowResults(true);
      }
      if (e.key === "Escape") {
        setShowResults(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const q = searchQuery.toLowerCase();
        const mockResults = [
          { type: "page", label: "Dashboard", path: `/${role}/dashboard`, icon: Calendar },
          { type: "page", label: "Notifications", path: `/${role}/notifications`, icon: Bell },
          { type: "page", label: "Events", path: `/${role}/events`, icon: Calendar },
          { type: "page", label: "Settings", path: `/${role}/settings`, icon: Calendar },
        ].filter((r) => r.label.toLowerCase().includes(q));
        setSearchResults(mockResults);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery, role]);

  const handleResultClick = (path) => {
    navigate(path);
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <header
      className={`sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-6 gap-4 shrink-0 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-border shadow-[0_1px_0_rgba(255,255,255,0.05)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} className="text-foreground" />
          </button>
        )}
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[15px] font-semibold text-foreground hidden sm:block"
        >
          {title}
        </motion.h1>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-auto relative">
        <div className="relative w-full">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-muted-foreground text-[13px] hover:border-white/[0.15] transition-colors focus-within:border-blue-500/40 focus-within:bg-blue-500/5">
            <Search size={14} className="shrink-0 opacity-50" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="hover:text-foreground shrink-0">
                <X size={14} />
              </button>
            )}
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-white/[0.06] rounded border border-white/[0.08] text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <AnimatePresence>
            {showResults && searchQuery.trim() && (
              <motion.div
                ref={searchResultsRef}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No results found
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleResultClick(result.path)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] text-left transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <result.icon size={13} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{result.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.path}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/[0.06] transition-colors"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? (
            <Sun size={16} className="text-foreground" />
          ) : (
            <Moon size={16} className="text-foreground" />
          )}
        </button>

        <NotificationCenter />

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-foreground leading-tight">
              {JSON.parse(localStorage.getItem("user") || "{}")?.name || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
            </p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-lg">
              {JSON.parse(localStorage.getItem("user") || "{}")?.name?.charAt(0)?.toUpperCase() || role.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}
