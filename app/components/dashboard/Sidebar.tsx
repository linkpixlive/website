import { Dialog } from "@base-ui/react/dialog";
import { Form, NavLink } from "react-router";
import { Icon, type IconName } from "~/components/ui/Icon";
import { LogoTile } from "~/components/ui/Logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { label: string; to: string; icon: IconName; end?: boolean }[] = [
  { label: "Dashboard", to: "/", icon: "widget-2", end: true },
  { label: "Carteira", to: "/carteira", icon: "wallet" },
  { label: "Widgets", to: "/widgets", icon: "widget" },
  { label: "Fila de Alertas", to: "/fila", icon: "list" },
  { label: "Perfil", to: "/perfil", icon: "user-circle" },
  { label: "Conta", to: "/conta", icon: "settings" },
];

function NavRow({
  item,
  onNavigate,
}: {
  item: (typeof menuItems)[number];
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold outline-none transition-colors duration-150 ${
          isActive
            ? "text-white bg-white/5"
            : "text-text-secondary hover:text-white hover:bg-white/5"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-brand rounded-r-full transition-opacity duration-150 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
          <Icon
            name={item.icon}
            size={20}
            strokeWidth={isActive ? 2.4 : 1.9}
            className={`shrink-0 transition-transform duration-150 ${
              isActive ? "scale-105 text-white" : ""
            }`}
          />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function LogoutRow() {
  return (
    <div className="p-3 pt-2 border-t border-white/10">
      <Form method="post" action="/carteira">
        <input type="hidden" name="intent" value="logout" />
        <button
          type="submit"
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-[#f87171] hover:text-[#ef4444] hover:bg-white/5 transition-colors duration-150 cursor-pointer outline-none text-left"
        >
          <Icon name="logout" size={20} strokeWidth={1.9} className="shrink-0" />
          Sair
        </button>
      </Form>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-20 bg-shell flex-col">
        <div className="pt-5 px-4 pb-2">
          <LogoTile href="/" />
        </div>
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavRow key={item.to} item={item} />
          ))}
        </nav>
        <LogoutRow />
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
              <div className="flex items-center justify-between pt-5 pl-4 pr-3 pb-2">
                <Dialog.Title render={<h2 />} className="sr-only">
                  Menu de navegação
                </Dialog.Title>
                <LogoTile href="/" />
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer outline-none active:scale-95"
                  aria-label="Fechar menu"
                >
                  <Icon name="close-circle" size={20} strokeWidth={1.9} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
                {menuItems.map((item) => (
                  <NavRow key={item.to} item={item} onNavigate={onClose} />
                ))}
              </nav>

              <LogoutRow />
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
