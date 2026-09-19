import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import { useState } from "react";
import { NavLink } from "react-router";
import { Icon } from "~/components/ui/Icon";
import { LogoTile } from "~/components/ui/Logo";
import { NovidadesModal } from "~/components/novidades/NovidadesModal";
import { useNovidades } from "~/components/novidades/releases";
import {
  getPublicPageUrl,
  menuItems,
  type MenuItem,
} from "./menu";
import {
  getUserInitials,
  ProfileMenuContent,
  useCurrentUser,
} from "./ProfilePopover";
import { popupClasses } from "./header-styles";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const rowClasses =
  "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold outline-none transition-colors duration-150 text-text-secondary hover:text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand/40";

function InternalRow({
  item,
  onNavigate,
}: {
  item: MenuItem;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${rowClasses} ${isActive ? "text-white bg-white/5" : ""}`
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

function StreamerFooter({
  onNavigate,
  onOpenNovidades,
  hasUnseenNovidades,
}: {
  onNavigate?: () => void;
  onOpenNovidades?: () => void;
  hasUnseenNovidades?: boolean;
}) {
  const user = useCurrentUser();
  const username = user?.username;

  return (
    <div className="border-t border-white/10 p-3 pt-2">
      {user && username ? (
        <Menu.Root>
          <div className="flex min-w-0 items-center gap-1 rounded-xl bg-white/5 py-1 pl-1 pr-1">
              <Menu.Trigger
                render={<button type="button" />}
                aria-label="Abrir menu da conta"
                title="Abrir menu da conta"
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left outline-none transition-colors duration-150 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-[11px] font-extrabold text-on-brand"
                  >
                    {getUserInitials(user.name)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold leading-tight text-white">
                    {user.name}
                  </span>
                  <span className="block truncate text-[11px] font-medium text-text-secondary">
                    @{username}
                  </span>
                </span>
              </Menu.Trigger>
              <a
                href={getPublicPageUrl(username)}
                target="_blank"
                rel="noreferrer"
                title="Abrir minha página em nova aba"
                aria-label="Abrir minha página em nova aba"
                className="rounded-full p-1.5 text-text-secondary outline-none transition-colors duration-150 hover:bg-white/5 hover:text-white cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-brand/40 shrink-0"
              >
                <Icon name="square-arrow-right-up" size={16} strokeWidth={1.9} />
              </a>
            </div>
            <Menu.Portal>
              <Menu.Positioner
                side="top"
                align="start"
                sideOffset={8}
                className="z-50"
              >
                <Menu.Popup className={`w-64 p-2 ${popupClasses}`}>
                  <ProfileMenuContent
                    onNavigate={onNavigate}
                    onOpenNovidades={onOpenNovidades}
                    hasUnseenNovidades={hasUnseenNovidades}
                  />
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-white/5 px-3.5 py-2.5">
            <span className="truncate text-[13px] font-semibold text-text-secondary">
              Carregando conta…
            </span>
          </div>
        )}
    </div>
  );
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
          <LogoTile href="/" imgClassName="h-16" textClassName="text-[40px]" />
        </div>
        <nav
          aria-label="Navegação principal"
          className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1"
        >
          {menuItems.map((item) => (
            <InternalRow key={item.to} item={item} />
          ))}
        </nav>
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
                <LogoTile href="/" imgClassName="h-14" textClassName="text-4xl" />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-5 p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer outline-none active:scale-95"
                  aria-label="Fechar menu"
                >
                  <Icon name="close-circle" size={20} strokeWidth={1.9} />
                </button>
              </div>

              <nav
                aria-label="Navegação principal"
                className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1"
              >
                {menuItems.map((item) => (
                  <InternalRow
                    key={item.to}
                    item={item}
                    onNavigate={onClose}
                  />
                ))}
              </nav>

              <StreamerFooter onNavigate={onClose} {...footerNovidadesProps} />
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      </Dialog.Root>

      <NovidadesModal isOpen={novidadesOpen} onClose={handleCloseNovidades} />
    </>
  );
}
