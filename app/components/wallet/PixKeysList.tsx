import type { PixKey } from "~/api/modules/pix-keys";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { PixKeyRow } from "./PixKeyRow";

interface PixKeysListProps {
  pixKeys: PixKey[];
  onDelete: (key: PixKey) => void;
}

export function PixKeysList({ pixKeys, onDelete }: PixKeysListProps) {
  return (
    <div className="space-y-2">
      <h4 className={SECTION_HEADING_CLASS}>
        Suas chaves cadastradas
      </h4>

      {pixKeys.length === 0 ? (
        <div className="text-center py-6 bg-wash rounded-2xl">
          <p className="text-xs font-medium text-ink-secondary">
            Você ainda não possui chaves Pix cadastradas.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line/60 max-h-60 overflow-y-auto scrollbar-thin pr-1">
          {pixKeys.map((pk) => (
            <PixKeyRow key={pk.id} pixKey={pk} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
