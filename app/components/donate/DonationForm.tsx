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
import { DEFAULT_VOICE_VALUE } from "./VoiceSelectField";
import type { StreamerProfile, TtsVoice } from "~/types/donation";
import { formatCentsBRL, formatCentsToInput, parseCurrencyToCents } from "~/util/currency";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";

const AMOUNT_PRESET_MULTIPLIERS = [1, 1.2, 1.5, 2];
const LOW_AMOUNT_PRESETS_CENTS = [500, 1000, 2000, 5000, 10000];
const MIN_PRESET_GAP_CENTS = 200;

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
  const minCents = Math.round(profile.minTextAmount * 100);
  const amountPresets =
    minCents <= 1000
      ? [
          minCents,
          ...LOW_AMOUNT_PRESETS_CENTS.filter(
            (cents) => cents - minCents >= MIN_PRESET_GAP_CENTS,
          ).slice(0, 3),
        ]
      : AMOUNT_PRESET_MULTIPLIERS.map((multiplier) =>
          Math.round(minCents * multiplier),
        );

  const handleAmountSelect = (cents: number) => {
    setValue("amountText", formatCentsToInput(cents), { shouldValidate: true, shouldDirty: true });
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
        <span className={`block ${SECTION_HEADING_CLASS}`}>
          Fazer uma doação
        </span>

        <FormField
          label="Seu nome (opcional)"
          {...register("name")}
          error={errors.name?.message}
          placeholder="Opcional: como quer aparecer no alerta?"
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

        <div className="-mt-2 flex flex-col gap-2">
          <label htmlFor="donation-amount" className="text-[13px] font-medium text-ink-secondary">
            Valor
          </label>
          <CurrencyInput
            name="amountText"
            placeholder="0,00"
            disabled={loading}
            minCents={minCents}
            error={amountError}
          />
          <AmountPresetPills
            presets={amountPresets}
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
            ? ` ${formatCentsBRL(parseCurrencyToCents(watchedAmount))}`
            : ""}
        </SubmitButton>
      </form>
    </FormProvider>
  );
}
