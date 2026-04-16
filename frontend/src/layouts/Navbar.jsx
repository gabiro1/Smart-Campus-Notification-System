import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  Bookmark,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const isLoggedIn = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const initials = user?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Desktop Navbar - Floating Pill */}
      <motion.nav
        initial={{ y: -100, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.1 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden lg:block w-[95%] max-w-5xl"
      >
        <div className="bg-card/80 backdrop-blur-2xl rounded-full px-6 py-2.5 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between gap-4">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="text-white" size={14} />
              </motion.div>
              <span className="text-base font-bold text-foreground tracking-tight">
                Uni<span className="text-blue-500">Notify</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {!isLoggedIn ? (
                <>
                  <NavLink to="/" label="Home" active={location.pathname === "/"} />
                  <NavLink to="/features" label="Features" active={isActive("/features")} />
                  <NavLink to="/how-it-works" label="How It Works" active={isActive("/how-it-works")} />
                  <NavLink to="/about" label="About" active={isActive("/about")} />
                </>
              ) : (
                <>
                  {user.role === "student" && (
                    <>
                      <NavLink to="/student/dashboard" label="Dashboard" active={isActive("/student/dashboard")} />
                      <NavLink to="/student/announcements" label="Alerts" active={isActive("/student/announcements")} />
                      <NavLink to="/student/events" label="Events" active={isActive("/student/events")} />
                    </>
                  )}
                  {(user.role === "hod" || user.role === "lecturer") && (
                    <>
                      <NavLink to={user.role === "hod" ? "/hod/dashboard" : "/lecturer/console"} label="Console" />
                      <NavLink to="/admin/history" label="History" />
                    </>
                  )}
                  {user.role === "admin" && (
                    <>
                      <NavLink to="/admin/overview" label="Dashboard" />
                      <NavLink to="/admin/users" label="Users" />
                    </>
                  )}
                </>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full bg-accent/50 hover:bg-accent flex items-center justify-center text-foreground transition-colors"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isDarkMode ? "moon" : "sun"}
                    initial={{ rotate: -90, opacity: 0, scale: 0 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="px-5 py-1.5 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("/search")}
                    className="w-8 h-8 rounded-full bg-accent/50 hover:bg-accent flex items-center justify-center text-foreground transition-colors"
                  >
                    <Search size={14} />
                  </motion.button>

                  {user.role === "student" && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate("/student/bookmarks")}
                      className="w-8 h-8 rounded-full bg-accent/50 hover:bg-accent flex items-center justify-center text-foreground transition-colors"
                    >
                      <Bookmark size={14} />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("/student/reminders")}
                    className="w-8 h-8 rounded-full bg-accent/50 hover:bg-accent flex items-center justify-center text-foreground transition-colors relative"
                  >
                    <Bell size={14} />
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-card text-[8px] font-bold text-white flex items-center justify-center">
                      3
                    </span>
                  </motion.button>

                  {/* Profile */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                      {initials || "U"}
                    </button>

                    {/* Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-10 w-56 py-2 bg-card/95 backdrop-blur-xl rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-bold text-foreground text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-500 rounded-full uppercase">
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-accent rounded-lg transition-colors"
                        >
                          <User size={14} className="text-foreground" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-accent rounded-lg transition-colors"
                        >
                          <Settings size={14} className="text-foreground" />
                          Settings
                        </Link>
                        <button
                          onClick={() => { logout(); navigate("/"); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile/Tablet Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-xl border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Sparkles className="text-white" size={14} />
            </div>
            <span className="text-base font-bold text-foreground">
              Uni<span className="text-blue-500">Notify</span>
            </span>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-foreground"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isDarkMode ? "moon" : "sun"}
                  initial={{ rotate: -90, opacity: 0, scale: 0 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-foreground"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-card"
            >
              <div className="px-4 py-4 space-y-1 border-t">
                {!isLoggedIn ? (
                  <>
                    <MobileMenuLink to="/" label="Home" onClick={() => setMobileMenuOpen(false)} />
                    <MobileMenuLink to="/features" label="Features" onClick={() => setMobileMenuOpen(false)} />
                    <MobileMenuLink to="/how-it-works" label="How It Works" onClick={() => setMobileMenuOpen(false)} />
                    <MobileMenuLink to="/about" label="About" onClick={() => setMobileMenuOpen(false)} />
                    <div className="pt-4 space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-medium bg-accent rounded-xl"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl"
                      >
                        Get Started
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    {user.role === "student" && (
                      <>
                        <MobileMenuLink to="/student/dashboard" label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                        <MobileMenuLink to="/student/announcements" label="Alerts" onClick={() => setMobileMenuOpen(false)} />
                        <MobileMenuLink to="/student/events" label="Events" onClick={() => setMobileMenuOpen(false)} />
                        <MobileMenuLink to="/student/bookmarks" label="Bookmarks" onClick={() => setMobileMenuOpen(false)} />
                      </>
                    )}
                    {(user.role === "hod" || user.role === "lecturer") && (
                      <>
                        <MobileMenuLink to={user.role === "hod" ? "/hod/dashboard" : "/lecturer/console"} label="Console" onClick={() => setMobileMenuOpen(false)} />
                        <MobileMenuLink to="/admin/history" label="History" onClick={() => setMobileMenuOpen(false)} />
                      </>
                    )}
                    {user.role === "admin" && (
                      <>
                        <MobileMenuLink to="/admin/overview" label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                        <MobileMenuLink to="/admin/users" label="Users" onClick={() => setMobileMenuOpen(false)} />
                      </>
                    )}
                    <div className="pt-4 border-t space-y-1">
                      <MobileMenuLink to="/profile" label="Profile" onClick={() => setMobileMenuOpen(false)} />
                      <MobileMenuLink to="/settings" label="Settings" onClick={() => setMobileMenuOpen(false)} />
                      <button
                        onClick={() => { logout(); navigate("/"); setMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className="relative px-3 py-1.5 text-sm font-medium transition-colors"
    >
      <span className={active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>
        {label}
      </span>
      <motion.span
        layoutId="nav-indicator"
        className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-blue-500 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </Link>
  );
}

function MobileMenuLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-3 text-foreground hover:bg-accent rounded-xl transition-colors font-medium"
    >
      {label}
    </Link>
  );
}
