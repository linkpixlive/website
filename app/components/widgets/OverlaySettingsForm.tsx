import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  overlaySchema,
  type OverlayFormValues,
} from "~/validators/overlay-validator";
import { Switch } from "~/components/ui/Switch";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { cn } from "~/util/cn";
import { VoiceSelectField } from "~/components/donate/VoiceSelectField";
import { RangeSlider } from "~/components/ui/RangeSlider";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useUnsavedChanges } from "~/components/ui/UnsavedChangesProvider";
import type { Widget, OverlaySettings } from "~/api/modules/widgets";
import type { TtsVoice } from "~/types/donation";

function ToggleField({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-bold text-ink-heading">{title}</p>
        <p className="text-[13px] font-medium text-ink-secondary mt-0.5">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

export function OverlaySettingsForm({
  widget,
  voices,
  loading,
  onSubmit,
}: {
  widget: Widget<OverlaySettings>;
  voices: TtsVoice[];
  loading: boolean;
  onSubmit: (data: OverlayFormValues) => void;
}) {
  const initialNarrator = voices.some(
    (v) => v.id === widget.settings.defaultNarrator,
  )
    ? widget.settings.defaultNarrator
    : (voices[0]?.id ?? widget.settings.defaultNarrator);

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OverlayFormValues>({
    resolver: zodResolver(overlaySchema),
    defaultValues: {
      volume: widget.settings.volume,
      speakNameAmount: widget.settings.speakNameAmount,
      audioOnly: widget.settings.audioOnly ?? false,
      defaultNarrator: initialNarrator,
    },
  });

  const volumeValue = watch("volume");
  useUnsavedChanges(isDirty);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={CARD_CLASS}>
        <span className={cn(SECTION_HEADING_CLASS, "block mb-4")}>
          Configurações
        </span>

        <div className="flex flex-col gap-6">
          <Controller
            name="defaultNarrator"
            control={control}
            render={({ field }) => (
              <VoiceSelectField
                label="Narrador padrão (TTS)"
                voices={voices}
                value={field.value}
                onChange={(voiceId) => field.onChange(voiceId ?? "")}
                error={errors.defaultNarrator?.message}
                disabled={loading || voices.length === 0}
                hint="Voz usada por padrão quando o doador não escolher nenhuma voz personalizada."
                includeDefaultOption={false}
              />
            )}
          />

          <div className="flex flex-col gap-2 max-w-xs">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-ink-secondary">
                Volume do áudio
              </label>
              <span className="text-sm font-bold text-ink-heading">
                {volumeValue}%
              </span>
            </div>
            <Controller
              name="volume"
              control={control}
              render={({ field }) => (
                <RangeSlider
                  min={0}
                  max={100}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                  aria-label="Volume do áudio"
                />
              )}
            />
            <p className="text-xs font-medium text-ink-muted">
              Controle o volume dos alertas.
            </p>
          </div>

          <ToggleField
            title="Narrar nome e valor"
            description="O TTS dirá o nome do doador e o valor antes de ler a mensagem."
          >
            <Controller
              name="speakNameAmount"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                  label="Narrar nome e valor"
                />
              )}
            />
          </ToggleField>

          <ToggleField
            title="Somente áudio (sem visual)"
            description="Esconde o overlay visual, mantém apenas o áudio."
          >
            <Controller
              name="audioOnly"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                  label="Somente áudio (sem visual)"
                />
              )}
            />
          </ToggleField>

          <div className="flex justify-end pt-4 border-t border-line">
            <SubmitButton loading={loading} className="w-full sm:w-auto">
              Salvar Configurações
            </SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
