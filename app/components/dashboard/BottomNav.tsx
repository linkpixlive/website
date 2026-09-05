import { NavLink } from "react-router";
import { Icon, type IconName } from "~/components/ui/Icon";

interface BottomNavProps {
  onOpenMenu: () => void;
}

const menuItems: { label: string; to: string; icon: IconName; end?: boolean }[] = [
  { label: "Dashboard", to: "/", icon: "widget-2", end: true },
  { label: "Carteira", to: "/carteira", icon: "wallet" },
  { label: "Widgets", to: "/widgets", icon: "widget" },
  { label: "Doações", to: "/doacoes", icon: "list" },
  { label: "Perfil", to: "/perfil", icon: "user-circle" },
  { label: "Conta", to: "/conta", icon: "settings" },
];

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-shell border-t border-white/10 flex"
      aria-label="Navegação principal"
    >
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-text-secondary hover:text-white active:scale-95 transition-all duration-150 cursor-pointer outline-none"
        aria-label="Abrir menu completo"
      >
        <Icon name="hamburger-menu" size={22} strokeWidth={1.9} />
        <span>Menu</span>
      </button>

      {menuItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `relative flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors duration-150 outline-none ${
              isActive ? "text-white" : "text-text-secondary hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-brand rounded-b-full ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              />
              <Icon
                name={item.icon}
                size={22}
                strokeWidth={isActive ? 2.4 : 1.9}
                className={`transition-transform duration-150 ${isActive ? "scale-105" : ""}`}
              />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
