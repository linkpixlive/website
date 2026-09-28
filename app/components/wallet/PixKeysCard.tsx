import type { PixKey } from "~/api/modules/pix-keys";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
import { displayMaskedKey, getTypeName } from "./pix-key-format";
import {
  CARD_CLASS,
  ICON_TILE_CLASS,
  SECTION_HEADING_CLASS,
} from "~/components/ui/classes";

interface PixKeysCardProps {
  pixKeys: PixKey[];
  onManage: () => void;
}

export function PixKeysCard({ pixKeys, onManage }: PixKeysCardProps) {
  const preview = pixKeys.slice(0, 4);

  return (
    <div className={`h-full ${CARD_CLASS} flex flex-col`}>
      <div className="flex items-center justify-between mb-3">
        <span className={SECTION_HEADING_CLASS}>
          Chaves Pix
        </span>
        <span className="text-[11px] font-semibold text-ink-label">
          {pixKeys.length === 1 ? "1 chave" : `${pixKeys.length} chaves`}
        </span>
      </div>

      {preview.length === 0 ? (
        <div className="text-center py-5 bg-wash rounded-2xl">
          <p className="text-xs font-medium text-ink-secondary">
            Nenhuma chave cadastrada
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {preview.map((pk) => (
            <div key={pk.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-2.5 min-w-0">
              <span className={ICON_TILE_CLASS}>
                <Icon name="key-minimalistic-square" size={16} strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-ink-heading leading-tight truncate">
                  {pk.alias || getTypeName(pk.keyType)}
                </p>
                <p className="text-xs text-ink-secondary font-mono font-medium truncate">
                  {displayMaskedKey(pk.keyMasked)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="secondary" onClick={onManage} className="w-full mt-4">
        Gerenciar chaves
      </Button>
    </div>
  );
}
