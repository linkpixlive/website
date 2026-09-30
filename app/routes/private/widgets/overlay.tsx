import { useActionData, useLoaderData, useNavigation } from "react-router";
import { overlayApi } from "~/api/modules/overlay";
import { listVoices } from "~/api/modules/public-donations";
import { widgetsApi } from "~/api/modules/widgets";
import { ErrorState } from "~/components/ui/ErrorState";
import { useToast } from "~/contexts/useToast";
import { OverlayWidgetConfig } from "~/components/widgets/OverlayWidgetConfig";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import type { TtsVoice } from "~/types/donation";
import { getAuthToken } from "~/util/session.server";
import { overlaySchema } from "~/validators/overlay-validator";
import type { Route } from "./+types/overlay";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Overlay — Integrações — LinkPix" },
    {
      name: "description",
      content: "Configure o overlay de alertas da sua transmissão",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);

  const [overlayRes, voices] = await Promise.all([
    widgetsApi.getSettings(token, "overlay"),
    listVoices().catch(() => [] as TtsVoice[]),
  ]);

  return {
    overlayWidget: overlayRes.success ? overlayRes.data : null,
    voices,
  };
}

type OverlayActionResult = {
  success: boolean;
  action: string;
  error?: string;
};

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const handler = intentHandlers[String(formData.get("intent") ?? "")];
  return handler ? handler(token, formData) : null;
}

type OverlayIntentHandler = (
  token: string | null,
  formData: FormData,
) => Promise<OverlayActionResult>;

const intentHandlers: Record<string, OverlayIntentHandler> = {
  saveOverlay: async (token, formData) => {
    const intent = "saveOverlay";
    const parsed = overlaySchema.safeParse({
      volume: Number(formData.get("volume")),
      speakNameAmount: formData.get("speakNameAmount") === "true",
      audioOnly: formData.get("audioOnly") === "true",
      defaultNarrator: String(formData.get("defaultNarrator") ?? ""),
    });

    if (!parsed.success) {
      return fail(intent, parsed.error.issues[0].message);
    }

    const res = await widgetsApi.upsertSettings(token, "overlay", {
      volume: parsed.data.volume,
      speakNameAmount: parsed.data.speakNameAmount,
      audioOnly: parsed.data.audioOnly,
      defaultNarrator: parsed.data.defaultNarrator,
    });

    if (!res.success) {
      return fail(intent, res.error.message);
    }

    return ok(intent);
  },

  testAlert: async (token) => {
    const res = await overlayApi.testAlert(token);

    if (!res.success) {
      return fail("testAlert", res.error.message);
    }

    return ok("testAlert");
  },

  resetToken: async (token) => {
    const res = await widgetsApi.resetToken(token, "overlay");

    if (!res.success) {
      return fail("resetToken", res.error.message);
    }

    return ok("resetToken");
  },
};

function fail(action: string, error: string): OverlayActionResult {
  return { success: false, action, error };
}

function ok(action: string): OverlayActionResult {
  return { success: true, action };
}

const overlaySuccessToasts: Record<string, string> = {
  saveOverlay: "Configurações salvas com sucesso!",
  testAlert: "Alerta de teste enviado!",
  resetToken: "Token resetado com sucesso!",
};

export default function OverlayRoute() {
  const { overlayWidget, voices } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();

  useFetcherFeedback<{ success: boolean; action: string; error?: string }>({
    data: actionData,
    state: navigation.state,
    onResult: (result) => {
      if (result.success) {
        const message = overlaySuccessToasts[result.action];
        if (message) toast(message, "success");
      } else if (result.error) {
        toast(result.error, "error");
      }
    },
  });

  if (!overlayWidget) {
    return (
      <ErrorState
        title="Não foi possível carregar o widget"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <OverlayWidgetConfig
      key={`${overlayWidget.token}-${overlayWidget.updatedAt}`}
      widget={overlayWidget}
      voices={voices}
    />
  );
}
