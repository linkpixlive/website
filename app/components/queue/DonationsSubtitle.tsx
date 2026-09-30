interface DonationsSubtitleProps {
  total: number;
  queueLength: number;
  pendingCount: number;
}

export function DonationsSubtitle({
  total,
  queueLength,
  pendingCount,
}: DonationsSubtitleProps) {
  if (total > 0) {
    return (
      <>
        Você tem{" "}
        <strong className="font-bold text-ink-heading">
          {total} {total === 1 ? "doação" : "doações"}
        </strong>{" "}
        no histórico.
        {pendingCount > 0 && (
          <>
            {" "}
            <strong className="font-bold text-ink-heading">
              {pendingCount} na fila
            </strong>
          </>
        )}
      </>
    );
  }

  if (queueLength > 0) {
    return (
      <>
        Você tem{" "}
        <strong className="font-bold text-ink-heading">
          {queueLength} {queueLength === 1 ? "alerta" : "alertas"}
        </strong>{" "}
        na fila de exibição.
      </>
    );
  }

  return "Nenhuma doação recebida ainda.";
}
