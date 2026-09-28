import type { PixKey } from "~/api/modules/pix-keys";
import { Icon } from "~/components/ui/Icon";
import { getPixDisplayName, getTypeName } from "./pix-key-format";

interface PixKeyRowProps {
  pixKey: PixKey;
  onDelete: (pixKey: PixKey) => void;
}

export function PixKeyRow({ pixKey, onDelete }: PixKeyRowProps) {
  return (
    <div className="py-3 flex items-start justify-between gap-3 first:pt-1 last:pb-1">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-wash text-ink-secondary">
            {getTypeName(pixKey.keyType)}
          </span>
          {pixKey.alias && (
            <span className="text-[13px] font-bold text-ink-heading truncate">
              {pixKey.alias}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-secondary mt-1 break-all font-mono font-medium">
          {getPixDisplayName(pixKey, true)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDelete(pixKey)}
        className="p-1.5 rounded-full text-chrome-icon hover:text-error hover:bg-danger-wash transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
      >
        <Icon name="trash-bin-minimalistic" size={16} strokeWidth={1.9} />
      </button>
    </div>
  );
}
