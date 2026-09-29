import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";
import { Icon } from "~/components/ui/Icon";
import { LogoTile } from "~/components/ui/LogoTile";
import { NovidadesModal } from "~/components/novidades/NovidadesModal";
import { useNovidades } from "~/components/novidades/releases";
import { SidebarNav } from "./SidebarNav";
import { StreamerFooter } from "./StreamerFooter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-20 bg-shell border-r border-white/10 flex-col">
        <div className="flex items-center justify-center pt-5 px-4 pb-4">
          <LogoTile href="/dashboard" imgClassName="h-10" textClassName="text-2xl" />
        </div>
        <SidebarNav />
        <StreamerFooter {...footerNovidadesProps} />
      </aside>

      {/* Mobile drawer */}
      <Dialog.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0 lg:hidden" />

          <div className="fixed inset-0 z-50 flex lg:hidden">
            <Dialog.Popup className="relative flex flex-col w-72 max-w-[85vw] h-full bg-shell shadow-2xl transition-transform duration-[260ms] ease-out focus:outline-none data-starting-style:-translate-x-full data-ending-style:-translate-x-full">
              <div className="relative flex items-center justify-center pt-5 px-12 pb-4">
                <Dialog.Title render={<h2 />} className="sr-only">
                  Menu de navegação
                </Dialog.Title>
                <LogoTile href="/dashboard" imgClassName="h-9" textClassName="text-xl" />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-5 p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer outline-none active:scale-95"
                  aria-label="Fechar menu"
                >
                  <Icon name="close-circle" size={20} strokeWidth={1.9} />
                </button>
              </div>

              <SidebarNav onNavigate={onClose} />

              <StreamerFooter onNavigate={onClose} {...footerNovidadesProps} />
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      </Dialog.Root>

      <NovidadesModal isOpen={novidadesOpen} onClose={handleCloseNovidades} />
    </>
  );
}
