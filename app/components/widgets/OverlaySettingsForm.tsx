import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  overlaySchema,
  type OverlayFormValues,
} from "~/validators/overlay-validator";
import { Switch } from "~/components/ui/Switch";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
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
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-bold text-ink-heading">{title}</p>
        <p className="mt-0.5 text-[13px] font-medium text-ink-secondary">
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
  const savedNarrator = widget.settings.defaultNarrator;
  const savedVoiceMissing =
    savedNarrator !== "" && !voices.some((v) => v.id === savedNarrator);
  const initialNarrator = savedVoiceMissing
    ? (voices[0]?.id ?? savedNarrator)
    : savedNarrator;
  const fallbackVoiceName = voices[0]?.name;

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
    <section aria-labelledby="widgets-sound-heading">
      <p className={SECTION_HEADING_CLASS}>02 · Como soa</p>
      <h2
        id="widgets-sound-heading"
        className="mt-1.5 text-lg font-extrabold tracking-tight text-ink-heading"
      >
        O som do alerta
      </h2>

      {savedVoiceMissing && (
        <div className="mt-3">
          <AlertMessage
            variant="info"
            message={`A voz salva não existe mais — usando ${fallbackVoiceName ?? "a primeira disponível"}. Salve para confirmar a troca.`}
          />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
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
              hint="Voz usada quando o doador não escolher nenhuma personalizada."
              includeDefaultOption={false}
            />
          )}
        />

        <div className="mt-6 flex max-w-sm flex-col gap-2">
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
        </div>

        <div className="mt-6 divide-y divide-line/60 border-t border-line">
          <ToggleField
            title="Narrar nome e valor"
            description="O TTS diz quem doou e quanto antes de ler a mensagem."
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
        </div>

        <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className={`text-xs font-semibold ${isDirty ? "text-ink-secondary" : "invisible"}`}
          >
            Alterações não salvas
          </p>
          <SubmitButton loading={loading} className="w-full sm:w-auto">
            Salvar
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
