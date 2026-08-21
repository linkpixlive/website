import { useState, useEffect } from "react";
import { useSubmit, useNavigation } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  FlaskConical,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { Button } from "~/components/ui/Button";
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

const WIDGET_WS_BASE = "wss://tipply.app/ws/overlay";

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
    setValue,
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
    ? `${WIDGET_WS_BASE}?token=${widget.token}`
    : "Widget não configurado ainda — salve as configurações para gerar a URL.";

  const handleCopyUrl = () => {
    if (!widget?.token) return;
    navigator.clipboard.writeText(widgetUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
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
    <div className="flex flex-col gap-6">
      {/* Page Header with Back button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2 pb-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg text-text-muted hover:text-text-heading hover:bg-surface-hover transition-colors cursor-pointer outline-none shrink-0"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-heading sm:text-2xl">
                Widget de Mensagem
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary">
                Configure o overlay de alertas da sua transmissão
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* URL de Conexão Section */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-heading">URL de Conexão</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToken}
            disabled={!widget?.token || isLoading}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar Token
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2.5 flex items-center gap-2 min-w-0">
              <span
                className={`text-sm flex-1 truncate select-all ${
                  !showUrl ? "blur-md select-none pointer-events-none" : "text-text-heading font-mono"
                }`}
              >
                {widgetUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              className="p-2.5 rounded-lg border border-border text-text-muted hover:text-text-heading hover:bg-surface-hover transition-colors cursor-pointer outline-none shrink-0"
              title={showUrl ? "Ocultar URL" : "Mostrar URL"}
            >
              {showUrl ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
            <button
              type="button"
              onClick={handleCopyUrl}
              disabled={!widget?.token}
              className="p-2.5 rounded-lg border border-border text-text-muted hover:text-text-heading hover:bg-surface-hover transition-colors cursor-pointer outline-none shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copiar URL"
            >
              <Copy className="h-4.5 w-4.5" />
            </button>
          </div>

          {urlCopied && (
            <p className="text-xs text-success animate-[fadeInUp_0.2s_ease-out]">
              URL copiada para a área de transferência!
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={handleTestAlert}
              disabled={!widget?.token || isLoading}
            >
              <FlaskConical className="w-4 h-4" />
              Enviar Alerta de Teste
            </Button>
          </div>
        </div>
      </div>

      {/* Configurações Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-heading">Configurações</h2>
          </div>

          <div className="p-6 flex flex-col gap-6">
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
                <label className="text-text-secondary text-sm font-medium">
                  Volume do áudio
                </label>
                <span className="text-sm font-semibold text-text-heading">
                  {volumeValue}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isLoading}
                  {...register("volume", { valueAsNumber: true })}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-text-muted">
                Controla o volume do áudio TTS durante os alertas (0–100).
              </p>
            </div>

            {/* Speak Name & Amount Toggle */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-text-heading">
                  Narrar nome e valor
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
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
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer outline-none shrink-0
                      focus:ring-1 focus:ring-border-focus/30 disabled:opacity-50 disabled:cursor-not-allowed
                      ${field.value ? "bg-primary" : "bg-secondary border border-border"}
                    `}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        field.value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-border">
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
