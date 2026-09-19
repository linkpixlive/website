import { Icon } from "~/components/ui/Icon";
import { LogoTile } from "~/components/ui/Logo";

interface MobileHeaderProps {
  onOpenMenu: () => void;
}

export function MobileHeader({ onOpenMenu }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-shell border-b border-white/10 flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="p-2 -ml-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <Icon name="hamburger-menu" size={22} strokeWidth={1.9} />
      </button>
      <LogoTile href="/" imgClassName="h-7" textClassName="text-xl" />
    </header>
  );
}
