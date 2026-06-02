import { Outlet, useNavigate } from "react-router-dom";
import LecturerSidebar from "@/components/shared/LecturerSidebar";
import { useState, useEffect, useRef } from "react";
import EmergencyBanner from "@/components/common/EmergencyBanner";
import FloatingCopilot from "@/components/FloatingCopilot";
import { Sun, Moon, PanelLeftClose, PanelLeftOpen, Menu, Search, X, Megaphone, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NotificationCenter from "@/components/common/NotificationCenter";
import { useTheme } from "@/context/ThemeContext";
import eventService from "@/services/eventService";
import apiClient from "@/services/apiClient";

export default function LecturerLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ events: [], announcements: [], classes: [] });
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      setSidebarCollapsed(mobile || tablet);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchData = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ events: [], announcements: [], classes: [] });
        return;
      }
      try {
        const [eventsRes, announcementsRes] = await Promise.all([
          eventService.searchEvents(searchQuery).catch(() => []),
          apiClient.get(`/announcements?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ data: { data: [] } })),
        ]);
        
        const eventArray = Array.isArray(eventsRes) ? eventsRes : (eventsRes?.data || eventsRes?.events || []);
        const announcementsArray = Array.isArray(announcementsRes?.data?.data) 
          ? announcementsRes.data.data 
          : Array.isArray(announcementsRes?.data)
            ? announcementsRes.data
            : Array.isArray(announcementsRes)
              ? announcementsRes
              : [];
        
        const query = searchQuery.toLowerCase();
        const filteredEvents = eventArray.filter(e => 
          e.title?.toLowerCase().includes(query) || e.description?.toLowerCase().includes(query)
        ).slice(0, 5);
        
        const filteredAnnouncements = announcementsArray.filter(a => 
          a.title?.toLowerCase().includes(query) || a.description?.toLowerCase().includes(query)
        ).slice(0, 5);
        
        setSearchResults({ events: filteredEvents, announcements: filteredAnnouncements, classes: [] });
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults({ events: [], announcements: [], classes: [] });
      }
    };
    const timeout = setTimeout(searchData, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const effectiveCollapsed = sidebarCollapsed || isTablet;

  const handleResultClick = (type, id) => {
    if (type === "announcement") {
      navigate("/lecturer/announcements");
    } else if (type === "event") {
      navigate(`/lecturer/events/${id}`);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const totalResults = searchResults.events.length + searchResults.announcements.length + searchResults.classes.length;

  return (
    <div className="min-h-screen bg-card relative">
      <LecturerSidebar 
        collapsed={effectiveCollapsed} 
        onToggle={toggleSidebar}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div className={`min-h-screen flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-14' : (effectiveCollapsed ? 'ml-16' : 'ml-56')
        }`}>
        <div className="sticky top-0 z-10 w-full h-14 bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-8 flex items-center justify-between gap-4">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-accent transition-all duration-200 border border-border shrink-0"
            title={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMobile ? (
              <Menu className="w-5 h-5 text-foreground" />
            ) : effectiveCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-foreground" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-foreground" />
            )}
          </button>
          
          <div className="flex-1 max-w-xl relative">
            <div className="flex items-center gap-2 bg-background/50 border border-border rounded-xl px-4 py-2.5 text-muted-foreground text-sm hover:border-primary/30 transition-colors relative">
              <Search size={16} className="shrink-0 opacity-50" />
              <input 
                ref={searchInputRef} 
                type="text" 
                placeholder="Search events, announcements... (Ctrl+J)" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                onFocus={() => setShowSearch(true)}
                className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="hover:text-foreground shrink-0">
                  <X size={14} />
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {showSearch && searchQuery.trim() && (
                <motion.div 
                  ref={searchResultsRef} 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: -10, scale: 0.95 }} 
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="py-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {totalResults === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">
                        <Search size={24} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No results found for "{searchQuery}"</p>
                        <p className="text-xs mt-1 opacity-60">Try different keywords</p>
                      </div>
                    ) : (
                      <>
                        {searchResults.events.length > 0 && (
                          <div className="px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Events</p>
                            {searchResults.events.map((event) => (
                              <button 
                                key={event._id} 
                                onClick={() => handleResultClick("event", event._id)}
                                className="w-full flex items-start gap-3 px-3 py-3 hover:bg-accent/50 text-left transition-colors rounded-lg"
                              >
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                  <Calendar size={14} className="text-purple-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{event.location || 'No location'} • {new Date(event.date).toLocaleDateString()}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {searchResults.announcements.length > 0 && (
                          <div className="px-3 py-2 border-t border-border">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Announcements</p>
                            {searchResults.announcements.map((announcement) => (
                              <button 
                                key={announcement._id} 
                                onClick={() => handleResultClick("announcement", announcement._id)}
                                className="w-full flex items-start gap-3 px-3 py-3 hover:bg-accent/50 text-left transition-colors rounded-lg"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                  <Megaphone size={14} className="text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{announcement.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{announcement.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {totalResults > 0 && (
                    <div className="p-2 border-t border-border bg-muted/20">
                      <p className="text-[10px] text-center text-muted-foreground">
                        {totalResults} result{totalResults !== 1 ? 's' : ''} • Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">Esc</kbd> to close
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-accent transition-all duration-200 border border-border"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
            </button>
            <NotificationCenter />
          </div>
        </div>

        <main className="flex-1 flex flex-col w-full">
          <EmergencyBanner />
          <Outlet />
        </main>

        <FloatingCopilot />
      </div>
    </div>
  );
}
