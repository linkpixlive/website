import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { useDonationStatus } from "~/hooks/useDonationStatus";
import type {
  DonationPayment,
  StreamerProfile,
  TtsVoice,
} from "~/types/donation";
import type { DonationFormValues } from "~/validators/donation-validator";
import { createDonationSchema } from "~/validators/donation-validator";
import {
  DEFAULT_VOICE_VALUE,
  DonationFormInner,
  type DonationFormInput,
  type DonationFormOutput,
} from "./DonationForm";
import { PaymentStep } from "./PaymentStep";
import { StreamerProfileCardInner } from "./StreamerProfileCard";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Trecho da mensagem genérica que o backend devolve quando a moderação IA
 * barra nome/mensagem antes do QRCode. Não revela categoria nem palavra —
 * o doador só precisa editar e tentar de novo.
 */
const MODERATION_BLOCK_HINT = "Mensagem não permitida";

function isModerationBlock(message: string): boolean {
  return message.includes(MODERATION_BLOCK_HINT);
}

function focusDonationMessage() {
  requestAnimationFrame(() => {
    document
      .getElementById("donation-message")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("donation-message")?.focus({ preventScroll: true });
  });
}

interface UnifiedDonationCardProps {
  profile: StreamerProfile;
  voices: TtsVoice[];
  onCreateDonation: (values: DonationFormValues) => Promise<DonationPayment>;
  className?: string;
}

export function UnifiedDonationCard({
  profile,
  voices,
  onCreateDonation,
  className,
}: UnifiedDonationCardProps) {
  const navigate = useNavigate();
  const [payment, setPayment] = useState<DonationPayment | null>(null);
  const [donation, setDonation] = useState<DonationFormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useDonationStatus(payment?.id ?? null, {
    enabled: !!payment,
  });

  // O formulário vive aqui (fora dos passos) para preservar os valores
  // quando o doador volta a editar após gerar o Pix.
  const form = useForm<DonationFormInput, unknown, DonationFormOutput>({
    resolver: zodResolver(
      createDonationSchema(profile.maxLength, profile.minTextAmount * 100),
    ),
    defaultValues: {
      name: "",
      message: "",
      amountText: "",
      voiceId: DEFAULT_VOICE_VALUE,
    },
  });

  useEffect(() => {
    if (payment && status === "paid") {
      // `u` garante que a confirmação saiba voltar para o streamer mesmo se
      // o backend omitir streamerUsername no GET /donation/:id.
      navigate(
        `/doacao/${payment.id}?u=${encodeURIComponent(profile.username)}`,
      );
    }
  }, [payment, status, navigate, profile.username]);

  async function handleSubmit(values: DonationFormValues) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await onCreateDonation(values);
      setDonation(values);
      setPayment(result);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Não foi possível criar a doação. Tente novamente.";
      setError(message);
      // Bloqueio da moderação: o formulário preserva os valores (o form vive
      // fora dos passos) e o doador é levado de volta ao campo da mensagem.
      if (isModerationBlock(message)) focusDonationMessage();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegenerate() {
    if (!donation) return;
    setRegenerating(true);
    setError(null);
    try {
      const result = await onCreateDonation(donation);
      setPayment(result);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Não foi possível gerar um novo QR Code. Tente novamente.";
      setError(message);
      if (isModerationBlock(message)) focusDonationMessage();
    } finally {
      setRegenerating(false);
    }
  }

  function handleEditDonation() {
    setPayment(null);
  }

  return (
    <div
      className={cn(
        "rounded-[26px] bg-card border border-line shadow-xs overflow-hidden animate-fade-in",
        className,
      )}
    >
      <div className="sticky top-0 z-10 bg-card border-b border-line p-5">
        <StreamerProfileCardInner profile={profile} />
      </div>

      <div className="p-5 pt-5">
        <div className={cn(payment && "hidden")}>
          {error && (
            <div className="mb-4">
              <AlertMessage variant="error" message={error} />
            </div>
          )}
          <DonationFormInner
            profile={profile}
            voices={voices}
            loading={submitting || regenerating}
            form={form}
            onSubmit={handleSubmit}
          />
        </div>

        {payment && (
          <>
            {error && (
              <div className="mb-4">
                <AlertMessage variant="error" message={error} />
              </div>
            )}
            <PaymentStep
              payment={payment}
              regenerating={regenerating}
              paymentFailed={status === "failed"}
              onRegenerate={handleRegenerate}
              onEdit={handleEditDonation}
            />
          </>
        )}
      </div>
    </div>
  );
}
