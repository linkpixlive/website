import type { PixKey } from "~/api/modules/pix-keys";
import { Icon } from "~/components/ui/Icon";
import { getPixDisplayName, getTypeName } from "./pix-key-format";

interface PixKeyRowProps {
  pixKey: PixKey;
  onDelete: (pixKey: PixKey) => void;
}

export function PixKeyRow({ pixKey, onDelete }: PixKeyRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors duration-150 hover:bg-wash">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wash text-ink-secondary">
        <Icon name="key-minimalistic-square" size={20} strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-tight text-ink-heading">
          {pixKey.alias || getTypeName(pixKey.keyType)}{" "}
          {pixKey.alias && (
            <span className="font-semibold text-ink-muted">
              · {getTypeName(pixKey.keyType)}
            </span>
          )}
        </p>
        <p className="truncate font-mono text-[12px] text-ink-secondary">
          {getPixDisplayName(pixKey, true)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDelete(pixKey)}
        aria-label={`Excluir chave ${getTypeName(pixKey.keyType)}`}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-ink-secondary outline-none transition-colors duration-150 hover:border-error hover:text-error active:scale-95"
      >
        <Icon name="trash-bin-minimalistic" size={16} strokeWidth={1.9} />
      </button>
    </div>
  );
}
