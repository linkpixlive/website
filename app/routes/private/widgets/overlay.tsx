import { useLoaderData, useActionData } from "react-router";
import type { Route } from "./+types/overlay";
import { getAuthToken } from "~/util/session.server";
import { widgetsApi, type Widget } from "~/api/modules/widgets";
import { overlayApi } from "~/api/modules/overlay";
import { listVoices } from "~/api/modules/public-donations";
import type { TtsVoice } from "~/types/donation";
import { useToast } from "~/components/ui/useToast";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
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
    const volume = Number(formData.get("volume"));
    const speakNameAmount = formData.get("speakNameAmount") === "true";
    const audioOnly = formData.get("audioOnly") === "true";
    const defaultNarrator = formData.get("defaultNarrator") as string;

    // Sem `isPaused`: pausa é só via POST /overlay/toggle-pause (o PUT
    // preserva o valor atual no backend e o pipe rejeita o campo).
    const body = {
      volume,
      speakNameAmount,
      audioOnly,
      defaultNarrator,
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
  const { toast } = useToast();

  useFetcherFeedback<{ success: boolean; action: string; error?: string }>({
    data: actionData,
    state: "idle",
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
      <div className="rounded-[26px] bg-card border border-line shadow-xs p-5 sm:p-6 text-center flex flex-col items-center gap-4">
        <span className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error">
          <Icon name="danger-circle" size={22} strokeWidth={2} />
        </span>
        <div>
          <h1 className="text-base font-bold text-ink-heading">
            Não foi possível carregar o widget
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Verifique sua conexão e tente novamente.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
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
