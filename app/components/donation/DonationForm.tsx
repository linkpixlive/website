import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { FormField } from "~/components/ui/FormField";
import { FieldError } from "~/components/ui/FieldError";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { AutoGrowTextarea } from "~/components/ui/AutoGrowTextarea";
import { CurrencyInput } from "~/components/ui/CurrencyInput";
import { AmountPresetPills } from "./AmountPresetPills";
import { VoiceSelectField } from "./VoiceSelectField";
import { createDonationSchema, type DonationFormValues } from "~/validators/donation-validator";
import type { StreamerProfile, TtsVoice } from "~/types/donation";
import { formatBRL, parseCurrencyToCents } from "~/util/currency";

const AMOUNT_PRESETS_CENTS = [500, 1000, 2000, 5000];

export const DEFAULT_VOICE_VALUE = "default";

export type DonationFormInput = z.input<ReturnType<typeof createDonationSchema>>;
export type DonationFormOutput = z.output<ReturnType<typeof createDonationSchema>>;

export type DonationFormInstance = UseFormReturn<
  DonationFormInput,
  unknown,
  DonationFormOutput
>;

interface DonationFormProps {
  profile: StreamerProfile;
  voices: TtsVoice[];
  loading: boolean;
  form: DonationFormInstance;
  onSubmit: (values: DonationFormValues) => void;
}

export function DonationFormInner({
  profile,
  voices,
  loading,
  form,
  onSubmit,
}: DonationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const watchedAmount = watch("amountText") ?? "";
  const watchedMessage = watch("message") ?? "";
  const watchedVoiceId = watch("voiceId") ?? null;

  const handleAmountSelect = (cents: number) => {
    const formatted = (cents / 100).toFixed(2).replace(".", ",");
    setValue("amountText", formatted, { shouldValidate: true, shouldDirty: true });
  };

  const submitHandler = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      message: values.message,
      amount: values.amountText,
      voiceId: values.voiceId && values.voiceId !== DEFAULT_VOICE_VALUE ? values.voiceId : null,
    });
  });

  const messageError = errors.message?.message;
  const amountError = errors.amountText?.message;

  return (
    <FormProvider {...form}>
      <form onSubmit={submitHandler} className="flex flex-col gap-4">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
          Fazer uma doação
        </span>

        <FormField
          label="Seu nome"
          {...register("name")}
          error={errors.name?.message}
          placeholder="Como quer aparecer no alerta?"
          disabled={loading}
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="donation-message" className="text-[13px] font-medium text-ink-secondary">
            Mensagem
          </label>
          <AutoGrowTextarea
            id="donation-message"
            value={watchedMessage}
            onChange={(value) => form.setValue("message", value, { shouldValidate: true, shouldDirty: true })}
            maxLength={profile.maxLength}
            placeholder="Mande um carinho (ou um desafio) para o streamer..."
            disabled={loading}
            showCounter
            minRows={3}
            maxRows={6}
            className={
              messageError
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                : undefined
            }
          />
          <FieldError message={messageError} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="donation-amount" className="text-[13px] font-medium text-ink-secondary">
            Valor
          </label>
          <CurrencyInput
            name="amountText"
            placeholder="0,00"
            disabled={loading}
            minCents={profile.minTextAmount * 100}
            error={amountError}
          />
          <FieldError message={amountError} />
          <AmountPresetPills
            presets={AMOUNT_PRESETS_CENTS}
            selectedValue={watchedAmount}
            onSelect={handleAmountSelect}
            disabled={loading}
          />
        </div>

        <VoiceSelectField
          voices={voices}
          value={watchedVoiceId && watchedVoiceId !== DEFAULT_VOICE_VALUE ? watchedVoiceId : null}
          onChange={(voiceId) =>
            form.setValue("voiceId", voiceId ?? DEFAULT_VOICE_VALUE, {
              shouldValidate: false,
              shouldDirty: true,
            })
          }
          disabled={loading}
        />

        <SubmitButton loading={loading}>
          Doar
          {watchedAmount && parseCurrencyToCents(watchedAmount) > 0
            ? ` ${formatBRL(parseCurrencyToCents(watchedAmount))}`
            : ""}
        </SubmitButton>
      </form>
    </FormProvider>
  );
}

export function DonationForm(props: DonationFormProps) {
  return (
    <div className="rounded-[26px] bg-card border border-line shadow-xs p-5">
      <DonationFormInner {...props} />
    </div>
  );
}
