import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "../../../../components/common/NotificationCenter";
import { useTheme } from "../../../../context/ThemeContext";

function MagneticButton({ children, onClick, className = "" }) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouse = (e) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };
  
  const reset = () => setPosition({ x: 0, y: 0 });
  
  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-accent transition-all duration-200 border border-border text-sm font-medium text-foreground cursor-pointer ${className}`}
    >
      {children}
    </motion.button>
  );
}

export default function AdminTopbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 z-[40] w-full bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4 flex items-center justify-between gap-6">
      {/* Magnetic Back Button */}
      <MagneticButton onClick={() => navigate("/")}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </MagneticButton>

      {/* Right Side: Date + Theme + Notifications */}
      <div className="flex items-center gap-4">
        {/* Date + Location */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Kigali, Rwanda
          </p>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-accent transition-all duration-200 border border-border"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative z-50">
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
}
