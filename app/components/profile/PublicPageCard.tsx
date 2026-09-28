import {
  getPublicPageUrl,
  PUBLIC_PAGE_BASE,
} from "~/components/dashboard/menu";
import type { LayoutUser } from "~/components/dashboard/ProfilePopover";
import { Icon } from "~/components/ui/Icon";
import type { StreamerProfile } from "~/types/donation";
import { ProfileCard } from "./ProfileCard";

export function PublicPageCard({
  user,
  publicProfile,
}: {
  user: LayoutUser;
  publicProfile: StreamerProfile | null;
}) {
  const username = user.username;
  const photoUrl =
    publicProfile?.profileImageUrl ?? user.profileImageUrl ?? null;

  return (
    <ProfileCard label="Minha página" className="lg:col-span-12">
      {username ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={photoUrl ?? "/default-avatar.svg"}
              alt="Prévia da foto na página pública"
              className="h-12 w-12 shrink-0 rounded-full object-cover border border-line"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink-heading">
                {publicProfile?.name ?? user.name}
                {publicProfile?.verified && (
                  <Icon
                    name="check-circle"
                    size={15}
                    strokeWidth={2}
                    className="shrink-0 text-info"
                    aria-label="Conta verificada"
                  />
                )}
              </p>
              <p className="truncate text-xs font-medium text-ink-muted mt-0.5">
                {PUBLIC_PAGE_BASE}{username}
              </p>
            </div>
          </div>
          <a
            href={getPublicPageUrl(username)}
            target="_blank"
            rel="noreferrer"
            title="Ver página pública (abre em nova aba)"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-wash px-4 h-10 text-xs font-bold text-ink-body transition-all duration-150 outline-none hover:bg-wash-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer"
          >
            <Icon name="square-arrow-right-up" size={16} strokeWidth={1.9} />
            Ver página
          </a>
        </div>
      ) : (
        <p className="text-[13px] font-medium text-ink-secondary">
          Defina seu username acima para ativar sua página pública de doações.
        </p>
      )}
    </ProfileCard>
  );
}
