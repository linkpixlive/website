import { useState } from "react";
import { useForm } from "react-hook-form";
import { StreamerProfileCardInner } from "./StreamerProfileCard";
import {
  DonationFormInner,
  type DonationFormInstance,
  type DonationFormInput,
  type DonationFormOutput,
  DEFAULT_VOICE_VALUE,
} from "./DonationForm";
import { PaymentStep, type DonationSummary } from "./PaymentStep";
import { PaymentConfirmedStep } from "./PaymentConfirmedStep";
import { useDonationStatus } from "~/hooks/useDonationStatus";
import { createDonationSchema } from "~/validators/donation-validator";
import type { DonationFormValues } from "~/validators/donation-validator";
import type { DonationPayment, StreamerProfile, TtsVoice } from "~/types/donation";
import { zodResolver } from "@hookform/resolvers/zod";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
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
  const [payment, setPayment] = useState<DonationPayment | null>(null);
  const [donation, setDonation] = useState<DonationFormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { status } = useDonationStatus(payment?.id ?? null, { enabled: !!payment });
  const confirmed = !!payment && status === "paid";

  // O formulário vive aqui (fora dos passos) para preservar os valores
  // quando o doador volta a editar após gerar o Pix.
  const form = useForm<DonationFormInput, unknown, DonationFormOutput>({
    resolver: zodResolver(createDonationSchema(profile.maxLength, profile.minTextAmount * 100)),
    defaultValues: { name: "", message: "", amountText: "", voiceId: DEFAULT_VOICE_VALUE },
  });

  async function handleSubmit(values: DonationFormValues) {
    setSubmitting(true);
    const result = await onCreateDonation(values);
    setDonation(values);
    setPayment(result);
    setSubmitting(false);
  }

  async function handleRegenerate() {
    if (!donation) return;
    setRegenerating(true);
    const result = await onCreateDonation(donation);
    setPayment(result);
    setRegenerating(false);
  }

  function handleEditDonation() {
    setPayment(null);
  }

  function handleNewDonation() {
    form.reset({ name: "", message: "", amountText: "", voiceId: DEFAULT_VOICE_VALUE });
    setDonation(null);
    setPayment(null);
  }

  const summary: DonationSummary | null = donation
    ? {
        donorName: donation.name,
        message: donation.message,
        voiceName: voices.find((voice) => voice.id === donation.voiceId)?.name ?? null,
      }
    : null;

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
          <DonationFormInner
            profile={profile}
            voices={voices}
            loading={submitting || regenerating}
            form={form}
            onSubmit={handleSubmit}
          />
        </div>

        {payment && summary && (
          <>
            <div className={cn(confirmed && "hidden")}>
              <PaymentStep
                payment={payment}
                streamerName={profile.name}
                donation={summary}
                regenerating={regenerating}
                onRegenerate={handleRegenerate}
                onEdit={handleEditDonation}
              />
            </div>
            <div className={cn(!confirmed && "hidden")}>
              <PaymentConfirmedStep
                amount={payment.amount}
                streamerName={profile.name}
                donation={summary}
                onNewDonation={handleNewDonation}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
