import { Calendar, Eye, EyeOff, Receipt } from "lucide-react";
import { useState } from "react";
import type { Withdrawal } from "~/api/modules/withdrawals";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-surface border border-border rounded-2xl">
        <Receipt className="h-12 w-12 text-text-muted mb-4" />
        <h3 className="text-lg font-semibold text-text-heading">
          Sem saques registrados
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Nenhum histórico de saques foi encontrado com os filtros atuais.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto bg-surface border border-border rounded-2xl">
        <table className="w-full border-collapse text-left text-sm text-text-primary">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-text-secondary font-medium">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span>Chave Pix</span>
                  <button
                    type="button"
                    onClick={() => setShowPix((v) => !v)}
                    className="p-0.5 rounded text-text-muted hover:text-text-heading transition-colors duration-150 cursor-pointer outline-none"
                    title={showPix ? "Ocultar" : "Mostrar"}
                  >
                    {showPix ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </th>
              {/* <th className="px-6 py-4">Valor Bruto</th> */}
              {/* <th className="px-6 py-4">Taxa</th> */}
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-surface-hover/30 transition-colors duration-100"
              >
                <td className="px-6 py-4 font-medium text-text-heading whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>
                <td
                  className={`px-6 py-4 max-w-[200px] truncate ${!showPix ? "blur-sm" : ""}`}
                >
                  {item.pixValue}
                </td>
                {/* <td className="px-6 py-4">{formatCurrency(item.amount)}</td> */}
                {/* <td className="px-6 py-4 text-text-muted">{formatCurrency(item.feeAmount)}</td> */}
                <td className="px-6 py-4 font-semibold text-primary">
                  {formatCurrency(item.netAmount)}
                </td>
                <td className="px-6 py-4">
                  <Badge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-surface border border-border rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(item.createdAt)}
              </div>
              <Badge status={item.status} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-secondary">Chave de Destino</p>
                <button
                  type="button"
                  onClick={() => setShowPix((v) => !v)}
                  className="p-0.5 rounded text-text-muted hover:text-text-heading transition-colors duration-150 cursor-pointer outline-none"
                  title={showPix ? "Ocultar" : "Mostrar"}
                >
                  {showPix ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p
                className={`text-sm font-medium text-text-heading break-all ${!showPix ? "blur-sm" : ""}`}
              >
                {item.pixValue}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50 text-xs">
              {/* <div>
                <p className="text-text-muted mb-0.5">Bruto</p>
                <p className="font-medium text-text-primary">{formatCurrency(item.amount)}</p>
              </div>
              <div>
                <p className="text-text-muted mb-0.5">Taxa</p>
                <p className="font-medium text-text-primary">{formatCurrency(item.feeAmount)}</p>
              </div> */}
              <div>
                <p className="text-text-muted mb-0.5">Valor</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(item.netAmount)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
