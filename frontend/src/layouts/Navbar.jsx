import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  LayoutDashboard,
  ShieldAlert,
  Bookmark,
} from "lucide-react";

// The Brain: Importing the global authentication state
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Consuming the Context (No more manual localStorage parsing!)
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  // Helper to highlight active routes
  const isActive = (path) => location.pathname.startsWith(path);

  // Generate dynamic initials for the avatar (e.g., "Gabiro Jovial" -> "GJ")
  const initials = user?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2); // Ensure it's never more than 2 letters

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-border bg-card/95 backdrop-blur-md"
    >
      {/* 1. BRAND LOGO */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tighter text-foreground">
          UniNotify <span className="text-blue-500">AI</span>
        </span>
      </Link>

      {/* 2. DESKTOP NAVIGATION - STRICTLY ROLE BASED */}
      <div className="hidden lg:flex items-center gap-8">
        {!isLoggedIn ? (
          <>
            <NavLink
              to="/features"
              label="Features"
              active={isActive("/features")}
            />
            <NavLink
              to="/how-it-works"
              label="How It Works"
              active={isActive("/how-it-works")}
            />
            <NavLink to="/about" label="About" active={isActive("/about")} />
          </>
        ) : (
          <>
            {/* --- STUDENT ONLY LINKS --- */}
            {user.role === "student" && (
              <>
                <NavLink
                  to="/student/dashboard"
                  label="Overview"
                  active={isActive("/student/dashboard")}
                />
                <NavLink
                  to="/student/announcements"
                  label="Noticeboard"
                  active={isActive("/student/announcements")}
                />
                <NavLink
                  to="/student/events"
                  label="Events Catalog"
                  active={isActive("/student/events")}
                />
                <NavLink
                  to="/student/reminders"
                  label="Reminders"
                  active={isActive("/student/reminders")}
                />
              </>
            )}

            {/* --- HOD / LECTURER LINKS --- */}
            {(user.role === "hod" || user.role === "lecturer") && (
              <>
                <NavLink
                  to={
                    user.role === "hod" ? "/hod/dashboard" : "/lecturer/console"
                  }
                  label="Pulse Console"
                  active={isActive("/hod") || isActive("/lecturer")}
                />
                <NavLink
                  to="/admin/history"
                  label="My History"
                  active={isActive("/admin/history")}
                />
              </>
            )}

            {/* --- ADMIN LINKS --- */}
            {user.role === "admin" && (
              <>
                <NavLink
                  to="/admin/overview"
                  label="Admin Dashboard"
                  active={isActive("/admin/overview")}
                />
                <NavLink
                  to="/admin/users"
                  label="Access Control"
                  active={isActive("/admin/users")}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* 3. RIGHT SIDE CONTROLS */}
      <div className="flex items-center gap-4">
        {!isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-white text-black hover:bg-neutral-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button
              onClick={() => navigate("/search")}
              className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Bookmarks Icon (students only) */}
            {user.role === "student" && (
              <button
                onClick={() => navigate("/student/bookmarks")}
                className="p-2 hover:bg-accent rounded-full text-muted-foreground relative transition-colors group"
                title="Saved Events"
              >
                <Bookmark
                  size={20}
                  className="group-hover:text-blue-400 transition-colors"
                />
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => navigate("/student/reminders")}
              className="p-2 hover:bg-accent rounded-full text-muted-foreground relative transition-colors group"
            >
              <Bell
                size={20}
                className="group-hover:text-foreground transition-colors"
              />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card" />
            </button>

            {/* Profile Dropdown */}
            <div className="group relative ml-2">
              <div className="w-10 h-10 rounded-full border border-border p-0.5 cursor-pointer hover:border-blue-500/50 transition-colors">
                <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                  {initials || "U"}
                </div>
              </div>

              {/* Role Tooltip */}
              <div className="absolute top-11 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-600/20 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {user.role}
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-12 w-56 border border-border rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-card shadow-2xl z-50">
                <div className="px-3 py-2 mb-2 border-b border-border">
                  <p className="text-sm font-bold text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                <DropdownItem
                  to="/profile"
                  icon={<User size={14} />}
                  label="My Profile"
                />
                <DropdownItem
                  to="/settings"
                  icon={<Settings size={14} />}
                  label="Settings"
                />

                <hr className="my-2 border-border" />

                {/* Global Logout Action */}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-foreground ml-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 4. MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 bg-card z-[60] flex flex-col p-8 pt-24 space-y-6 lg:hidden overflow-y-auto"
          >
            {/* Close button inside mobile menu for safety */}
            <button
              className="absolute top-6 right-6 p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={28} />
            </button>

            {isLoggedIn ? (
              <>
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-sm text-blue-400 font-black uppercase tracking-widest mb-1">
                    {user.role}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{user.name}</p>
                </div>

                {user.role === "student" && (
                  <>
                    <MobileLink
                      to="/student/dashboard"
                      label="Overview"
                      close={setIsMobileMenuOpen}
                    />
                    <MobileLink
                      to="/student/announcements"
                      label="Noticeboard"
                      close={setIsMobileMenuOpen}
                    />
                    <MobileLink
                      to="/student/events"
                      label="Events Catalog"
                      close={setIsMobileMenuOpen}
                    />
                    <MobileLink
                      to="/student/reminders"
                      label="My Reminders"
                      close={setIsMobileMenuOpen}
                    />
                  </>
                )}
                {user.role === "hod" && (
                  <MobileLink
                    to="/hod/dashboard"
                    label="HOD Console"
                    close={setIsMobileMenuOpen}
                  />
                )}

                <div className="mt-auto pt-8">
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-red-400 font-bold text-lg"
                  >
                    <LogOut size={20} /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <MobileLink
                  to="/login"
                  label="Login"
                  close={setIsMobileMenuOpen}
                />
                <MobileLink
                  to="/register"
                  label="Register"
                  close={setIsMobileMenuOpen}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* --- SUBCOMPONENTS --- */

function NavLink({ to, label, active }) {
  return (
    <Link to={to} className="relative group flex flex-col items-center">
      <motion.span
        whileHover={{ y: -2 }}
        className={`text-[12px] font-bold tracking-widest uppercase transition-colors ${active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
      >
        {label}
      </motion.span>
      {active && (
        <motion.div
          layoutId="nav-underline"
          className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        />
      )}
    </Link>
  );
}

function MobileLink({ to, label, close }) {
  return (
    <Link
      to={to}
      onClick={() => close(false)}
      className="text-2xl font-bold text-muted-foreground hover:text-foreground tracking-tight transition-colors"
    >
      {label}
    </Link>
  );
}

function DropdownItem({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all"
    >
      {icon} {label}
    </Link>
  );
}
