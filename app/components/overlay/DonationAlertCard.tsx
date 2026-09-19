import type { OverlayDonationEntity } from "~/types/queue";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

interface DonationAlertCardProps {
  donation: OverlayDonationEntity;
}

export function DonationAlertCard({ donation }: DonationAlertCardProps) {
  const { name, amount, message, isTest } = donation;

  return (
    <div className="alert-card-in w-[400px] max-w-[92vw] rounded-[26px] bg-white border border-[#dfe3ea] shadow-[0_18px_50px_-12px_rgba(17,21,30,0.35)] p-6">
      <style>{`
        @keyframes alert-card-in {
          0% { opacity: 0; transform: translateY(24px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .alert-card-in {
          animation: alert-card-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      {isTest && (
        <span className="inline-flex items-center rounded-full bg-[#fff7d6] text-[#b58a00] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 mb-3">
          Teste
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-[#eceef3] border border-[#dfe3ea] flex items-center justify-center shrink-0">
          <span className="text-base font-extrabold text-[#11151e]">
            {name.charAt(0).toUpperCase() || "?"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-lg font-extrabold text-[#11151e] leading-tight truncate">
            {name}
          </p>
          <p className="text-sm font-extrabold text-[#b58a00] leading-snug">
            {formatAmount(amount)}
          </p>
        </div>
      </div>

      {message && (
        <p className="mt-3 text-sm font-medium text-[#707684] leading-relaxed line-clamp-3 break-words">
          {message}
        </p>
      )}
    </div>
  );
}
