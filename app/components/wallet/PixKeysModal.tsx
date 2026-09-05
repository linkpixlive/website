import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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

interface PixKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKeys: PixKey[];
}

type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";

// ─── Formatters ────────────────────────────────────────────────────────────────

function formatCpf(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatCnpj(value: string) {
  // New CNPJ format (IN RFB 2.043/2024) supports alphanumeric characters
  // Mask: XX.XXX.XXX/XXXX-XX  (X = digit or uppercase letter)
  const clean = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 14);
  return clean
    .replace(/^([A-Z0-9]{2})([A-Z0-9])/, "$1.$2")
    .replace(/^([A-Z0-9]{2})\.([A-Z0-9]{3})([A-Z0-9])/, "$1.$2.$3")
    .replace(/\.([A-Z0-9]{3})([A-Z0-9])/, ".$1/$2")
    .replace(/([A-Z0-9]{4})([A-Z0-9])/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const formatted = digits.replace(/^(\d{2})(\d)/, "($1) $2");
  if (digits.length <= 10) {
    return formatted.replace(/(\d{4})(\d)/, "$1-$2");
  }
  return formatted.replace(/(\d{5})(\d)/, "$1-$2");
}

function formatByType(value: string, type: PixKeyType | ""): string {
  if (!type || !value) return value;
  if (type === "cpf") return formatCpf(value);
  if (type === "cnpj") return formatCnpj(value);
  if (type === "phone") return formatPhone(value);
  return value;
}

// ─── Normalizers (value sent to server) ────────────────────────────────────────

function normalizeByType(raw: string, type: PixKeyType | ""): string {
  if (!type) return raw;
  if (type === "cpf") return raw.replace(/\D/g, "");
  // CNPJ: strip formatting but keep alphanumeric (new format)
  if (type === "cnpj") return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (type === "phone") {
    return raw.replace(/\D/g, "");
  }
  return raw.trim();
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

export function getTypeName(type: string) {
  const types: Record<string, string> = {
    cpf: "CPF",
    cnpj: "CNPJ",
    email: "E-mail",
    phone: "Telefone",
    random: "Aleatória",
  };
  return types[type.toLowerCase()] || type;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PixKeysModal({
  isOpen,
  onClose,
  pixKeys,
}: PixKeysModalProps) {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const loading = fetcher.state === "submitting";

  const [deletingId, setDeletingId] = useState<string | null>(null);
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
      setDeletingId(null);
      setLocalError(null);
    }
  }, [isOpen, reset]);

  // Handle fetcher results (toast feedback & error)
  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.success) {
      if (fetcher.data.action === "createPixKey") {
        toast("Chave Pix cadastrada com sucesso!", "success");
        reset({ key: "", alias: "" });
        setSelectedType("");
      } else if (fetcher.data.action === "deletePixKey") {
        toast("Chave Pix excluída com sucesso!", "success");
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
    setDeletingId(null);
  };

  return (
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
                <div key={pk.id} className="py-3 flex flex-col gap-2 first:pt-1 last:pb-1">
                  <div className="flex items-start justify-between gap-3">
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
                        {pk.keyMasked}
                      </p>
                    </div>

                    {deletingId !== pk.id && (
                      <button
                        type="button"
                        onClick={() => setDeletingId(pk.id)}
                        className="p-1.5 rounded-full text-chrome-icon hover:text-error hover:bg-danger-wash transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
                      >
                        <Icon name="trash-bin-minimalistic" size={16} strokeWidth={1.9} />
                      </button>
                    )}
                  </div>

                  {/* Inline Delete Confirmation */}
                  {deletingId === pk.id && (
                    <div className="bg-error/5 border border-error/20 p-3 rounded-xl space-y-2 mt-1 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-error">
                        <Icon name="danger-circle" size={14} strokeWidth={2} />
                        <span>Excluir esta chave Pix permanentemente?</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => onDeleteConfirm(pk.id)}
                          className="w-full px-3 py-1.5 rounded-full bg-error text-white text-[11px] font-bold hover:bg-error-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none"
                        >
                          Sim, excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="w-full px-3 py-1.5 rounded-full bg-wash text-[11px] font-bold text-ink-body hover:bg-wash-hover active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none"
                        >
                          Não, manter
                        </button>
                      </div>
                    </div>
                  )}
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
  );
}
