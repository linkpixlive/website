import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/donation-confirmation";
import { LogoTile } from "~/components/ui/Logo";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { PaymentConfirmedStep } from "~/components/donation/PaymentConfirmedStep";
import { getDonationView } from "~/api/modules/public-donations";
import { useDonationStatus } from "~/hooks/useDonationStatus";
import type { DonationView } from "~/types/donation";

export function meta() {
  return [{ title: "Confirmação da doação — LinkPix" }];
}

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const view = await getDonationView(params.id);
    return { view, error: null };
  } catch (e) {
    return {
      view: null,
      error:
        e instanceof Error
          ? e.message
          : "Nossos sistemas estão com problemas. Tente novamente mais tarde.",
    };
  }
}

function WaitingState() {
  return (
    <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
        Confirmação
      </span>

      <div className="relative flex items-center justify-center size-16">
        <span className="absolute inline-flex size-16 rounded-full bg-success/10 animate-ping" />
        <span className="relative flex items-center justify-center size-16 rounded-full bg-success/10">
          <Icon name="clock-circle" size={28} strokeWidth={2} className="text-success" />
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold tracking-tight text-ink-heading">
          Aguardando confirmação…
        </h2>
        <p className="text-[13px] font-medium text-ink-secondary leading-snug max-w-[34ch]">
          Assim que o pagamento do Pix for confirmado, sua doação aparece aqui.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        Consultando o pagamento…
      </div>
    </div>
  );
}

/** Username do streamer para voltar: API → query `u` (fallback do card de doação) → null. */
function useStreamerUsername(view: DonationView | null): string | null {
  const [searchParams] = useSearchParams();
  const username = view?.streamerUsername || searchParams.get("u");
  return username || null;
}

function ClosedState({
  view,
  streamerUsername,
}: {
  view: DonationView;
  streamerUsername: string | null;
}) {
  const navigate = useNavigate();
  const backToStreamer = streamerUsername ? `/${streamerUsername}` : "/";

  return (
    <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
        Confirmação
      </span>

      <Icon
        name="danger-circle"
        size={32}
        strokeWidth={1.9}
        className="text-error"
      />

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold tracking-tight text-ink-heading">
          {view.status === "expired" ? "Pagamento não concluído" : "Doação não processada"}
        </h2>
        <p className="text-[13px] font-medium text-ink-muted leading-relaxed max-w-[34ch]">
          {view.status === "expired"
            ? "O tempo para pagar o Pix acabou e não recebemos o pagamento."
            : "Não conseguimos processar esta doação. Se você pagou, fale com o suporte."}
        </p>
      </div>

      <Button variant="secondary" onClick={() => navigate(backToStreamer)} className="w-full">
        {streamerUsername ? `Voltar para @${streamerUsername}` : "Voltar para o início"}
      </Button>
    </div>
  );
}

export default function DonationConfirmationPage() {
  const { view, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const streamerUsername = useStreamerUsername(view);

  const { status } = useDonationStatus(view?.id ?? null, {
    enabled: !!view && view.status === "pending",
  });

  // Enquanto o loader traz "pending", o status efetivo vem do polling.
  const effectiveStatus = view && view.status !== "pending" ? view.status : status;
  const confirmed = effectiveStatus === "paid" || effectiveStatus === "displayed";

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in">
          <AlertMessage variant="error" message={error} />
          <Button variant="secondary" onClick={() => navigate("/")}>
            Voltar para o início
          </Button>
          <LogoTile variant="auto" imgClassName="h-6" textClassName="text-lg" />
        </div>
      </main>
    );
  }

  if (!view) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <div className="flex flex-col items-center text-center gap-2 py-10 animate-fade-in">
            <h1 className="text-lg font-extrabold tracking-tight text-ink-heading">
              Doação não encontrada
            </h1>
            <p className="text-[13px] font-medium text-ink-muted leading-relaxed max-w-[36ch]">
              Não encontramos esta doação. Confira o link ou faça uma nova doação.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Fazer uma doação
          </Button>
          <LogoTile variant="auto" imgClassName="h-6" textClassName="text-lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col gap-5 animate-fade-in">
        <div className="rounded-[26px] bg-card border border-line shadow-xs overflow-hidden">
          <div className="p-5">
            {confirmed ? (
              <PaymentConfirmedStep
                amount={view.amount}
                streamerName={view.streamerName}
                donation={{
                  donorName: view.donorName,
                  message: view.message ?? "",
                  voiceName: view.voiceName,
                }}
                onNewDonation={() =>
                  navigate(streamerUsername ? `/${streamerUsername}` : "/")
                }
              />
            ) : effectiveStatus === "pending" ? (
              <WaitingState />
            ) : (
              <ClosedState view={view} streamerUsername={streamerUsername} />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pb-2">
          <LogoTile variant="auto" imgClassName="h-6" textClassName="text-lg" />
          <p className="text-[11px] font-medium text-ink-label">
            Doações processadas via Pix · LinkPix
          </p>
        </div>
      </div>
    </main>
  );
}
