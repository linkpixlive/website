import { Menu } from "@base-ui/react/menu";
import { Form, Link, useRouteLoaderData } from "react-router";
import { Icon, type IconName } from "~/components/ui/Icon";
import { menuRowClasses, popupClasses } from "./header-styles";

export interface LayoutUser {
  id: string;
  name: string;
  email: string;
}

/** Reads the authenticated user provided by the private layout loader. */
export function useCurrentUser(): LayoutUser | null {
  const data = useRouteLoaderData("routes/private/layout") as
    | { user: LayoutUser }
    | undefined;

  return data?.user ?? null;
}

export function getUserInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ProfileMenuLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: IconName;
  label: string;
}) {
  return (
    <Menu.LinkItem render={<Link to={to} />} closeOnClick className={menuRowClasses}>
      <Icon name={icon} size={20} strokeWidth={1.9} className="shrink-0 text-chrome-icon" />
      {label}
    </Menu.LinkItem>
  );
}

export function ProfilePopover() {
  const user = useCurrentUser();
  const initials = user ? getUserInitials(user.name) : "?";

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Meu perfil"
        title="Meu perfil"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-[13px] font-extrabold text-on-brand shadow-xs transition-transform duration-150 cursor-pointer outline-none active:scale-95"
      >
        {initials}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50">
          <Menu.Popup className={`w-64 p-2 ${popupClasses}`}>
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-wash p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-[13px] font-extrabold text-on-brand">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-heading">
                  {user?.name ?? "Streamer"}
                </p>
                <p className="truncate text-xs font-medium text-ink-secondary">
                  {user?.email ?? "—"}
                </p>
              </div>
            </div>

            <ProfileMenuLink to="/perfil" icon="user-circle" label="Meu perfil" />
            <ProfileMenuLink
              to="/conta"
              icon="settings"
              label="Configurações da conta"
            />

            <div role="separator" className="my-2 border-t border-line" />

            <Form method="post" action="/carteira">
              <input type="hidden" name="intent" value="logout" />
              <Menu.Item
                render={<button type="submit" />}
                className={`${menuRowClasses} text-error data-[highlighted]:bg-danger-wash data-[highlighted]:text-error`}
              >
                <Icon name="logout" size={20} strokeWidth={1.9} className="shrink-0" />
                Sair da conta
              </Menu.Item>
            </Form>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
