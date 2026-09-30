import { Menu } from "@base-ui/react/menu";
import { Icon } from "~/components/ui/Icon";
import { popupClasses } from "~/components/ui/header-styles";
import { getPublicPageUrl } from "./menu";
import { isSafeMediaUrl } from "~/util/safe-url";
import {
  getUserInitials,
  ProfileMenuContent,
  useCurrentUser,
} from "./ProfilePopover";

interface StreamerFooterProps {
  onNavigate?: () => void;
  onOpenNovidades?: () => void;
  hasUnseenNovidades?: boolean;
}

export function StreamerFooter({
  onNavigate,
  onOpenNovidades,
  hasUnseenNovidades,
}: StreamerFooterProps) {
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
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-left outline-none transition-colors duration-150 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand/40"
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
