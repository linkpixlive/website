import { useEffect, useState } from "react";
import { Icon } from "~/components/ui/Icon";

const STREAMER_WARNING_KEY = "linkpix:hide-streamer-warning";

export function StreamerPrivacyNotice() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STREAMER_WARNING_KEY) === "1") {
        setVisible(false);
      }
    } catch {
      // localStorage indisponível: mantém o aviso visível.
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STREAMER_WARNING_KEY, "1");
    } catch {
      // Ignora falha de persistência e só oculta na sessão atual.
    }
    setVisible(false);
  };

  return (
    <div
      role="note"
      className="mb-5 flex items-start gap-3 rounded-xl border border-info/20 bg-info/10 px-4 py-3 text-info animate-slide-down"
    >
      <Icon name="info-circle" size={16} strokeWidth={1.9} className="shrink-0 mt-0.5" />
      <p className="flex-1 text-[13px] font-medium">
        Vai mostrar essa tela em live? Oculte os valores com o ícone de olho —
        saldos e chaves Pix são informações sensíveis.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dispensar aviso"
        title="Dispensar aviso"
        className="rounded-full p-1 hover:bg-info/10 transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
      >
        <Icon name="close-circle" size={16} strokeWidth={1.9} />
      </button>
    </div>
  );
}
