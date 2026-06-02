import { useState, useEffect, useRef } from "react";
import {
  Sun, Moon, Search, Bell, PanelLeftClose, PanelLeftOpen, X, GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "../../../../components/common/NotificationCenter";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";

export default function RegistrarTopbar({ title = "Dashboard", onMenuClick, onCollapseClick, collapsed }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "RG";

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 gap-4 shrink-0 relative">
      <div className="flex items-center gap-2">
        <button
          onClick={onCollapseClick}
          className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} className="text-foreground" />
          ) : (
            <PanelLeftClose size={18} className="text-foreground" />
          )}
        </button>
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
        >
          <PanelLeftOpen size={18} className="text-foreground" />
        </button>
        <h1 className="text-[15px] font-medium text-foreground hidden lg:block">{title}</h1>
      </div>

      <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-muted-foreground text-[13px] cursor-text hover:border-emerald-500/50 transition-colors flex-1 max-w-sm relative">
        <Search size={14} className="shrink-0 opacity-50" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search students... (Ctrl+J)"
          className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full"
          onFocus={() => navigate("/registrar/students")}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-medium">
          <GraduationCap size={14} /> Registrar
        </div>

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

        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground">{user?.name || "Registrar"}</p>
            <p className="text-xs text-muted-foreground">Registrar Office</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 p-0.5">
            <div className="w-full h-full bg-card rounded-full flex items-center justify-center text-xs font-bold text-foreground">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
