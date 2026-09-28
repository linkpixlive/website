import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";
import { ConfirmationShell } from "./ConfirmationStates";
import type { DonationSummary } from "./PaymentStep";
import { formatCentsBRL } from "~/util/currency";

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
    <ConfirmationShell
      icon={
        <div className="relative flex items-center justify-center size-16">
          <span
            aria-hidden="true"
            className="absolute inline-flex size-16 rounded-full bg-success/20 animate-confirmed-ring motion-reduce:animate-none"
          />
          <span className="relative flex items-center justify-center size-16 rounded-full bg-success/10 animate-confirmed-pop motion-reduce:animate-none">
            <Icon name="check-circle" size={32} strokeWidth={2.3} className="text-success" />
          </span>
        </div>
      }
      title="Doação confirmada!"
      description={
        <>
          Sua doação de{" "}
          <span className="font-bold text-ink-heading">{formatCentsBRL(amount)}</span> para{" "}
          <span className="font-bold text-ink-heading">{streamerName}</span> foi recebida.
        </>
      }
    >
      {donation.message && (
        <p className="text-[13px] font-medium text-ink-body bg-wash rounded-2xl px-4 py-3 max-w-[36ch] leading-relaxed">
          “{donation.message}”
        </p>
      )}

      <Button variant="secondary" onClick={onNewDonation} className="w-full">
        Fazer nova doação
      </Button>
    </ConfirmationShell>
  );
}
