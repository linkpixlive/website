import { LINK_CLASS } from "~/components/ui/classes";
import type { PixKey } from "~/api/modules/pix-keys";
import { getPixDisplayName } from "./pix-key-format";

interface WithdrawalDestinationProps {
  pixKeys: PixKey[];
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
  onManageKeys: () => void;
}

export function WithdrawalDestination({
  pixKeys,
  value,
  onChange,
  error,
  disabled,
  onManageKeys,
}: WithdrawalDestinationProps) {
  if (pixKeys.length === 0) {
    return (
      <div className="space-y-1">
        <div className="text-center p-4 bg-wash rounded-2xl">
          <p className="text-[13px] font-medium text-ink-secondary mb-1">
            Sem chaves Pix cadastradas
          </p>
          <button
            type="button"
            onClick={onManageKeys}
            className={`text-xs font-semibold ${LINK_CLASS} cursor-pointer outline-none`}
          >
            Cadastrar Chave Pix
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
        Receber em
      </p>
      <div className="divide-y divide-line/60" role="radiogroup" aria-label="Receber em">
        {pixKeys.map((pk) => {
          const display = getPixDisplayName(pk, true);
          const selected = value === pk.id;
          return (
            <button
              key={pk.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(pk.id)}
              className={`flex w-full cursor-pointer items-center gap-3 py-3.5 text-left outline-none transition-colors duration-150 disabled:opacity-60 ${
                selected
                  ? "-mx-2 px-2 rounded-xl bg-wash"
                  : "hover:bg-wash/60"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors duration-150 ${
                  selected ? "border-brand" : "border-line-input"
                }`}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-body">
                {pk.alias ? `${pk.alias} · ` : ""}
                <span className="font-mono font-medium">{display}</span>
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-error text-xs font-medium">{error}</p>}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onManageKeys}
          className={`text-xs font-semibold ${LINK_CLASS} transition-colors duration-150 cursor-pointer outline-none`}
        >
          Gerenciar chaves Pix
        </button>
      </div>
    </div>
  );
}
