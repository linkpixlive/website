import { useLoaderData, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/overlay";
import { getAuthToken } from "~/util/session.server";
import { widgetsApi, type Widget } from "~/api/modules/widgets";
import { overlayApi } from "~/api/modules/overlay";
import { listVoices } from "~/api/modules/public-donations";
import { overlaySchema } from "~/validators/overlay-validator";
import type { TtsVoice } from "~/types/donation";
import { useToast } from "~/components/ui/useToast";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { ErrorState } from "~/components/ui/ErrorState";
import { OverlayWidgetConfig } from "~/components/widgets/OverlayWidgetConfig";

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

  // Garante existência (cria com defaults do backend na 1ª abertura) e
  // carrega a mesma lista de vozes do formulário de doação para o
  // streamer escolher a voz padrão. Falha em vozes não quebra a página.
  const [overlayRes, voices] = await Promise.all([
    widgetsApi.ensureSettings(token, "overlay"),
    listVoices().catch(() => [] as TtsVoice[]),
  ]);
  let overlayWidget: Widget | null = null;
  if (overlayRes.success) {
    overlayWidget = overlayRes.data;
  }

  return { overlayWidget, voices };
}

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "saveOverlay") {
    const parsed = overlaySchema.safeParse({
      volume: Number(formData.get("volume")),
      speakNameAmount: formData.get("speakNameAmount") === "true",
      audioOnly: formData.get("audioOnly") === "true",
      defaultNarrator: String(formData.get("defaultNarrator") ?? ""),
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0].message,
        action: "saveOverlay",
      };
    }

    // Sem `isPaused`: pausa é só via POST /overlay/toggle-pause (o PUT
    // preserva o valor atual no backend e o pipe rejeita o campo).
    const body = {
      volume: parsed.data.volume,
      speakNameAmount: parsed.data.speakNameAmount,
      audioOnly: parsed.data.audioOnly,
      defaultNarrator: parsed.data.defaultNarrator,
    };

    // Upsert: cria na 1ª vez, atualiza nas demais. O PUT substitui o
    // objeto de settings inteiro — por isso o body vai sempre completo.
    const res = await widgetsApi.upsertSettings(token, "overlay", body);

    if (!res.success) {
      return {
        success: false,
        error: res.error.message,
        action: "saveOverlay",
      };
    }

    return { success: true, action: "saveOverlay" };
  }

  if (intent === "testAlert") {
    const res = await overlayApi.testAlert(token);
    if (!res.success) {
      return {
        success: false,
        error: res.error.message,
        action: "testAlert",
      };
    }
    return { success: true, action: "testAlert" };
  }

  if (intent === "resetToken") {
    const res = await widgetsApi.resetToken(token, "overlay");
    if (!res.success) {
      return {
        success: false,
        error: res.error.message,
        action: "resetToken",
      };
    }
    return { success: true, action: "resetToken" };
  }

  return null;
}

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
        if (result.action === "saveOverlay") {
          toast("Configurações salvas com sucesso!", "success");
        } else if (result.action === "testAlert") {
          toast("Alerta de teste enviado!", "success");
        } else if (result.action === "resetToken") {
          toast("Token resetado com sucesso!", "success");
        }
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

  // `key` por token: após resetToken o loader revalida com o novo token
  // e o form remonta exibindo a nova URL.
  return (
    <OverlayWidgetConfig
      key={`${overlayWidget.token}-${overlayWidget.updatedAt}`}
      widget={overlayWidget}
      voices={voices}
    />
  );
}
