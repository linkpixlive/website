import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useOverlayAlerts } from "~/hooks/useOverlayAlerts";
import { DonationAlertCard } from "~/components/overlay/DonationAlertCard";

export function meta() {
  return [
    { title: "Overlay — LinkPix" },
    { name: "description", content: "Overlay de alertas de doação" },
  ];
}

export default function Overlay() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { current, settings, tokenInvalid } = useOverlayAlerts(token);

  useEffect(() => {
    const prevHtml = document.documentElement.style.background;
    const prevBody = document.body.style.background;
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    return () => {
      document.documentElement.style.background = prevHtml;
      document.body.style.background = prevBody;
    };
  }, []);

  if (!token) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <p className="rounded-full bg-[#111216] text-white text-sm font-bold px-5 py-2.5">
          Token não informado — configure o widget para gerar a URL do overlay.
        </p>
      </div>
    );
  }

  if (tokenInvalid) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <p className="rounded-full bg-[#111216] text-white text-sm font-bold px-5 py-2.5">
          Link inválido ou expirado — gere uma nova URL em /widgets/overlay.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {current && !settings?.audioOnly && <DonationAlertCard donation={current} />}
    </div>
  );
}
