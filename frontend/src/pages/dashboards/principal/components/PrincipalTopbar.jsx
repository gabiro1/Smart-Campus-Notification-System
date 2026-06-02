import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function PrincipalTopbar({ onMenuClick, onCollapseClick, collapsed }) {
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onCollapseClick}
          className="hidden lg:flex p-2 hover:bg-muted rounded-md"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Principal</span>
      </div>
    </header>
  );
}
