import { motion } from "framer-motion";
import { Home, Bell, User, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Feed", path: "/feed" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: Bell, label: "Alerts", path: "/notifications" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function StudentNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-6">
      <nav className="glass flex items-center justify-around w-full max-w-md py-3 px-2 rounded-[32px] border border-white/10 shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path} className="relative p-3">
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-blue-600 rounded-2xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={`${isActive ? "text-white" : "text-neutral-500"}`}
              >
                <item.icon size={24} />
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
