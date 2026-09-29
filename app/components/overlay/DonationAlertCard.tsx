import type { OverlayDonationEntity } from "~/types/queue";
import { formatBRLReais } from "~/util/currency";
import { TestBadge } from "~/components/ui/QueueBadges";

interface DonationAlertCardProps {
  donation: OverlayDonationEntity;
}

export function DonationAlertCard({ donation }: DonationAlertCardProps) {
  const { name, amount, message, isTest } = donation;

  return (
    <div className="animate-scale-in w-[400px] max-w-[92vw] rounded-[26px] bg-card border border-line-input shadow-xl p-6">

      {isTest && (
        <span className="mb-3 block w-fit">
          <TestBadge size="sm" />
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-wash border border-line-input flex items-center justify-center shrink-0">
          <span className="text-base font-extrabold text-ink-heading">
            {name.charAt(0).toUpperCase() || "?"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-lg font-extrabold text-ink-heading leading-tight truncate">
            {name}
          </p>
          <p className="text-sm font-extrabold text-ink-heading leading-snug">
            {formatBRLReais(amount)}
          </p>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm font-medium text-ink-secondary leading-relaxed line-clamp-3 break-words">
          {message}
        </p>
      )}
    </div>
  );
}
