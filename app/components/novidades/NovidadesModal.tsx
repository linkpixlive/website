import { Modal } from "~/components/ui/Modal";
import type { ReleaseItemKind } from "./releases";
import { useNovidades } from "./releases";

const kindStyles: Record<ReleaseItemKind, { dot: string; label: string }> = {
  feature: { dot: "bg-brand", label: "Novo" },
  improvement: { dot: "bg-info", label: "Melhoria" },
  fix: { dot: "bg-error", label: "Correção" },
};

interface NovidadesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovidadesModal({ isOpen, onClose }: NovidadesModalProps) {
  const { releases } = useNovidades();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novidades" size="lg">
      {releases.length === 0 ? (
        <p className="py-8 text-center text-sm font-medium text-ink-secondary">
          Nenhuma novidade por aqui — ainda.
        </p>
      ) : (
        <ol className="flex flex-col gap-6">
          {releases.map((release) => (
            <li key={release.id}>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-wash px-2.5 py-0.5 text-[11px] font-extrabold text-ink-heading">
                  v{release.version}
                </span>
                <span className="text-xs font-medium text-ink-secondary">
                  {release.date}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-ink-heading">
                {release.title}
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {release.items.map((item, index) => {
                  const kind = kindStyles[item.kind];
                  return (
                    <li key={index} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${kind.dot}`}
                      />
                      <p className="text-[13px] font-medium leading-snug text-ink-body">
                        <span className="mr-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-secondary">
                          {kind.label}
                        </span>
                        {item.text}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}
