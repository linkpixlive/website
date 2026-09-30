import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useDonationStatus } from "~/hooks/useDonationStatus";
import { DonationRequestError } from "~/api/modules/public-donations";
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

const MODERATION_BLOCK_HINT = "Mensagem não permitida";
const MODERATION_BLOCK_CODES: ReadonlyArray<unknown> = ["MODERATION_BLOCKED"];

function isModerationBlock(error: unknown): boolean {
  if (
    error instanceof DonationRequestError &&
    MODERATION_BLOCK_CODES.includes(error.code)
  ) {
    return true;
  }
  const message = error instanceof Error ? error.message : "";
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
  const { status, connectionLost } = useDonationStatus(payment?.id ?? null, {
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
      navigate(`/doacao/${payment.id}`);
    }
  }, [payment, status, navigate]);

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
      if (isModerationBlock(e)) focusDonationMessage();
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
    connectionLost,
    handleSubmit,
    handleRegenerate,
    handleEditDonation,
  };
}
