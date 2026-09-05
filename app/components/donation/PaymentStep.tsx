import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";
import { useCountdown } from "~/hooks/useCountdown";
import type { DonationPayment } from "~/types/donation";
import { formatBRL } from "~/util/currency";

export interface DonationSummary {
  donorName: string;
  message: string;
  voiceName: string | null;
}

interface PaymentStepProps {
  payment: DonationPayment;
  streamerName: string;
  donation: DonationSummary;
  regenerating: boolean;
  onRegenerate: () => void;
  onEdit: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3.5 py-2.5">
      <span className="text-xs font-medium text-ink-muted shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-ink-heading text-right break-words line-clamp-2">
        {value}
      </span>
    </div>
  );
}

export function PaymentStep({
  payment,
  streamerName,
  donation,
  regenerating,
  onRegenerate,
  onEdit,
}: PaymentStepProps) {
  const { formatted, isExpired } = useCountdown(payment.expiredAt);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payment.pix);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
        Pagamento
      </span>

      <p className="text-[13px] font-medium text-ink-secondary leading-snug max-w-[34ch]">
        Escaneie o QR Code para doar{" "}
        <span className="font-bold text-ink-heading">{formatBRL(payment.amount)}</span> para{" "}
        <span className="font-bold text-ink-heading">{streamerName}</span>.
      </p>

      <div className="w-full rounded-2xl bg-wash border border-line divide-y divide-line text-left">
        <SummaryRow label="Nome" value={donation.donorName} />
        {donation.message && <SummaryRow label="Mensagem" value={donation.message} />}
        <SummaryRow label="Voz" value={donation.voiceName ?? "Voz padrão do streamer"} />
      </div>

      {isExpired ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <Icon name="danger-circle" size={32} strokeWidth={1.9} className="text-error" />
          <p className="text-lg font-extrabold tracking-tight text-ink-heading">
            QR Code expirado
          </p>
          <p className="text-xs font-medium text-ink-muted leading-relaxed max-w-[32ch]">
            O tempo para pagamento acabou. Gere um novo QR Code para concluir sua doação.
          </p>
        </div>
      ) : (
        <>
          <div className="inline-block rounded-2xl border border-line bg-white p-4 shadow-2xs">
            <QRCodeSVG value={payment.pix} size={180} fgColor="#11151e" bgColor="#ffffff" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-body">
              <Icon name="clock-circle" size={16} strokeWidth={2} className="text-ink-secondary" />
              Expira em{" "}
              <span className="font-bold text-ink-heading tabular-nums">{formatted}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Aguardando pagamento…
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-wash hover:bg-wash-hover text-xs font-bold text-ink-body transition-colors duration-150 cursor-pointer outline-none active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Icon name="check-circle" size={16} strokeWidth={2.3} className="text-success" />
                <span className="text-success">Copiado!</span>
              </>
            ) : (
              <>
                <Icon name="copy" size={16} strokeWidth={1.9} className="text-chrome-icon" />
                Copiar código Pix (copia e cola)
              </>
            )}
          </button>
        </>
      )}

      <div className="w-full flex flex-col gap-2 pt-1">
        {isExpired && (
          <Button loading={regenerating} onClick={onRegenerate} className="w-full">
            {!regenerating && <Icon name="refresh" size={16} strokeWidth={2} />}
            Gerar novo QR Code
          </Button>
        )}
        <Button variant="secondary" onClick={onEdit} className="w-full">
          Editar doação
        </Button>
      </div>
    </div>
  );
}
