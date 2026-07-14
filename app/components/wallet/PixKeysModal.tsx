import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigation, useSubmit } from "react-router";
import type { PixKey } from "~/api/modules/pix-keys";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { Modal } from "~/components/ui/Modal";
import { SelectField } from "~/components/ui/SelectField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { pixKeySchema } from "~/validators/wallet-validator";

interface PixKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKeys: PixKey[];
  error?: string | null;
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

function getTypeName(type: string) {
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
  error,
}: PixKeysModalProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PixKeyType | "">("");

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
    }
  }, [isOpen, reset]);

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
    submit(formData, { method: "post" });
    reset({ key: "", alias: "" });
    setSelectedType("");
  };

  const onDeleteConfirm = (id: string) => {
    const formData = new FormData();
    formData.append("intent", "deletePixKey");
    formData.append("id", id);
    submit(formData, { method: "post" });
    setDeletingId(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Chaves Pix">
      <div className="space-y-6">
        {error && <AlertMessage variant="error" message={error} />}

        {/* Existing Keys List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-heading">
            Suas chaves cadastradas
          </h4>

          {pixKeys.length === 0 ? (
            <div className="text-center p-6 bg-secondary/20 border border-dashed border-border rounded-xl">
              <p className="text-xs text-text-secondary">
                Você ainda não possui chaves Pix cadastradas.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {pixKeys.map((pk) => (
                <div
                  key={pk.id}
                  className="bg-secondary/40 border border-border rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/10">
                          {getTypeName(pk.keyType)}
                        </span>
                        {pk.alias && (
                          <span className="text-xs font-semibold text-text-heading truncate">
                            {pk.alias}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-primary mt-1 break-all font-mono font-medium">
                        {pk.keyMasked}
                      </p>
                    </div>

                    {deletingId !== pk.id && (
                      <button
                        type="button"
                        onClick={() => setDeletingId(pk.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors duration-150 cursor-pointer outline-none shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Inline Delete Confirmation */}
                  {deletingId === pk.id && (
                    <div className="bg-error/5 border border-error/20 p-2.5 rounded-lg flex items-center justify-between gap-2 mt-1 animate-[fadeInUp_0.15s_ease-out]">
                      <div className="flex items-center gap-1.5 text-xs text-error font-medium">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Confirmar exclusão?</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="px-2.5 py-1 rounded bg-secondary text-[11px] font-semibold text-text-primary hover:bg-surface-hover transition-colors duration-100 cursor-pointer outline-none"
                        >
                          Não
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteConfirm(pk.id)}
                          className="px-2.5 py-1 rounded bg-error text-[11px] font-semibold text-white hover:bg-error/85 transition-colors duration-100 cursor-pointer outline-none"
                        >
                          Sim, excluir
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
        <div className="border-t border-border/50 pt-5">
          <h4 className="text-sm font-semibold text-text-heading mb-3">
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
              <Plus className="h-4 w-4" />
              Adicionar Chave
            </SubmitButton>
          </form>
        </div>
      </div>
    </Modal>
  );
}
