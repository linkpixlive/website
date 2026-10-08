import { useSubmit, useNavigation } from "react-router";
import type { OverlayFormValues } from "~/validators/overlay-validator";
import { ConnectionSecret } from "./ConnectionSecret";
import { OverlaySettingsForm } from "./OverlaySettingsForm";
import type { Widget, OverlaySettings } from "~/api/modules/widgets";
import type { TtsVoice } from "~/types/donation";
import { buildIntentFormData } from "~/util/submit-intent";

interface OverlayWidgetConfigProps {
  widget: Widget<OverlaySettings>;
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

  return (
    <div className="min-w-0">
      <ConnectionSecret
        widget={widget}
        loading={isLoading}
        onResetToken={() => postIntent("resetToken")}
        onTestAlert={() => postIntent("testAlert")}
      />

      <div aria-hidden="true" className="my-8 border-t border-line" />

      <OverlaySettingsForm
        widget={widget}
        voices={voices}
        loading={isLoading}
        onSubmit={handleSave}
      />
    </div>
  );
}
