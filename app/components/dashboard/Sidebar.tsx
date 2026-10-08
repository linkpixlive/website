import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Icon } from "~/components/ui/Icon";
import { NovidadesModal } from "~/components/novidades/NovidadesModal";
import { useNovidades } from "~/components/novidades/releases";
import { SidebarNav } from "./SidebarNav";
import { StreamerFooter } from "./StreamerFooter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <Link
      to="/dashboard"
      aria-label="LinkPix"
      className={`flex w-full items-center pt-1 pb-4 outline-none transition-[padding-left,padding-right,gap] duration-300 focus-visible:ring-2 focus-visible:ring-brand/40 ${
        compact ? "gap-0 pr-0 pl-[calc((88px-32px-23px)/2)]" : "gap-2.5 px-2"
      }`}
    >
      <img
        src="/icon-dark.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="h-8 w-auto shrink-0 select-none"
      />
      <span
        className={`truncate text-[19px] font-extrabold tracking-tight text-white transition-[max-width,opacity] duration-300 ${
          compact
            ? "max-w-0 opacity-0 delay-[0ms]"
            : "max-w-[160px] flex-1 opacity-100 delay-200"
        }`}
      >
        LinkPix
      </span>
    </Link>
  );
}

function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      aria-expanded={!collapsed}
      title={collapsed ? "Expandir menu" : "Recolher menu"}
      className={`mt-1 flex w-full cursor-pointer items-center rounded-2xl py-2.5 text-[13px] font-bold text-ink-muted outline-none transition-[padding-left,padding-right,gap,background-color,color] duration-300 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-brand/40 ${
        collapsed ? "gap-0 pr-0 pl-[calc((88px-32px-16px)/2)]" : "gap-3 px-4"
      }`}
    >
      <span
        className="shrink-0"
      >
        <Icon
          name={collapsed ? "alt-arrow-right" : "alt-arrow-left"}
          size={16}
          strokeWidth={2}
        />
      </span>
      <span
        className={`truncate whitespace-nowrap transition-[max-width,opacity] duration-300 ${
          collapsed
            ? "max-w-0 opacity-0 delay-[0ms]"
            : "max-w-[120px] flex-1 opacity-100 delay-200"
        }`}
      >
        Recolher
      </span>
    </button>
  );
}

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const [novidadesOpen, setNovidadesOpen] = useState(false);
  const { hasUnseen: hasUnseenNovidades, markAllSeen } = useNovidades();

  function handleCloseNovidades() {
    setNovidadesOpen(false);
    markAllSeen();
  }

  const footerNovidadesProps = {
    onOpenNovidades: () => setNovidadesOpen(true),
    hasUnseenNovidades,
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`hidden h-dvh shrink-0 flex-col bg-shell p-4 transition-[width] duration-300 lg:flex ${
          collapsed ? "w-[88px] items-center" : "w-60"
        }`}
      >
        <BrandMark compact={collapsed} />
        <SidebarNav compact={collapsed} />
        <StreamerFooter compact={collapsed} {...footerNovidadesProps} />
        <CollapseToggle collapsed={collapsed} onToggle={onToggleCollapse} />
      </aside>

      {/* Mobile / tablet drawer (empurra o conteúdo, sem backdrop) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-shell p-4 transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        inert={!isOpen}
        aria-label="Menu de navegação"
      >
        <div className="flex items-center gap-2.5 px-2 pt-1 pb-4">
          <img
            src="/icon-dark.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-8 w-auto shrink-0 select-none"
          />
          <span className="flex-1 text-[19px] font-extrabold tracking-tight text-white">
            LinkPix
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-muted outline-none transition-colors duration-150 hover:bg-white/5 hover:text-white active:scale-95"
          >
            <Icon name="close-circle" size={20} strokeWidth={1.9} />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
        <StreamerFooter onNavigate={onClose} {...footerNovidadesProps} />
      </div>

      <NovidadesModal isOpen={novidadesOpen} onClose={handleCloseNovidades} />
    </>
  );
}
