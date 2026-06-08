import { useState, useEffect, useRef } from "react";
import { Menu, Bell, ShieldCheck, Sun, Moon, Search, X, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";
import NotificationCenter from "../../../../components/common/NotificationCenter";
import FloatingCopilot from "../../../../components/FloatingCopilot";
import EmergencyBanner from "../../../../components/common/EmergencyBanner";
import notificationService from "../../../../services/notificationService";
import adminService from "../../../../services/adminService";

export default function TopBar({ isMobile, setSidebarOpen }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ notifications: [], events: [], users: [] });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
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
    const searchData = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ notifications: [], events: [], users: [] });
        return;
      }
      setLoading(true);
      try {
        const [notifs, events, users] = await Promise.all([
          notificationService.getNotifications({ page: 1, limit: 50 }).catch(() => ({ data: [] })),
          adminService.getEvents(1, 50, { search: searchQuery }).catch(() => ({ data: [] })),
          adminService.getUsers(1, 50, {}, true).catch(() => ({ data: [] })),
        ]);

        const getArray = (data) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.notifications)) return data.notifications;
          if (Array.isArray(data?.events)) return data.events;
          if (Array.isArray(data?.users)) return data.users;
          return [];
        };

        const notifArray = getArray(notifs);
        const eventArray = getArray(events);
        const userArray = getArray(users);

        const query = searchQuery.toLowerCase();
        const filteredNotifs = notifArray
          .filter(
            (n) =>
              n.title?.toLowerCase().includes(query) ||
              n.message?.toLowerCase().includes(query) ||
              n.content?.toLowerCase().includes(query)
          )
          .slice(0, 5);

        const filteredEvents = eventArray
          .filter((e) => e.title?.toLowerCase().includes(query))
          .slice(0, 5);

        const filteredUsers = userArray
          .filter((u) => u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query))
          .slice(0, 5);

        setSearchResults({
          notifications: filteredNotifs,
          events: filteredEvents,
          users: filteredUsers,
        });
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults({ notifications: [], events: [], users: [] });
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(searchData, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleResultClick = (type, id) => {
    if (type === "notification") {
      navigate("/principal/notifications");
    } else if (type === "event") {
      navigate(`/principal/events/${id}`);
    } else if (type === "user") {
      navigate("/principal/users");
    }
    setShowResults(false);
    setSearchQuery("");
  };

  const totalResults =
    searchResults.notifications.length + searchResults.events.length + searchResults.users.length;

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
            <ShieldCheck size={14} /> {user?.role === 'admin' ? 'Full Access' : 'Principal Access'}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-muted-foreground text-[13px] cursor-text hover:border-emerald-500/50 transition-colors flex-1 max-w-sm mx-4 relative">
          <Search size={14} className="shrink-0 opacity-50" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search... (Ctrl+J)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {showResults && (
          <div
            ref={searchResultsRef}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[90vw] sm:w-[480px] max-h-96 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50"
          >
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">Searching...</div>
            ) : !searchQuery.trim() ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Type to search notifications, events, or users
              </div>
            ) : totalResults === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <div className="py-2">
                {searchResults.notifications.length > 0 && (
                  <div className="px-3 py-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Notifications</span>
                  </div>
                )}
                {searchResults.notifications.map((notif) => (
                  <button
                    key={notif._id}
                    onClick={() => handleResultClick("notification", notif._id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left"
                  >
                    <Bell size={14} className="text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{notif.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{notif.message || notif.content}</p>
                    </div>
                  </button>
                ))}
                {searchResults.events.length > 0 && (
                  <div className="px-3 py-1 mt-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Events</span>
                  </div>
                )}
                {searchResults.events.map((event) => (
                  <button
                    key={event._id}
                    onClick={() => handleResultClick("event", event._id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left"
                  >
                    <Calendar size={14} className="text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
                {searchResults.users.length > 0 && (
                  <div className="px-3 py-1 mt-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Users</span>
                  </div>
                )}
                {searchResults.users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleResultClick("user", user._id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left"
                  >
                    <Users size={14} className="text-purple-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && totalResults > 0 && (
              <div className="border-t border-border p-2">
                <button
                  onClick={() => {
                    navigate("/principal/notifications");
                    setShowResults(false);
                  }}
                  className="w-full text-center text-xs text-emerald-400 hover:text-emerald-300 py-1"
                >
                  View all results
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
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

          <div className="relative">
            <NotificationCenter />
          </div>

          <div className="flex items-center gap-3 pl-5 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{user?.name || 'Principal'}</p>
              <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Full Access' : 'Principal Administrator'}</p>
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
