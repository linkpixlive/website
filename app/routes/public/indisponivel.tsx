import { useNavigate } from "react-router";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { LogoTile } from "~/components/ui/LogoTile";

export function meta() {
  return [{ title: "Serviço indisponível — LinkPix" }];
}

/**
 * Área privada inacessível (API fora do ar ou sessão inválida). Não limpa
 * o cookie: se a sessão ainda vale, o retry volta ao app; se não, o guard
 * leva ao login.
 */
export default function Indisponivel() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-5">
        <div className="flex flex-col items-center text-center gap-2 py-10 animate-fade-in">
          <h1 className="text-lg font-extrabold tracking-tight text-ink-heading">
            Não conseguimos te conectar
          </h1>
          <p className="text-[13px] font-medium text-ink-muted leading-relaxed max-w-[36ch]">
            Nossos sistemas estão com problemas. Tente novamente em instantes.
          </p>
        </div>
        <AlertMessage variant="info" message="Sua sessão foi mantida neste dispositivo." />
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>
          Tentar de novo
        </Button>
        <LogoTile variant="auto" imgClassName="h-6" textClassName="text-lg" />
      </div>
    </main>
  );
}
