import { Menu, Bell, Search } from "lucide-react";
import { useState } from "react";

export default function StudentHeader({ onToggleSidebar }) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <Menu size={18} />
        </button>
        {showSearch ? (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              onBlur={() => setShowSearch(false)}
              className="w-64 bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-neutral-200 outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <Search size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neutral-400" />
        </button>
        <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-400">
          U
        </div>
      </div>
    </header>
  );
}
