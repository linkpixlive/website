import { NavLink, useLocation } from "react-router";
import { Icon } from "~/components/ui/Icon";
import { menuItems, type MenuItem } from "./menu";

const rowBase =
  "flex w-full items-center rounded-2xl py-2.5 text-left text-[13px] font-bold outline-none transition-[padding-left,padding-right,gap,background-color,color] duration-300";

function InternalRow({
  item,
  onNavigate,
  forceActive,
  compact = false,
}: {
  item: MenuItem;
  onNavigate?: () => void;
  forceActive?: boolean;
  compact?: boolean;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={compact ? item.label : undefined}
      aria-label={item.label}
      className={({ isActive }) => {
        const active = isActive || forceActive;
        return `${rowBase} ${compact ? "gap-0 pr-0 pl-[calc((88px-32px-20px)/2)]" : "gap-3 px-4"} ${
          active
            ? "bg-brand-button text-on-brand"
            : "text-ink-muted hover:bg-white/5 hover:text-white"
        }`;
      }}
    >
      {({ isActive }) => {
        const active = isActive || forceActive;
        return (
          <>
            <span className="shrink-0">
              <Icon
                name={item.icon}
                size={20}
                strokeWidth={active ? 2.4 : 1.9}
                className={active ? "scale-105" : ""}
              />
            </span>
            <span
              className={`min-w-0 flex-1 truncate transition-[max-width,opacity] duration-300 ${
                compact
                  ? "max-w-0 opacity-0 delay-[0ms]"
                  : "max-w-[180px] opacity-100 delay-200"
              }`}
            >
              {item.label}
            </span>
          </>
        );
      }}
    </NavLink>
  );
}

export function SidebarNav({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Navegação principal"
      className="flex w-full flex-1 flex-col gap-1 overflow-y-auto py-2"
    >
      {menuItems.map((item) => {
        const forceActive =
          item.to.startsWith("/widgets") && pathname.startsWith("/widgets");
        return (
          <InternalRow
            key={item.to}
            item={item}
            onNavigate={onNavigate}
            forceActive={forceActive}
            compact={compact}
          />
        );
      })}
    </nav>
  );
}
