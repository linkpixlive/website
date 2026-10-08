import { useNavigate } from "react-router";
import { StatusPage } from "~/components/ui/StatusPage";

export function meta() {
  return [{ title: "Serviço indisponível — LinkPix" }];
}

export default function Indisponivel() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-1 items-center justify-center bg-canvas">
      <StatusPage
        tone="failure"
        eyebrow="Serviço instável"
        title="Estamos passando por problemas"
        body="Nossos sistemas estão instáveis no momento. Tente novamente em instantes."
        primaryLabel="Tentar de novo"
        onPrimary={() => navigate("/dashboard")}
        reassurance="Sua sessão foi mantida neste dispositivo."
      />
    </main>
  );
}
