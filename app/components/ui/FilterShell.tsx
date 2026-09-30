import type { ReactNode } from "react";
import { Icon } from "~/components/ui/Icon";
import { LINK_CLASS } from "~/components/ui/classes";
import { cn } from "~/util/cn";

interface FilterShellProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  children: ReactNode;
}

export function FilterShell({
  hasActiveFilters,
  onClearFilters,
  isOpen,
  onToggleOpen,
  children,
}: FilterShellProps) {
  return (
    <div>
      <div className="flex md:hidden items-center justify-between">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 text-[13px] font-semibold text-ink-body hover:text-ink-heading cursor-pointer outline-none"
        >
          <Icon name="filter" size={16} strokeWidth={1.9} className="text-chrome-icon" />
          {isOpen ? "Ocultar filtros" : "Filtros"}
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand" />}
        </button>
        {hasActiveFilters && !isOpen && (
          <button
            type="button"
            onClick={onClearFilters}
            className={`text-xs font-semibold ${LINK_CLASS} cursor-pointer outline-none`}
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div
        className={cn(
          "mt-4 gap-4 flex-col sm:flex-row sm:flex-wrap sm:items-end",
          isOpen ? "flex" : "hidden md:flex",
        )}
      >
        {children}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="hidden md:block self-end pb-2.5 text-xs font-semibold text-info hover:text-info-hover underline cursor-pointer outline-none"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
