import { useEffect } from "react";
import { useLoaderData, useActionData, useSearchParams } from "react-router";
import type { Route } from "./+types/widgets";
import { getAuthToken } from "~/util/session.server";
import { widgetsApi, type Widget } from "~/api/modules/widgets";
import { useToast } from "~/components/ui/useToast";
import { WidgetGallery } from "~/components/widgets/WidgetGallery";
import { OverlayWidgetConfig } from "~/components/widgets/OverlayWidgetConfig";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Widgets — LinkPix" },
    { name: "description", content: "Gerencie e personalize seus widgets para transmissões" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  const url = new URL(request.url);
  const selectedWidget = url.searchParams.get("widget"); // "overlay" | null

  let overlayWidget: Widget | null = null;

  if (selectedWidget === "overlay") {
    const res = await widgetsApi.getSettings(token, "overlay");
    if (res.success) {
      overlayWidget = res.data;
    }
  }

  return { selectedWidget, overlayWidget };
}

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "saveOverlay") {
    const volume = Number(formData.get("volume"));
    const speakNameAmount = formData.get("speakNameAmount") === "true";
    const defaultNarrator = formData.get("defaultNarrator") as string;
    const isPaused = formData.get("isPaused") === "true";

    const body = {
      volume,
      speakNameAmount,
      defaultNarrator,
      isPaused,
    };

    // Tenta atualizar. Se der 404 (ainda não criado), cria.
    let res = await widgetsApi.updateSettings(token, "overlay", body);
    if (!res.success && res.error.code === 404) {
      res = await widgetsApi.createSettings(token, "overlay", body);
    }

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
    const res = await widgetsApi.testAlert(token);
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

export default function Widgets() {
  const { selectedWidget, overlayWidget } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) return;

    if (actionData.success) {
      if (actionData.action === "saveOverlay") {
        toast("Configurações salvas com sucesso!", "success");
      } else if (actionData.action === "testAlert") {
        toast("Alerta de teste enviado!", "success");
      } else if (actionData.action === "resetToken") {
        toast("Token resetado com sucesso!", "success");
      }
    } else if (actionData.error) {
      toast(actionData.error, "error");
    }
  }, [actionData, toast]);

  const handleSelectWidget = (type: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("widget", type);
    setSearchParams(params);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("widget");
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {selectedWidget === "overlay" ? (
        <OverlayWidgetConfig widget={overlayWidget} onBack={handleBack} />
      ) : (
        <WidgetGallery onSelectWidget={handleSelectWidget} />
      )}
    </div>
  );
}
