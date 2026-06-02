import { Menu } from "lucide-react";

export default function StudentHeader({ onToggleSidebar, collapsed }) {
  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-md">
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-muted rounded-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Student Dashboard</span>
      </div>
    </header>
  );
}
