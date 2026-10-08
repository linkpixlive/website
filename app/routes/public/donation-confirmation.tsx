import { useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/donation-confirmation";
import { LogoTile } from "~/components/ui/LogoTile";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { Button } from "~/components/ui/Button";
import {
  ClosedState,
  WaitingState,
} from "~/components/donate/ConfirmationStates";
import { PaymentConfirmedStep } from "~/components/donate/PaymentConfirmedStep";
import { DonationFooter } from "~/components/donate/DonationFooter";
import { getDonationView } from "~/api/modules/public-donations";
import { normalizeUsername } from "~/util/username";
import { useDonationStatus } from "~/hooks/useDonationStatus";

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

export default function DonationConfirmationPage() {
  const { view, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const streamerUsername = normalizeUsername(view?.streamerUsername);

  const { status, connectionLost } = useDonationStatus(view?.id ?? null, {
    enabled: !!view && view.status === "pending",
  });

  const effectiveStatus = view && view.status !== "pending" ? view.status : status;
  const confirmed = effectiveStatus === "paid" || effectiveStatus === "displayed";

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md flex flex-col gap-5 animate-fade-in">
          <AlertMessage variant="error" message={error} />
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
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
        <div className="w-full max-w-md flex flex-col items-center gap-5">
          <div className="flex flex-col items-center text-center gap-2 py-10 animate-fade-in">
            <h1 className="text-lg font-extrabold tracking-tight text-ink-heading">
              Doação não encontrada
            </h1>
            <p className="text-[13px] font-medium text-ink-muted leading-relaxed max-w-[36ch]">
              Não encontramos esta doação. Confira o link ou faça uma nova doação.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
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
        <div className="rounded-[28px] bg-card border border-line overflow-hidden">
          <div className="p-5">
            {effectiveStatus === "pending" && connectionLost && (
              <div className="mb-4">
                <AlertMessage
                  variant="info"
                  message="Conexão perdida. Tentando reconectar..."
                />
              </div>
            )}
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

        <DonationFooter />
      </div>
    </main>
  );
}
