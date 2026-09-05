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
  const {
    current,
    isPaused,
    isConnected,
    audioBlocked,
    unlockAudio,
  } = useOverlayAlerts(token);

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

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {!isConnected && (
        <span className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 text-white text-[11px] font-semibold px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          reconectando...
        </span>
      )}

      {current && <DonationAlertCard donation={current} />}

      {audioBlocked && (
        <button
          type="button"
          onClick={unlockAudio}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[#111216] hover:bg-black text-white text-sm font-bold px-5 py-2.5 transition-colors cursor-pointer"
        >
          Clique para ativar o som
        </button>
      )}

      {isPaused && !current && (
        <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/40 text-white/80 text-[11px] font-semibold px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
          alertas pausados
        </span>
      )}
    </div>
  );
}
