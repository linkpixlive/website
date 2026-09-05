import { useState, useEffect } from "react";
import { useSubmit, useNavigation } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { SelectField } from "~/components/ui/SelectField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import type { Widget, OverlaySettings } from "~/api/modules/widgets";

interface OverlayWidgetConfigProps {
  widget: Widget<OverlaySettings> | null;
  onBack: () => void;
}

const NARRATOR_OPTIONS = [
  { value: "Ricardo", label: "Ricardo (Masculino)" },
  { value: "Francisca", label: "Francisca (Feminino)" },
  { value: "Antonio", label: "Antonio (Masculino)" },
];

const overlaySchema = z.object({
  volume: z.number().min(0).max(100),
  speakNameAmount: z.boolean(),
  defaultNarrator: z.string().min(1, "Selecione um narrador"),
});

type OverlayFormValues = z.infer<typeof overlaySchema>;

export function OverlayWidgetConfig({ widget, onBack }: OverlayWidgetConfigProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [showUrl, setShowUrl] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Form setup using react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<OverlayFormValues>({
    resolver: zodResolver(overlaySchema),
    defaultValues: {
      volume: widget?.settings.volume ?? 100,
      speakNameAmount: widget?.settings.speakNameAmount ?? true,
      defaultNarrator: widget?.settings.defaultNarrator ?? "Ricardo",
    },
  });

  // Watch volume to display its percentage in real-time
  const volumeValue = watch("volume");

  const widgetUrl = widget?.token
    ? `${window.location.origin}/overlay?token=${widget.token}`
    : "Widget não configurado ainda — salve as configurações para gerar a URL.";

  const handleCopyUrl = () => {
    if (!widget?.token) return;
    navigator.clipboard.writeText(widgetUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 1600);
  };

  const onSubmit = (data: OverlayFormValues) => {
    const formData = new FormData();
    formData.append("intent", "saveOverlay");
    formData.append("volume", String(data.volume));
    formData.append("speakNameAmount", String(data.speakNameAmount));
    formData.append("defaultNarrator", data.defaultNarrator);
    formData.append("isPaused", String(widget?.settings.isPaused ?? false));
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
      {/* Title block with back button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-card hover:bg-tile border border-line shadow-xs text-chrome-icon transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
          title="Voltar"
          aria-label="Voltar para widgets"
        >
          <Icon name="alt-arrow-left" size={20} strokeWidth={2} className="mx-auto" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight leading-tight text-ink-heading">
            Widget de Mensagem
          </h1>
          <p className="mt-0.5 text-sm text-ink-secondary">
            Configure o overlay de alertas da sua transmissão
          </p>
        </div>
      </div>

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
            disabled={!widget?.token || isLoading}
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
            disabled={!widget?.token}
            className={`w-11 h-11 rounded-full border shadow-xs transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
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
            disabled={!widget?.token || isLoading}
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
            {/* Narrador Select */}
            <Controller
              name="defaultNarrator"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Narrador padrão (TTS)"
                  options={NARRATOR_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.defaultNarrator?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Volume Range Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-ink-secondary">
                  Volume do áudio
                </label>
                <span className="text-sm font-bold text-ink-heading">
                  {volumeValue}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={isLoading}
                {...register("volume", { valueAsNumber: true })}
                className="w-full h-1.5 bg-wash rounded-full appearance-none cursor-pointer accent-brand disabled:opacity-50 outline-none"
              />
              <p className="text-xs font-medium text-ink-muted">
                Controla o volume do áudio TTS durante os alertas (0–100).
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
