import { NavLink } from "react-router";
import { Icon } from "~/components/ui/Icon";
import { menuItems, type MenuItem } from "./menu";

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

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1"
    >
      {menuItems.map((item) => (
        <InternalRow key={item.to} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
