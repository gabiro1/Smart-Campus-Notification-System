import { Menu, Bell, ShieldCheck } from "lucide-react";

export default function TopBar({ isMobile, setSidebarOpen }) {
  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md shrink-0 z-40 sticky top-0">
      <div className="flex items-center gap-4">
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-neutral-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-medium">
          <ShieldCheck size={14} /> System Secured
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 text-neutral-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#050505]" />
        </button>
        <div className="flex items-center gap-3 pl-5 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">Principal Admin</p>
            <p className="text-xs text-neutral-500">Root Access</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            PA
          </div>
        </div>
      </div>
    </header>
  );
}
