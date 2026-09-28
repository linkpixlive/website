import { useSubmit, useNavigation } from "react-router";
import type { OverlayFormValues } from "~/validators/overlay-validator";
import { ConnectionUrlCard } from "./ConnectionUrlCard";
import { OverlaySettingsForm } from "./OverlaySettingsForm";
import type { Widget, OverlaySettings } from "~/api/modules/widgets";
import type { TtsVoice } from "~/types/donation";
import { buildIntentFormData } from "~/util/submit-intent";

interface OverlayWidgetConfigProps {
  widget: Widget<OverlaySettings>;
  /** Mesma lista do formulário de doação (GET /voices). */
  voices: TtsVoice[];
}

export function OverlayWidgetConfig({
  widget,
  voices,
}: OverlayWidgetConfigProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const postIntent = (intent: string, values: Record<string, string> = {}) => {
    submit(buildIntentFormData(intent, values), { method: "post" });
  };

  const handleSave = (data: OverlayFormValues) => {
    postIntent("saveOverlay", {
      volume: String(data.volume),
      speakNameAmount: String(data.speakNameAmount),
      audioOnly: String(data.audioOnly),
      defaultNarrator: data.defaultNarrator,
    });
  };

  const handleResetToken = () => {
    if (!confirm("Deseja realmente resetar o token de conexão do widget? A URL atual deixará de funcionar.")) {
      return;
    }
    postIntent("resetToken");
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-secondary">
        Configure o overlay de alertas da sua{" "}
        <span className="font-bold text-ink-heading">transmissão</span>.
      </p>

      <ConnectionUrlCard
        widget={widget}
        loading={isLoading}
        onResetToken={handleResetToken}
        onTestAlert={() => postIntent("testAlert")}
      />

      <OverlaySettingsForm
        widget={widget}
        voices={voices}
        loading={isLoading}
        onSubmit={handleSave}
      />
    </div>
  );
}
