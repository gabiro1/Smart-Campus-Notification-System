import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Settings,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  const initials = user?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5 bg-[#050505]"
    >
      {/* LOGO */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tighter text-white">
          UniNotify <span className="text-blue-500">AI</span>
        </span>
      </Link>

      {/* DESKTOP LINKS - CONDITIONALLY RENDERED BY ROLE */}
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
            {user?.role === "student" && (
              <>
                <NavLink
                  to="/feed"
                  label="Announcements"
                  active={isActive("/feed")}
                />
                <NavLink
                  to="/ai-summary"
                  label={
                    <span className="flex items-center">
                      <Sparkles size={14} className="mr-1" /> AI Summary
                    </span>
                  }
                  active={isActive("/ai-summary")}
                />
                <NavLink
                  to="/departments"
                  label="Departments"
                  active={isActive("/departments")}
                />
                <NavLink
                  to="/reminders"
                  label="Reminders"
                  active={isActive("/reminders")}
                />
              </>
            )}

            {/* --- ADMIN ONLY LINKS --- */}
            {/* {user?.role === "admin" && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  label={
                    <span className="flex items-center gap-1">
                      <LayoutDashboard size={14} /> Dashboard
                    </span>
                  }
                  active={isActive("/admin/dashboard")}
                />
                <NavLink
                  to="/admin/users"
                  label="Access Control"
                  active={isActive("/admin/users")}
                />
                <NavLink
                  to="/admin/history"
                  label="Broadcast Audit"
                  active={isActive("/admin/history")}
                />
              </>
            )} */}

            {/* --- HOD / LECTURER LINKS --- */}
            {(user?.role === "hod" || user?.role === "lecturer") && (
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
          </>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {!isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-bold text-neutral-400 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-white text-black hover:bg-neutral-200 transition-colors"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/search")}
              className="p-2 hover:bg-white/5 rounded-full text-neutral-400 transition-colors"
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => navigate("/notifications")}
              className="p-2 hover:bg-white/5 rounded-full text-neutral-400 relative transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
            </button>

            {/* Profile Dropdown */}
            <div className="group relative">
              <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 cursor-pointer">
                <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                  {initials || "U"}
                </div>
              </div>

              {/* Tooltip Label for Role */}
              <div className="absolute top-11 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-600 text-[10px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {user?.role}
              </div>

              <div className="absolute right-0 top-12 w-48 border border-white/10 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-neutral-900 shadow-2xl z-50">
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

                {/* Immediate access to Dashboard in dropdown for non-students */}
                {user?.role !== "student" && (
                  <DropdownItem
                    to={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : "/hod/dashboard"
                    }
                    icon={<ShieldAlert size={14} />}
                    label="Admin Panel"
                  />
                )}

                <hr className="my-2 border-white/5" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU (Updated similarly for roles) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 bg-neutral-950 z-[60] flex flex-col p-8 pt-24 space-y-6 lg:hidden"
          >
            {/* Same role-based logic should be applied here for mobile links */}
            {isLoggedIn && user?.role === "student" && (
              <>
                <MobileLink
                  to="/feed"
                  label="Announcements"
                  close={setIsMobileMenuOpen}
                />
                <MobileLink
                  to="/ai-summary"
                  label="AI Summary"
                  close={setIsMobileMenuOpen}
                />
              </>
            )}
            {isLoggedIn && user?.role === "admin" && (
              <MobileLink
                to="/admin/dashboard"
                label="Admin Dashboard"
                close={setIsMobileMenuOpen}
              />
            )}
            {!isLoggedIn && (
              <MobileLink
                to="/login"
                label="Login"
                close={setIsMobileMenuOpen}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* Subcomponents */
function NavLink({ to, label, active }) {
  return (
    <Link to={to} className="relative group">
      <motion.span
        whileHover={{ y: -2 }}
        className={`text-[13px] font-medium tracking-wider uppercase transition-colors ${
          active ? "text-white" : "text-neutral-500 group-hover:text-white"
        }`}
      >
        {label}
      </motion.span>
      {active && (
        <motion.div
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
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
      className="text-2xl font-bold text-white tracking-tight"
    >
      {label}
    </Link>
  );
}

function DropdownItem({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
    >
      {icon} {label}
    </Link>
  );
}
