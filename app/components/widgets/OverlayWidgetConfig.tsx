import { useState, useEffect } from "react";
import { useSubmit, useNavigation } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { VoiceSelectField } from "~/components/donation/VoiceSelectField";
import { RangeSlider } from "~/components/ui/RangeSlider";
import { SubmitButton } from "~/components/ui/SubmitButton";
import type { Widget, OverlaySettings } from "~/api/modules/widgets";
import type { TtsVoice } from "~/types/donation";

interface OverlayWidgetConfigProps {
  widget: Widget<OverlaySettings>;
  /** Mesma lista do formulário de doação (GET /voices). */
  voices: TtsVoice[];
}

const overlaySchema = z.object({
  volume: z.number().min(0).max(100),
  speakNameAmount: z.boolean(),
  audioOnly: z.boolean(),
  defaultNarrator: z.string().min(1, "Selecione um narrador"),
});

type OverlayFormValues = z.infer<typeof overlaySchema>;

export function OverlayWidgetConfig({
  widget,
  voices,
}: OverlayWidgetConfigProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [showUrl, setShowUrl] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Valor legado (ex.: "Ricardo") ou vazio (default novo do backend) não
  // existe na lista de vozes — pré-seleciona a 1ª voz ativa para exibição
  // e para o submit, em vez de travar o form com erro.
  const initialNarrator = voices.some(
    (v) => v.id === widget.settings.defaultNarrator,
  )
    ? widget.settings.defaultNarrator
    : (voices[0]?.id ?? widget.settings.defaultNarrator);

  // Form setup using react-hook-form
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<OverlayFormValues>({
    resolver: zodResolver(overlaySchema),
    defaultValues: {
      volume: widget.settings.volume,
      speakNameAmount: widget.settings.speakNameAmount,
      audioOnly: widget.settings.audioOnly ?? false,
      defaultNarrator: initialNarrator,
    },
  });

  // Watch volume to display its percentage in real-time
  const volumeValue = watch("volume");

  // SSR-safe: `window` não existe no servidor (F5/refresh renderiza no
  // servidor primeiro). Monta a URL absoluta só no cliente.
  const [widgetUrl, setWidgetUrl] = useState(`/overlay?token=${widget.token}`);

  useEffect(() => {
    setWidgetUrl(`${window.location.origin}/overlay?token=${widget.token}`);
  }, [widget.token]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(widgetUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 1600);
  };

  const onSubmit = (data: OverlayFormValues) => {
    const formData = new FormData();
    formData.append("intent", "saveOverlay");
    formData.append("volume", String(data.volume));
    formData.append("speakNameAmount", String(data.speakNameAmount));
    formData.append("audioOnly", String(data.audioOnly));
    formData.append("defaultNarrator", data.defaultNarrator);
    submit(formData, { method: "post" });
  };

  const handleTestAlert = () => {
    const formData = new FormData();
    formData.append("intent", "testAlert");
    submit(formData, { method: "post" });
  };

  const handleResetToken = () => {
    if (!confirm("Deseja realmente resetar o token de conexão do widget? A URL atual deixará de funcionar.")) {
      return;
    }
    const formData = new FormData();
    formData.append("intent", "resetToken");
    submit(formData, { method: "post" });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-secondary">
        Configure o overlay de alertas da sua{" "}
        <span className="font-bold text-ink-heading">transmissão</span>.
      </p>

      {/* URL de Conexão card */}
      <div className="rounded-[26px] bg-card border border-line shadow-xs p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
            URL de conexão
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleResetToken}
            disabled={isLoading}
          >
            <Icon name="refresh" size={14} strokeWidth={2} />
            Resetar Token
          </Button>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-1 bg-card border border-line-input rounded-full px-4 py-2.5 flex items-center min-w-0">
            <span
              className={`text-[13px] font-mono font-medium flex-1 truncate ${
                !showUrl ? "blur-md select-none pointer-events-none text-ink-body" : "text-ink-heading select-all"
              }`}
            >
              {widgetUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowUrl((v) => !v)}
            className="w-11 h-11 rounded-full bg-card hover:bg-tile border border-line shadow-xs text-chrome-icon transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
            title={showUrl ? "Ocultar URL" : "Mostrar URL"}
          >
            <Icon
              name={showUrl ? "eye-closed" : "eye"}
              size={18}
              strokeWidth={2}
              className="mx-auto"
            />
          </button>
          <button
            type="button"
            onClick={handleCopyUrl}
            className={`w-11 h-11 rounded-full border shadow-xs transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95 ${
              urlCopied
                ? "bg-success/10 border-success/20 text-success"
                : "bg-card hover:bg-tile border-line text-chrome-icon"
            }`}
            title={urlCopied ? "Copiado!" : "Copiar URL"}
          >
            <Icon
              name={urlCopied ? "check-circle" : "copy"}
              size={18}
              strokeWidth={2}
              className="mx-auto animate-fade-in"
            />
          </button>
        </div>

        <p
          className={`mt-2 text-xs font-semibold ${
            urlCopied ? "text-success" : "invisible"
          }`}
          aria-live="polite"
        >
          Copiado!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={handleTestAlert}
            disabled={isLoading}
          >
            <Icon name="test-tube" size={16} strokeWidth={2} />
            Enviar Alerta de Teste
          </Button>
        </div>
      </div>

      {/* Configurações card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-[26px] bg-card border border-line shadow-xs p-5">
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-4">
            Configurações
          </span>

          <div className="flex flex-col gap-6">
            {/* Narrador padrão — mesma lista de vozes do formulário de doação */}
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
                  disabled={isLoading || voices.length === 0}
                  hint="Voz usada por padrão quando o doador não escolher nenhuma voz personalizada."
                  includeDefaultOption={false}
                />
              )}
            />

            {/* Volume Range Slider */}
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
                    disabled={isLoading}
                    aria-label="Volume do áudio"
                  />
                )}
              />
              <p className="text-xs font-medium text-ink-muted">
                Controle o volume dos alertas.
              </p>
            </div>

            {/* Speak Name & Amount Toggle */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <p className="text-sm font-bold text-ink-heading">
                  Narrar nome e valor
                </p>
                <p className="text-[13px] font-medium text-ink-secondary mt-0.5">
                  O TTS dirá o nome do doador e o valor antes de ler a mensagem.
                </p>
              </div>
              <Controller
                name="speakNameAmount"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    disabled={isLoading}
                    onClick={() => field.onChange(!field.value)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95
                      focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        field.value
                          ? "bg-brand-button"
                          : "bg-wash border border-line-input"
                      }
                    `}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow-2xs transition-transform duration-150 ${
                        field.value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* Audio-only Toggle */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <p className="text-sm font-bold text-ink-heading">
                  Somente áudio (sem visual)
                </p>
                <p className="text-[13px] font-medium text-ink-secondary mt-0.5">
                  Esconde o overlay visual, mantém apenas o áudio.
                </p>
              </div>
              <Controller
                name="audioOnly"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    disabled={isLoading}
                    onClick={() => field.onChange(!field.value)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95
                      focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        field.value
                          ? "bg-brand-button"
                          : "bg-wash border border-line-input"
                      }
                    `}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow-2xs transition-transform duration-150 ${
                        field.value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-line">
              <SubmitButton loading={isLoading} className="w-full sm:w-auto">
                Salvar Configurações
              </SubmitButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
