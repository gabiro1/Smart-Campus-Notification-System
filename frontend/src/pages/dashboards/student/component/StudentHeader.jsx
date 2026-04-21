/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, PanelLeft, PanelLeftClose, Search, X, Sun, Moon, Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealTimeNotifications } from "../../../../hooks/useRealTimeNotifications";
import NotificationDropdown from "./NotificationDropdown";
import { useTheme } from "../../../../context/ThemeContext";
import eventService from "../../../../services/eventService";
import notificationService from "../../../../services/notificationService";

export default function StudentHeader({ onToggleSidebar, collapsed }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ events: [], announcements: [] });
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const { notifications, unreadCount, markAsRead, clearAll } = useRealTimeNotifications();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchData = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ events: [], announcements: [] });
        return;
      }
      try {
        const [eventsRes, notifsRes] = await Promise.all([
          eventService.searchEvents(searchQuery).catch(() => []),
          notificationService.getNotifications(1, 50).catch(() => ({ data: [] })),
        ]);
        
        const eventArray = Array.isArray(eventsRes) ? eventsRes : (eventsRes?.data || eventsRes?.events || []);
        const notifsResData = notifsRes?.data || notifsRes?.notifications || notifsRes || [];
        const notifArray = Array.isArray(notifsResData) ? notifsResData : [];
        
        const query = searchQuery.toLowerCase();
        const filteredEvents = eventArray.filter(e => 
          e.title?.toLowerCase().includes(query) || e.description?.toLowerCase().includes(query)
        ).slice(0, 5);
        
        const filteredNotifs = notifArray.filter(n => 
          n.title?.toLowerCase().includes(query) || n.message?.toLowerCase().includes(query)
        ).slice(0, 5);
        
        setSearchResults({ events: filteredEvents, announcements: filteredNotifs });
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults({ events: [], announcements: [] });
      }
    };
    const timeout = setTimeout(searchData, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleResultClick = (type, id) => {
    if (type === "announcement") {
      navigate("/student/announcements");
    } else if (type === "event") {
      navigate(`/student/events/${id}`);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const totalResults = searchResults.events.length + searchResults.announcements.length;

  return (
    <header className="sticky top-0 z-40 h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-2 lg:px-6 gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <button onClick={onToggleSidebar} className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors" title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          {collapsed ? <PanelLeft size={18} className="text-foreground" /> : <PanelLeftClose size={18} className="text-foreground" />}
        </button>
      </div>

      {/* Search - desktop input */}
      <div className="hidden md:flex flex-1 max-w-sm mx-2">
        <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-muted-foreground text-[13px] cursor-text hover:border-blue-500/50 transition-colors relative w-full">
          <Search size={14} className="shrink-0 opacity-50" />
          <input ref={searchInputRef} type="text" placeholder="Search... (Ctrl+J)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setShowSearch(true)} className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full" />
          {searchQuery && <button onClick={() => setSearchQuery("")} className="hover:text-foreground"><X size={14} /></button>}
          <AnimatePresence>
            {showSearch && searchQuery.trim() && (
              <motion.div ref={searchResultsRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 right-0 mt-2 glass border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="py-2 max-h-96 overflow-y-auto">
                  {totalResults === 0 ? <div className="p-4 text-center text-muted-foreground text-sm">No results found</div> : (
                    <>
                      {searchResults.announcements.map((notif) => (
                        <button key={notif._id} onClick={() => handleResultClick("announcement", notif._id)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left transition-colors">
                          <MessageSquare size={14} className="text-blue-400 shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{notif.title}</p><p className="text-xs text-muted-foreground truncate">{notif.message}</p></div>
                        </button>
                      ))}
                      {searchResults.events.map((event) => (
                        <button key={event._id} onClick={() => handleResultClick("event", event._id)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left transition-colors">
                          <Calendar size={14} className="text-green-400 shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{event.title}</p><p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p></div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-1">
        {/* Mobile Search Icon */}
        <button onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100); }} className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors">
          <Search size={18} className="text-foreground" />
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors" title={isDarkMode ? "Light Mode" : "Dark Mode"}>
          {isDarkMode ? <Sun size={18} className="text-foreground" /> : <Moon size={18} className="text-foreground" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors relative ${isNotifOpen ? "bg-blue-500/10 text-blue-500" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 origin-top-right">
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} notifications={notifications} unreadCount={unreadCount} onMarkAsRead={markAsRead} onClearAll={clearAll} />
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden flex items-start justify-center pt-20 px-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => { setShowSearch(false); setSearchQuery(""); }} />
            <motion.div 
              initial={{ y: -20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -20, opacity: 0 }}
              className="relative w-full max-w-md glass border border-border rounded-xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 p-3 border-b border-border">
                <Search size={18} className="text-muted-foreground" />
                <input ref={searchInputRef} type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground" autoFocus />
                <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchQuery.trim() ? (
                  totalResults === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No results found</div>
                  ) : (
                    <>
                      {searchResults.announcements.map((notif) => (
                        <button key={notif._id} onClick={() => handleResultClick("announcement", notif._id)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left">
                          <MessageSquare size={14} className="text-blue-400 shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{notif.title}</p><p className="text-xs text-muted-foreground truncate">{notif.message}</p></div>
                        </button>
                      ))}
                      {searchResults.events.map((event) => (
                        <button key={event._id} onClick={() => handleResultClick("event", event._id)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left">
                          <Calendar size={14} className="text-green-400 shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{event.title}</p><p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p></div>
                        </button>
                      ))}
                    </>
                  )
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">Type to search events and announcements</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}