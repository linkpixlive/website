import { Menu } from "@base-ui/react/menu";
import { Form, Link, useRouteLoaderData } from "react-router";
import { Icon, type IconName } from "~/components/ui/Icon";
import { useTheme } from "~/components/ui/useTheme";
import { menuRowClasses, menuRowDangerClasses } from "./header-styles";
import { getPublicPageUrl } from "./menu";

export interface LayoutUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  profileImageUrl?: string | null;
  usernameChangedAt?: string | null;
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
  onNavigate,
}: {
  to: string;
  icon: IconName;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Menu.LinkItem
      render={<Link to={to} onClick={onNavigate} />}
      closeOnClick
      className={menuRowClasses}
    >
      <Icon name={icon} size={20} strokeWidth={1.9} className="shrink-0 text-chrome-icon" />
      {label}
    </Menu.LinkItem>
  );
}

export function ProfileMenuContent({
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
  const { theme, toggleTheme } = useTheme();
  const initials = user ? getUserInitials(user.name) : "?";

  return (
    <>
      <div className="mb-2 flex items-center gap-3 rounded-xl bg-wash p-3">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt=""
            aria-hidden="true"
            className="h-10 w-10 shrink-0 rounded-full object-cover border border-white shadow-2xs"
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-[13px] font-extrabold text-on-brand">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink-heading">
            {user?.name ?? "Streamer"}
          </p>
          <p className="truncate text-xs font-medium text-ink-secondary">
            {user?.email ?? "—"}
          </p>
        </div>
      </div>

      <ProfileMenuLink
        to="/configuracoes/conta"
        icon="lock"
        label="Conta"
        onNavigate={onNavigate}
      />
      {username && (
        <Menu.LinkItem
          render={
            <a
              href={getPublicPageUrl(username)}
              target="_blank"
              rel="noreferrer"
              onClick={onNavigate}
              title="Minha página (abre em nova aba)"
            />
          }
          closeOnClick
          className={menuRowClasses}
        >
          <Icon
            name="link-minimalistic"
            size={20}
            strokeWidth={1.9}
            className="shrink-0 text-chrome-icon"
          />
          Minha página
          <Icon
            name="square-arrow-right-up"
            size={14}
            strokeWidth={1.9}
            className="ml-auto shrink-0 text-ink-secondary"
          />
        </Menu.LinkItem>
      )}

      <Menu.Item
        render={<button type="button" />}
        onClick={onOpenNovidades}
        className={menuRowClasses}
      >
        <Icon
          name="letter"
          size={20}
          strokeWidth={1.9}
          className="shrink-0 text-chrome-icon"
        />
        Novidades
        {hasUnseenNovidades && (
          <span
            aria-label="Há novidades não vistas"
            className="ml-auto h-2 w-2 shrink-0 rounded-full bg-brand"
          />
        )}
      </Menu.Item>

      <Menu.Item
        render={<button type="button" />}
        closeOnClick={false}
        onClick={toggleTheme}
        className={menuRowClasses}
      >
        <Icon
          name={theme === "dark" ? "sun" : "moon"}
          size={20}
          strokeWidth={1.9}
          className="shrink-0 text-chrome-icon"
        />
        Aparência
        <span className="ml-auto rounded-full bg-wash px-2 py-0.5 text-[11px] font-bold text-ink-secondary">
          {theme === "dark" ? "Escuro" : "Claro"}
        </span>
      </Menu.Item>

      <div role="separator" className="my-2 border-t border-line" />

      <Form method="post" action="/carteira">
        <input type="hidden" name="intent" value="logout" />
        <Menu.Item render={<button type="submit" />} className={menuRowDangerClasses}>
          <Icon name="logout" size={20} strokeWidth={1.9} className="shrink-0" />
          Sair da conta
        </Menu.Item>
      </Form>
    </>
  );
}
