import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import type { PixKey } from "~/api/modules/pix-keys";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { Modal } from "~/components/ui/Modal";
import { SelectField } from "~/components/ui/SelectField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useToast } from "~/components/ui/useToast";
import { Icon } from "~/components/ui/Icon";
import { pixKeySchema } from "~/validators/wallet-validator";
import {
  formatByType,
  formatPixKeyValue,
  getTypeName,
  normalizeByType,
  type PixKeyType,
} from "./pixKeyFormat";

interface PixKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKeys: PixKey[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PIX_KEY_TYPE_OPTIONS: { value: PixKeyType; label: string }[] = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "phone", label: "Telefone" },
  { value: "email", label: "E-mail" },
  { value: "random", label: "Chave Aleatória" },
];

function getPlaceholder(type: PixKeyType | ""): string {
  const map: Record<PixKeyType, string> = {
    cpf: "000.000.000-00",
    cnpj: "AB.CDE.FGH/0001-IJ",
    phone: "(11) 99999-9999",
    email: "exemplo@email.com",
    random: "Cole aqui a chave aleatória",
  };
  return type ? map[type] : "";
}

// Re-export para compatibilidade com imports existentes
// (ex. PixKeysCard importa getTypeName daqui).
export { getTypeName } from "./pixKeyFormat";

// ─── Component ─────────────────────────────────────────────────────────────────

export function PixKeysModal({
  isOpen,
  onClose,
  pixKeys,
}: PixKeysModalProps) {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const loading = fetcher.state === "submitting";

  const [confirmingKey, setConfirmingKey] = useState<PixKey | null>(null);
  const [selectedType, setSelectedType] = useState<PixKeyType | "">("");
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(pixKeySchema),
    defaultValues: {
      key: "",
      alias: "",
    },
  });

  const keyValue = watch("key") || "";

  // Clean form on modal open/close
  useEffect(() => {
    if (isOpen) {
      reset({ key: "", alias: "" });
      setSelectedType("");
      setConfirmingKey(null);
      setLocalError(null);
    }
  }, [isOpen, reset]);

  // Guarda o último resultado já tratado para exibir o toast uma única vez
  // por submissão. Sem isso, qualquer re-render com nova identidade de `toast`
  // (ou de callbacks) refaria o efeito com o mesmo `fetcher.data` e chamaria
  // `manager.add()` em loop -> "Maximum update depth exceeded".
  const lastHandledResult = useRef<unknown>(null);

  // Handle fetcher results (toast feedback & error)
  useEffect(() => {
    if (!fetcher.data || fetcher.data === lastHandledResult.current) return;
    lastHandledResult.current = fetcher.data;

    if (fetcher.data.success) {
      if (fetcher.data.action === "createPixKey") {
        toast("Chave Pix cadastrada com sucesso!", "success");
        reset({ key: "", alias: "" });
        setSelectedType("");
      } else if (fetcher.data.action === "deletePixKey") {
        toast("Chave Pix excluída com sucesso!", "success");
        setConfirmingKey(null);
      }
    } else if (fetcher.data.error) {
      setLocalError(fetcher.data.error);
    }
  }, [fetcher.data, toast, reset]);

  // Clear error on new submission
  useEffect(() => {
    if (fetcher.state === "submitting") {
      setLocalError(null);
    }
  }, [fetcher.state]);

  const handleTypeChange = (val: string) => {
    setSelectedType(val as PixKeyType);
    setValue("key", "", { shouldDirty: false, shouldValidate: false });
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeByType(e.target.value, selectedType);
    setValue("key", normalized, { shouldDirty: true, shouldValidate: true });
  };

  const onAddKey = (data: { key: string; alias?: string }) => {
    const formData = new FormData();
    formData.append("intent", "createPixKey");
    formData.append("key", data.key);
    if (data.alias) {
      formData.append("alias", data.alias);
    }
    fetcher.submit(formData, { method: "post" });
  };

  const onDeleteConfirm = (id: string) => {
    const formData = new FormData();
    formData.append("intent", "deletePixKey");
    formData.append("id", id);
    fetcher.submit(formData, { method: "post" });
    setConfirmingKey(null);
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Chaves Pix">
      <div className="space-y-6">
        {localError && <AlertMessage variant="error" message={localError} />}

        {/* Existing Keys List */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
            Suas chaves cadastradas
          </h4>

          {pixKeys.length === 0 ? (
            <div className="text-center py-6 bg-wash rounded-2xl">
              <p className="text-xs font-medium text-ink-secondary">
                Você ainda não possui chaves Pix cadastradas.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line max-h-60 overflow-y-auto scrollbar-thin pr-1">
              {pixKeys.map((pk) => (
                <div key={pk.id} className="py-3 flex items-start justify-between gap-3 first:pt-1 last:pb-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-wash text-ink-secondary">
                          {getTypeName(pk.keyType)}
                        </span>
                        {pk.alias && (
                          <span className="text-[13px] font-bold text-ink-heading truncate">
                            {pk.alias}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-secondary mt-1 break-all font-mono font-medium">
                        {formatPixKeyValue(pk.key ?? pk.keyMasked, pk.keyType)}
                      </p>
                    </div>

                      <button
                        type="button"
                        onClick={() => setConfirmingKey(pk)}
                        className="p-1.5 rounded-full text-chrome-icon hover:text-error hover:bg-danger-wash transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
                      >
                        <Icon name="trash-bin-minimalistic" size={16} strokeWidth={1.9} />
                      </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Key Form */}
        <div className="border-t border-line pt-4">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label mb-3">
            Cadastrar nova chave
          </h4>
          <form onSubmit={handleSubmit(onAddKey)} className="space-y-3.5">
            {/* Step 1: type selector */}
            <SelectField
              label="Tipo de Chave Pix"
              options={PIX_KEY_TYPE_OPTIONS}
              value={selectedType}
              onChange={handleTypeChange}
              placeholder="Selecione o tipo..."
              disabled={loading}
            />

            {/* Step 2: masked input — only shown after a type is selected */}
            {selectedType && (
              <FormField
                label={`Chave Pix (${getTypeName(selectedType)})`}
                name="key"
                value={formatByType(keyValue, selectedType)}
                onChange={handleKeyChange}
                placeholder={getPlaceholder(selectedType)}
                error={errors.key?.message}
                disabled={loading}
                inputMode={
                  selectedType === "phone" || selectedType === "cpf"
                    ? "numeric"
                    : "text"
                }
                autoComplete="off"
              />
            )}

            <FormField
              label="Alias (Opcional)"
              {...register("alias")}
              placeholder="Ex: Minha conta principal"
              error={errors.alias?.message}
              disabled={loading}
            />

            <SubmitButton
              loading={loading}
              disabled={loading}
              className="w-full mt-2"
            >
              <Icon name="add-circle" size={16} strokeWidth={2} />
              Adicionar Chave
            </SubmitButton>
          </form>
        </div>
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
                  ? `${confirmingKey.alias} • ${formatPixKeyValue(confirmingKey.key ?? confirmingKey.keyMasked, confirmingKey.keyType)}`
                  : formatPixKeyValue(confirmingKey.key ?? confirmingKey.keyMasked, confirmingKey.keyType)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => confirmingKey && onDeleteConfirm(confirmingKey.id)}
            className="w-full px-3 py-2 rounded-full bg-error text-white text-xs font-bold hover:bg-error-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none"
          >
            Sim, excluir
          </button>
          <button
            type="button"
            onClick={() => setConfirmingKey(null)}
            className="w-full px-3 py-2 rounded-full bg-wash text-xs font-bold text-ink-body hover:bg-wash-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none"
          >
            Não, manter
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
}
