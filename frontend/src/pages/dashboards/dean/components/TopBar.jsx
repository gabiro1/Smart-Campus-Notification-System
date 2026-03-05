import { Menu, Bell } from "lucide-react";

export default function TopBar({
  isMobile,
  setSidebarOpen,
  userName,
  role,
  initials,
}) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-black/20 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-4">
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-neutral-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-lg font-semibold hidden sm:block text-white">
          Executive Control Center
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-neutral-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#050505]" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {userName || "Dr. Robert Vance"}
            </p>
            <p className="text-xs text-neutral-500">
              {role || "Dean of Sciences"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5">
            <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center text-xs font-bold text-white">
              {initials || "RV"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
