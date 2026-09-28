import { useState } from "react";
import type { Withdrawal } from "~/api/modules/withdrawals";
import { Badge } from "~/components/ui/Badge";
import { Skeleton } from "~/components/ui/Skeleton";
import { getPixDisplayName } from "./pix-key-format";
import { EmptyState } from "~/components/ui/EmptyState";
import { EyeToggleButton } from "~/components/ui/EyeToggleButton";
import { formatBRLReais, formatDateTime } from "~/util/currency";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";

interface WithdrawalHistoryTableProps {
  items: Withdrawal[];
  loading?: boolean;
}

export function WithdrawalHistoryTable({
  items,
  loading = false,
}: WithdrawalHistoryTableProps) {
  const [showPix, setShowPix] = useState(false);

  const formatDate = formatDateTime;

  const getPixDisplay = (item: Withdrawal, showFull: boolean) =>
    getPixDisplayName(item, showFull);

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
      <EmptyState
        title="Sem saques registrados"
        description="Nenhum histórico de saques foi encontrado com os filtros atuais."
      />
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className={`px-3 py-3 ${SECTION_HEADING_CLASS} first:pl-3`}>
                Data
              </th>
              <th className={`px-3 py-3 ${SECTION_HEADING_CLASS}`}>
                <span className="inline-flex items-center gap-1.5 uppercase tracking-wider">
                  <span>Chave Pix</span>
                  <EyeToggleButton
                    visible={showPix}
                    onToggle={() => setShowPix((v) => !v)}
                    iconSize={14}
                    showLabel="Revelar chave completa"
                    hideLabel="Ocultar chave completa"
                  />
                </span>
              </th>
              <th className={`px-3 py-3 text-right ${SECTION_HEADING_CLASS}`}>
                Valor
              </th>
              <th className={`px-3 py-3 text-right ${SECTION_HEADING_CLASS} last:pr-3`}>
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
                  {formatBRLReais(item.netAmount)}
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
                <p className={SECTION_HEADING_CLASS}>
                  Chave de destino
                </p>
                <EyeToggleButton
                  visible={showPix}
                  onToggle={() => setShowPix((v) => !v)}
                  iconSize={14}
                  showLabel="Revelar chave completa"
                  hideLabel="Ocultar chave completa"
                />
              </div>
              <p className="text-[13px] font-mono font-medium text-ink-body break-all">
                {getPixDisplay(item, showPix)}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs font-medium text-ink-secondary">Valor recebido</p>
              <p className="text-sm font-bold text-ink-heading">
                {formatBRLReais(item.netAmount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
