import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useDonationStatus } from "~/hooks/useDonationStatus";
import type {
  DonationPayment,
  StreamerProfile,
} from "~/types/donation";
import type { DonationFormValues } from "~/validators/donation-validator";
import { createDonationSchema } from "~/validators/donation-validator";
import {
  type DonationFormInput,
  type DonationFormOutput,
} from "./DonationForm";
import { DEFAULT_VOICE_VALUE } from "./VoiceSelectField";

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

/** Pagamento Pix do fluxo público: form (RHF vive aqui, preserva valores
 *  entre edições) + criar/regenerar + poll que redireciona ao confirmar. */
export function useDonationPayment({
  profile,
  onCreateDonation,
}: {
  profile: StreamerProfile;
  onCreateDonation: (values: DonationFormValues) => Promise<DonationPayment>;
}) {
  const navigate = useNavigate();
  const [payment, setPayment] = useState<DonationPayment | null>(null);
  const [donation, setDonation] = useState<DonationFormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useDonationStatus(payment?.id ?? null, {
    enabled: !!payment,
  });

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

  async function runDonationTask(
    task: () => Promise<DonationPayment>,
    fallbackMessage: string,
    setBusy: (busy: boolean) => void,
  ) {
    setBusy(true);
    setError(null);
    try {
      const result = await task();
      setPayment(result);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : fallbackMessage;
      setError(message);
      // Bloqueio da moderação: o formulário preserva os valores (o form vive
      // neste hook) e o doador é levado de volta ao campo da mensagem.
      if (isModerationBlock(message)) focusDonationMessage();
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(values: DonationFormValues) {
    const result = await runDonationTask(
      () => onCreateDonation(values),
      "Não foi possível criar a doação. Tente novamente.",
      setSubmitting,
    );
    if (result) setDonation(values);
  }

  async function handleRegenerate() {
    if (!donation) return;
    await runDonationTask(
      () => onCreateDonation(donation),
      "Não foi possível gerar um novo QR Code. Tente novamente.",
      setRegenerating,
    );
  }

  function handleEditDonation() {
    setPayment(null);
  }

  return {
    form,
    payment,
    submitting,
    regenerating,
    error,
    status,
    handleSubmit,
    handleRegenerate,
    handleEditDonation,
  };
}
