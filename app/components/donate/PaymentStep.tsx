import { QRCodeSVG } from "qrcode.react";
import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";
import { useCountdown } from "~/hooks/useCountdown";
import { CopyButton } from "~/components/ui/CopyButton";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { ConfirmationShell } from "./ConfirmationStates";
import type { DonationPayment } from "~/types/donation";

export interface DonationSummary {
  donorName: string;
  message: string;
  voiceName: string | null;
}

interface PaymentStepProps {
  payment: DonationPayment;
  regenerating: boolean;
  paymentFailed?: boolean;
  onRegenerate: () => void;
  onEdit: () => void;
}

export function PaymentStep({
  payment,
  regenerating,
  paymentFailed = false,
  onRegenerate,
  onEdit,
}: PaymentStepProps) {
  const { formatted, isExpired } = useCountdown(payment.expiredAt);

  return (
    <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
      {paymentFailed ? (
        <ConfirmationShell
          kicker="Pagamento"
          icon={<Icon name="danger-circle" size={32} strokeWidth={1.9} className="text-error" />}
          title="Não conseguimos confirmar o pagamento"
          description="Houve um problema ao processar sua doação. Se você pagou, fale com o streamer — ou gere um novo QR Code para tentar novamente."
        />
      ) : isExpired ? (
        <ConfirmationShell
          kicker="Pagamento"
          icon={<Icon name="danger-circle" size={32} strokeWidth={1.9} className="text-error" />}
          title="QR Code expirado"
          description="O tempo para pagamento acabou. Gere um novo QR Code para concluir sua doação."
        />
      ) : (
        <>
          <span className={`block ${SECTION_HEADING_CLASS}`}>
            Pagamento
          </span>
          {/* QR exige fundo claro fixo para leitura em ambos os temas. */}
          <div className="inline-block rounded-2xl border border-line bg-white p-4">
            <QRCodeSVG value={payment.pix} size={180} fgColor="#11151e" bgColor="#ffffff" />
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-body">
            <Icon name="clock-circle" size={16} strokeWidth={2} className="text-ink-secondary" />
            Expira em{" "}
            <span className="font-bold text-ink-heading tabular-nums">{formatted}</span>
          </div>

          <CopyButton
            variant="pill"
            text={payment.pix}
            copiedChildren={
              <>
                <Icon name="check-circle" size={16} strokeWidth={2.3} className="text-success" />
                <span className="text-success">Copiado!</span>
              </>
            }
          >
            <Icon name="copy" size={16} strokeWidth={1.9} className="text-chrome-icon" />
            Copiar código Pix (copia e cola)
          </CopyButton>
        </>
      )}

      <div className="w-full flex flex-col gap-2 pt-1">
        {(isExpired || paymentFailed) && (
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
