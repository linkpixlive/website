import { Menu } from "lucide-react";
import { Link } from "react-router";

interface TopbarProps {
  onOpenSidebar: () => void;
  user: {
    name: string;
  } | null;
}

export function Topbar({ onOpenSidebar, user }: TopbarProps) {
  return (
    <header className="lg:hidden h-16 bg-surface border-b border-border px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors duration-150 cursor-pointer outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="LinkPix Logo" className="h-6 object-contain" />
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary font-medium hidden sm:inline-block">
            {user.name}
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-semibold uppercase">
            {user.name.substring(0, 2)}
          </div>
        </div>
      )}
    </header>
  );
}
