import { Icon } from "~/components/ui/Icon";
import type { StreamerProfile } from "~/types/donation";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface StreamerProfileCardProps {
  profile: StreamerProfile;
  className?: string;
}

function StreamerProfileCardInner({ profile, className }: StreamerProfileCardProps & { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center text-center gap-3", className)}>
      {profile.profileImageUrl ? (
        <img
          src={profile.profileImageUrl}
          alt={`Foto de ${profile.name}`}
          className="size-[72px] rounded-full object-cover border-2 border-white shadow-2xs"
        />
      ) : (
        <span className="size-[72px] rounded-full object-cover border-2 border-white shadow-2xs bg-media-void flex items-center justify-center overflow-hidden">
          <Icon name="user" size={32} strokeWidth={1.9} className="text-white" />
        </span>
      )}

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-extrabold tracking-tight text-ink-heading">
            {profile.name}
          </h1>
          {profile.overlayActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand text-on-brand text-[10px] font-extrabold uppercase tracking-wide">
              Ao vivo
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-wash text-ink-muted text-[10px] font-extrabold uppercase tracking-wide">
              Offline
            </span>
          )}
        </div>
        <p className="text-[13px] font-medium text-ink-muted">@{profile.username}</p>
      </div>
    </div>
  );
}

export function StreamerProfileCard({ profile, className }: StreamerProfileCardProps) {
  return (
    <div className={cn("rounded-[26px] bg-card border border-line shadow-xs p-5", className)}>
      <StreamerProfileCardInner profile={profile} />
    </div>
  );
}

export { StreamerProfileCardInner };