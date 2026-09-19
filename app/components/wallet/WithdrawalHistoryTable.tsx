import { useState } from "react";
import type { Withdrawal } from "~/api/modules/withdrawals";
import { Icon } from "~/components/ui/Icon";
import { Badge } from "~/components/ui/Badge";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatPixKeyValue, displayMaskedKey } from "./pixKeyFormat";

interface WithdrawalHistoryTableProps {
  items: Withdrawal[];
  loading?: boolean;
}

export function WithdrawalHistoryTable({
  items,
  loading = false,
}: WithdrawalHistoryTableProps) {
  const [showPix, setShowPix] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPixDisplay = (item: Withdrawal, showFull: boolean) => {
    if (showFull) {
      const full = item.key ?? item.keyMasked ?? "—";
      // Sem keyType (chave excluída ou backend antigo): exibe o valor como veio.
      if (!item.key || !item.keyType) return full;
      return formatPixKeyValue(item.key, item.keyType);
    }
    return displayMaskedKey(item.keyMasked ?? item.pixValue ?? "—");
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <h3 className="text-lg font-extrabold tracking-tight text-ink-heading">
          Sem saques registrados
        </h3>
        <p className="text-sm text-ink-secondary mt-1">
          Nenhum histórico de saques foi encontrado com os filtros atuais.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="px-3 py-3 text-[11px] font-extrabold uppercase tracking-wider text-ink-label first:pl-3">
                Data
              </th>
              <th className="px-3 py-3 text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
                <span className="inline-flex items-center gap-1.5 uppercase tracking-wider">
                  <span>Chave Pix</span>
                  <button
                    type="button"
                    onClick={() => setShowPix((v) => !v)}
                    className="p-0.5 rounded-full text-chrome-icon hover:text-ink-heading transition-colors duration-150 cursor-pointer outline-none"
                    title={showPix ? "Ocultar chave completa" : "Revelar chave completa"}
                    aria-label={showPix ? "Ocultar chave completa" : "Revelar chave completa"}
                  >
                    <Icon
                      name={showPix ? "eye-closed" : "eye"}
                      size={14}
                      strokeWidth={1.9}
                    />
                  </button>
                </span>
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
                Valor
              </th>
              <th className="px-3 py-3 text-right text-[11px] font-extrabold uppercase tracking-wider text-ink-label last:pr-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.id} className="transition-colors duration-100 hover:bg-wash/70">
                <td className="px-3 py-3.5 text-[13px] font-medium text-ink-secondary whitespace-nowrap first:pl-3">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-3 py-3.5 max-w-[220px] text-[13px] font-mono font-medium text-ink-body truncate">
                  {getPixDisplay(item, showPix)}
                </td>
                <td className="px-3 py-3.5 text-right text-sm font-bold text-ink-heading whitespace-nowrap">
                  {formatCurrency(item.netAmount)}
                </td>
                <td className="px-3 py-3.5 text-right last:pr-3">
                  <Badge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden divide-y divide-line">
        {items.map((item) => (
          <div key={item.id} className="py-4 px-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-label">
                {formatDate(item.createdAt)}
              </span>
              <Badge status={item.status} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
                  Chave de destino
                </p>
                <button
                  type="button"
                  onClick={() => setShowPix((v) => !v)}
                  className="p-0.5 rounded-full text-chrome-icon hover:text-ink-heading transition-colors duration-150 cursor-pointer outline-none"
                  title={showPix ? "Ocultar chave completa" : "Revelar chave completa"}
                  aria-label={showPix ? "Ocultar chave completa" : "Revelar chave completa"}
                >
                  <Icon
                    name={showPix ? "eye-closed" : "eye"}
                    size={14}
                    strokeWidth={1.9}
                  />
                </button>
              </div>
              <p className="text-[13px] font-mono font-medium text-ink-body break-all">
                {getPixDisplay(item, showPix)}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs font-medium text-ink-secondary">Valor recebido</p>
              <p className="text-sm font-bold text-ink-heading">
                {formatCurrency(item.netAmount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
