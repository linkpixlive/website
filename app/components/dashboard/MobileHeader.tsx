import { Icon } from "~/components/ui/Icon";

interface MobileHeaderProps {
  onOpenMenu: () => void;
}

export function MobileHeader({ onOpenMenu }: MobileHeaderProps) {
  return (
    <div className="mb-3 flex items-center gap-2.5 lg:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-card text-ink-heading outline-none transition-colors duration-150 hover:border-ink-heading active:scale-95"
      >
        <Icon name="hamburger-menu" size={20} strokeWidth={1.9} />
      </button>
      <img
        src="/icon-dark.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="h-7 w-auto shrink-0 select-none"
      />
      <span className="text-[16px] font-extrabold tracking-tight text-ink-heading">
        LinkPix
      </span>
    </div>
  );
}
