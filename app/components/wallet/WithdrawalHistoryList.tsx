import type { Withdrawal } from "~/api/modules/withdrawals";
import { Badge } from "~/components/ui/Badge";
import { EmptyState } from "~/components/ui/EmptyState";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatBRLReais, formatTimestamp } from "~/util/currency";
import { displayMaskedKey, getPixDisplayName, getTypeName, maskTransactionId } from "./pix-key-format";

const STATUS_DOT: Record<string, string> = {
  pending: "bg-warning",
  processing: "bg-info",
  success: "bg-success",
  failed: "bg-error-solid",
};

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

interface WithdrawalHistoryListProps {
  items: Withdrawal[];
  loading?: boolean;
  showFull?: boolean;
}

export function WithdrawalHistoryList({
  items,
  loading = false,
  showFull = false,
}: WithdrawalHistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhum saque por aqui"
        description="Nenhum saque com este status por aqui."
      />
    );
  }

  return (
    <ul className="divide-y divide-line/60">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[item.status] ?? "bg-ink-label"}`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-[15px] font-extrabold tabular-nums tracking-tight text-ink-heading">
                {formatBRLReais(item.netAmount)}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-medium text-ink-secondary">
                {showFull ? getPixDisplayName(item, true) : displayMaskedKey(item.keyMasked)}
                {item.keyType ? ` · ${getTypeName(item.keyType)}` : ""} ·{" "}
                {formatShortDate(item.createdAt)} às {formatTimestamp(item.createdAt)}
              </p>
              <p className="font-mono text-[11px] text-ink-muted">
                {showFull ? item.id : maskTransactionId(item.id)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge status={item.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
