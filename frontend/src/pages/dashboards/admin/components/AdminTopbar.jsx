import { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Calendar,
  Users,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "../../../../components/common/NotificationCenter";
import { useTheme } from "../../../../context/ThemeContext";
import notificationService from "../../../../services/notificationService";
import adminService from "../../../../services/adminService";

export default function AdminTopbar({ title = "Dashboard", onMenuClick, onCollapseClick, collapsed }) {
  const { isDarkMode, toggleTheme } = useTheme();
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
      navigate("/admin/notifications");
    } else if (type === "event") {
      navigate(`/admin/events/${id}`);
    } else if (type === "user") {
      navigate("/admin/users");
    }
    setShowResults(false);
    setSearchQuery("");
  };

  const totalResults =
    searchResults.notifications.length + searchResults.events.length + searchResults.users.length;

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 gap-4 shrink-0 relative">
      <div className="flex items-center gap-2">
        {onCollapseClick && (
          <button
            onClick={onCollapseClick}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} className="text-foreground" />
            ) : (
              <PanelLeftClose size={18} className="text-foreground" />
            )}
          </button>
        )}
        <h1 className="text-[15px] font-medium text-foreground hidden lg:block">{title}</h1>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-muted-foreground text-[13px] cursor-text hover:border-blue-500/50 transition-colors flex-1 max-w-[200px] lg:max-w-sm relative">
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
                  <Bell size={14} className="text-blue-400 shrink-0" />
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
                  <Calendar size={14} className="text-green-400 shrink-0" />
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
                  navigate("/admin/notifications");
                  setShowResults(false);
                }}
                className="w-full text-center text-xs text-blue-400 hover:text-blue-300 py-1"
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
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? (
            <Sun size={18} className="text-foreground" />
          ) : (
            <Moon size={18} className="text-foreground" />
          )}
        </button>

        <div className="relative">
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
