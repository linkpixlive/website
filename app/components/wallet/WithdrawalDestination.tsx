import { SelectField } from "~/components/ui/SelectField";
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

/** Destino do saque: vazio (CTA cadastrar) ou SelectField + gerenciar. */
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

  const options = pixKeys.map((pk) => {
    // Valor completo (sem máscara) para o usuário confirmar o destino exato.
    // Fallback para keyMasked caso a chave descriptografada não venha na listagem.
    const displayValue = getPixDisplayName(pk, true);
    return {
      value: pk.id,
      label: pk.alias ? `${pk.alias} (${displayValue})` : displayValue,
    };
  });

  return (
    <div className="space-y-1">
      <SelectField
        label="Destinatário (Chave Pix)"
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Selecione a chave Pix..."
        error={error}
        disabled={disabled}
      />
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
