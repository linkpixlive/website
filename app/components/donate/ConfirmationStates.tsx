import { useNavigate } from "react-router";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { cn } from "~/util/cn";
import type { DonationView } from "~/types/donation";

export function ConfirmationShell({
  icon,
  title,
  description,
  children,
  kicker = "Confirmação",
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
  kicker?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
      <span className={cn(SECTION_HEADING_CLASS, "block")}>{kicker}</span>

      {icon}

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold tracking-tight text-ink-heading">
          {title}
        </h2>
        <p className="text-[13px] font-medium text-ink-secondary leading-snug max-w-[34ch]">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

export function WaitingState() {
  return (
    <ConfirmationShell
      icon={
        <div className="relative flex items-center justify-center size-16">
          <span className="absolute inline-flex size-16 rounded-full bg-success/10 animate-ping" />
          <span className="relative flex items-center justify-center size-16 rounded-full bg-success/10">
            <Icon name="clock-circle" size={28} strokeWidth={2} className="text-success" />
          </span>
        </div>
      }
      title="Aguardando confirmação…"
      description="Assim que o pagamento do Pix for confirmado, sua doação aparece aqui."
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        Consultando o pagamento…
      </div>
    </ConfirmationShell>
  );
}

export function ClosedState({
  view,
  streamerUsername,
}: {
  view: DonationView;
  streamerUsername: string | null;
}) {
  const navigate = useNavigate();
  const backToStreamer = streamerUsername ? `/${streamerUsername}` : "/";

  return (
    <ConfirmationShell
      icon={
        <Icon
          name="danger-circle"
          size={32}
          strokeWidth={1.9}
          className="text-error"
        />
      }
      title={view.status === "expired" ? "Pagamento não concluído" : "Doação não processada"}
      description={
        view.status === "expired"
          ? "O tempo para pagar o Pix acabou e não recebemos o pagamento."
          : "Não conseguimos processar esta doação. Se você pagou, fale com o suporte."
      }
    >
      <Button variant="secondary" onClick={() => navigate(backToStreamer)} className="w-full">
        {streamerUsername ? `Voltar para @${streamerUsername}` : "Voltar para o início"}
      </Button>
    </ConfirmationShell>
  );
}
