import { Icon } from "~/components/ui/Icon";
import { isSafeMediaUrl } from "~/util/safe-url";
import { cn } from "~/util/cn";
import type { StreamerProfile } from "~/types/donation";

interface StreamerProfileCardProps {
  profile: StreamerProfile;
  className?: string;
}

function StreamerProfileCard({ profile, className }: StreamerProfileCardProps) {
  return (
    <div className={cn("flex flex-row items-center text-left gap-3.5", className)}>
      <div className="relative shrink-0">
        {profile.profileImageUrl && isSafeMediaUrl(profile.profileImageUrl) ? (
          <img
            src={profile.profileImageUrl}
            alt={`Foto de ${profile.name}`}
            className="size-[56px] rounded-full object-cover border-2 border-line"
          />
        ) : (
          <span className="size-[56px] rounded-full object-cover border-2 border-line bg-media-void flex items-center justify-center overflow-hidden">
            <Icon name="user" size={28} strokeWidth={1.9} className="text-white" />
          </span>
        )}
        {profile.overlayActive && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-solid text-white text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap">
            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Ao vivo
          </span>
        )}
      </div>

      <div className="flex flex-col items-start gap-0.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <h1 className="text-base font-extrabold tracking-tight text-ink-heading truncate">
            {profile.name}
          </h1>
          {profile.verified && (
            <span
              role="img"
              aria-label={`Página oficial de ${profile.name}`}
              title={`Página oficial de ${profile.name}`}
              className="inline-flex shrink-0"
            >
              <Icon name="check-circle" size={16} strokeWidth={2.3} className="text-info" />
            </span>
          )}
        </div>
        <p className="text-[13px] font-medium text-ink-muted truncate">@{profile.username}</p>
      </div>
    </div>
  );
}

export { StreamerProfileCard };