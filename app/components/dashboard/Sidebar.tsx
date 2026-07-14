import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Grid, LayoutDashboard, LogOut, Settings, User, Wallet, X } from "lucide-react";
import { Fragment } from "react";
import { Form, Link, NavLink } from "react-router";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
  } | null;
}

const menuItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Carteira", to: "/carteira", icon: Wallet },
  { label: "Widgets", to: "/widgets", icon: Grid },
  { label: "Perfil", to: "/perfil", icon: User },
  { label: "Conta", to: "/conta", icon: Settings },
];

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const getNavLinkClass = (isActive: boolean) => `
    group relative flex items-center gap-3 pl-9 pr-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 outline-none
    ${
      isActive
        ? "bg-surface-hover text-text-heading border border-border/40 shadow-xs"
        : "text-text-primary hover:bg-surface-hover/40 hover:text-text-heading border border-transparent"
    }
  `;

  const renderContent = () => (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Header / Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="LinkPix Logo" className="h-7 object-contain" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors duration-150 cursor-pointer outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClose}
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-3.5 top-3 bottom-3 w-1 rounded-full bg-primary transition-all duration-200 origin-center ${
                    isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                  }`}
                />
                <item.icon
                  className={`h-5 w-5 shrink-0 transition-colors duration-150 ${
                    isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"
                  }`}
                />
                <span className="transition-colors duration-150">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer section with logout button */}
      <div className="p-4 border-t border-border">
        <Form method="post" action="/carteira">
          <input type="hidden" name="intent" value="logout" />
          <button
            type="submit"
            className="group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-all duration-150 cursor-pointer outline-none text-left"
          >
            <LogOut className="h-5 w-5 shrink-0 text-text-muted group-hover:text-error transition-colors duration-150" />
            Sair
          </button>
        </Form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixo) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 z-20">
        {renderContent()}
      </aside>

      {/* Mobile Drawer (Responsive Dialog) */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
          {/* Backdrop overlay */}
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          </TransitionChild>

          <div className="fixed inset-0 flex z-40">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative flex-1 flex flex-col max-w-xs w-full focus:outline-none">
                {renderContent()}
              </DialogPanel>
            </TransitionChild>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Force sidebar to shrink instead of covering full screen */}
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
