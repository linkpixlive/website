import { Menu } from "@base-ui/react/menu";
import { Icon } from "~/components/ui/Icon";
import { popupClasses } from "~/components/ui/header-styles";
import { isSafeMediaUrl } from "~/util/safe-url";
import { getUserInitials, ProfileMenuContent, useCurrentUser } from "./ProfilePopover";
import { getPublicPageUrl } from "./menu";

interface StreamerFooterProps {
  onNavigate?: () => void;
  onOpenNovidades?: () => void;
  hasUnseenNovidades?: boolean;
  compact?: boolean;
}

export function StreamerFooter({
  onNavigate,
  onOpenNovidades,
  hasUnseenNovidades,
  compact = false,
}: StreamerFooterProps) {
  const user = useCurrentUser();
  const username = user?.username;

  return (
    <div className="w-full border-t border-white/10 pt-3">
      {user && username ? (
        <Menu.Root>
          <div className="flex min-w-0 items-center gap-1">
            <Menu.Trigger
            render={<button type="button" />}
            aria-label="Abrir menu da conta"
            title={compact ? user.name : undefined}
            className={`flex w-full cursor-pointer items-center rounded-2xl py-2 text-left outline-none transition-[padding-left,padding-right,gap,background-color] duration-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand/40 ${
              compact ? "gap-0 pr-0 pl-[calc((88px-32px-36px)/2)]" : "gap-2.5 px-3"
            }`}
          >
            {user.profileImageUrl && isSafeMediaUrl(user.profileImageUrl) ? (
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
            <span
              className={`min-w-0 flex-1 overflow-hidden transition-[max-width,opacity] duration-300 ${
                compact
                  ? "max-w-0 opacity-0 delay-[0ms]"
                  : "max-w-[160px] opacity-100 delay-200"
              }`}
            >
              <span className="block truncate text-[13px] font-bold leading-tight text-white">
                {user.name}
              </span>
              <span className="block truncate text-[11px] font-medium text-ink-muted">
                @{username}
              </span>
            </span>
          </Menu.Trigger>
          {!compact && (
              <a
                href={getPublicPageUrl(username)}
                target="_blank"
                rel="noreferrer"
                title="Abrir minha página em nova aba"
                aria-label="Abrir minha página em nova aba"
                className="shrink-0 cursor-pointer rounded-full p-1.5 text-ink-muted outline-none transition-colors duration-150 hover:bg-white/5 hover:text-white active:scale-95"
              >
                <Icon name="square-arrow-right-up" size={16} strokeWidth={1.9} />
              </a>
            )}
          </div>
          <Menu.Portal>
            <Menu.Positioner side="top" align="start" sideOffset={8} className="z-50">
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
        <div className="flex min-w-0 items-center gap-2.5 rounded-2xl px-3 py-2">
          <span className="truncate text-[13px] font-semibold text-ink-muted">
            Carregando conta…
          </span>
        </div>
      )}
    </div>
  );
}
