import { useState } from "react";
import { useFetcher } from "react-router";
import type { PixKey } from "~/api/modules/pix-keys";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { ConfirmButtons } from "~/components/ui/ConfirmButtons";
import { Icon } from "~/components/ui/Icon";
import { Modal } from "~/components/ui/Modal";
import { useToast } from "~/components/ui/useToast";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";
import { buildIntentFormData } from "~/util/submit-intent";
import { getPixDisplayName } from "./pix-key-format";
import { PixKeyCreateForm } from "./PixKeyCreateForm";
import { PixKeysList } from "./PixKeysList";

interface PixKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKeys: PixKey[];
}

export function PixKeysModal({
  isOpen,
  onClose,
  pixKeys,
}: PixKeysModalProps) {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const [confirmingKey, setConfirmingKey] = useState<PixKey | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useResetOnOpen(isOpen, () => {
    setConfirmingKey(null);
    setLocalError(null);
  });

  // Toast único por exclusão (sem loop em re-render).
  useFetcherFeedback<{ success: boolean; action: string; error?: string }>({
    data: fetcher.data,
    state: fetcher.state,
    onResult: (result) => {
      if (result.success) {
        toast("Chave Pix excluída com sucesso!", "success");
        setConfirmingKey(null);
      } else if (result.error) {
        setLocalError(result.error);
      }
    },
    onSubmitting: () => setLocalError(null),
  });

  const onDeleteConfirm = (id: string) => {
    fetcher.submit(buildIntentFormData("deletePixKey", { id }), {
      method: "post",
    });
    setConfirmingKey(null);
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Chaves Pix">
      <div className="space-y-6">
        {localError && <AlertMessage variant="error" message={localError} />}

        <PixKeysList pixKeys={pixKeys} onDelete={setConfirmingKey} />

        <PixKeyCreateForm isOpen={isOpen} onError={setLocalError} />
      </div>
    </Modal>

    {/* Delete confirmation — modal separado para não ficar cortado pelo scroll da lista */}
    <Modal
      isOpen={confirmingKey !== null}
      onClose={() => setConfirmingKey(null)}
      title="Excluir chave Pix"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 bg-error/5 border border-error/20 rounded-2xl p-3.5">
          <Icon
            name="danger-circle"
            size={16}
            strokeWidth={2}
            className="text-error shrink-0 mt-0.5"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink-body leading-snug">
              Excluir esta chave Pix permanentemente?
            </p>
            {confirmingKey && (
              <p className="mt-1 text-xs text-ink-secondary font-mono font-medium break-all">
                {confirmingKey.alias
                  ? `${confirmingKey.alias} • ${getPixDisplayName(confirmingKey, true)}`
                  : getPixDisplayName(confirmingKey, true)}
              </p>
            )}
          </div>
        </div>

        <ConfirmButtons
          confirmLabel="Sim, excluir"
          cancelLabel="Não, manter"
          onConfirm={() => confirmingKey && onDeleteConfirm(confirmingKey.id)}
          onCancel={() => setConfirmingKey(null)}
        />
      </div>
    </Modal>
    </>
  );
}
