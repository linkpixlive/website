import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";
import type { DonationSummary } from "./PaymentStep";
import { formatBRL } from "~/util/currency";

interface PaymentConfirmedStepProps {
  amount: number;
  streamerName: string;
  donation: DonationSummary;
  onNewDonation: () => void;
}

export function PaymentConfirmedStep({
  amount,
  streamerName,
  donation,
  onNewDonation,
}: PaymentConfirmedStepProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
        Confirmação
      </span>

      <div className="flex items-center justify-center size-16 rounded-full bg-success/10">
        <Icon name="check-circle" size={32} strokeWidth={2.3} className="text-success" />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold tracking-tight text-ink-heading">
          Doação confirmada!
        </h2>
        <p className="text-[13px] font-medium text-ink-secondary leading-snug max-w-[34ch]">
          Sua doação de{" "}
          <span className="font-bold text-ink-heading">{formatBRL(amount)}</span> para{" "}
          <span className="font-bold text-ink-heading">{streamerName}</span> foi recebida.
        </p>
      </div>

      {donation.message && (
        <p className="text-[13px] font-medium text-ink-body bg-wash rounded-2xl px-4 py-3 max-w-[36ch] leading-relaxed">
          “{donation.message}”
        </p>
      )}

      <p className="text-xs font-medium text-ink-muted">
        — {donation.donorName} · Voz: {donation.voiceName ?? "padrão do streamer"}
      </p>

      <Button variant="secondary" onClick={onNewDonation} className="w-full">
        Fazer nova doação
      </Button>
    </div>
  );
}
