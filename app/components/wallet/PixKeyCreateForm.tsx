import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import { FormField } from "~/components/ui/FormField";
import { Icon } from "~/components/ui/Icon";
import { SelectField } from "~/components/ui/SelectField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { useToast } from "~/components/ui/useToast";
import { SECTION_HEADING_CLASS } from "~/components/ui/classes";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";
import { buildIntentFormData } from "~/util/submit-intent";
import { pixKeySchema } from "~/validators/wallet-validator";
import {
  formatByType,
  getTypeName,
  normalizeByType,
  type PixKeyType,
} from "./pix-key-format";

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

interface PixKeyCreateFormProps {
  isOpen: boolean;
  /** Erro exibido no topo do modal pai. */
  onError: (message: string | null) => void;
}

/** Formulário de cadastro (tipo + chave mascarada + alias) com fetcher próprio. */
export function PixKeyCreateForm({ isOpen, onError }: PixKeyCreateFormProps) {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const loading = fetcher.state === "submitting";
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

  useResetOnOpen(isOpen, () => {
    reset({ key: "", alias: "" });
    setSelectedType("");
  });

  useFetcherFeedback<{ success: boolean; action: string; error?: string }>({
    data: fetcher.data,
    state: fetcher.state,
    onResult: (result) => {
      if (result.success) {
        toast("Chave Pix cadastrada com sucesso!", "success");
        reset({ key: "", alias: "" });
        setSelectedType("");
      } else if (result.error) {
        onError(result.error);
      }
    },
    onSubmitting: () => onError(null),
  });

  const handleTypeChange = (val: string) => {
    setSelectedType(val as PixKeyType);
    setValue("key", "", { shouldDirty: false, shouldValidate: false });
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeByType(e.target.value, selectedType);
    setValue("key", normalized, { shouldDirty: true, shouldValidate: true });
  };

  const onAddKey = (data: { key: string; alias?: string }) => {
    fetcher.submit(
      buildIntentFormData("createPixKey", {
        key: data.key,
        ...(data.alias ? { alias: data.alias } : {}),
      }),
      { method: "post" },
    );
  };

  return (
    <div className="border-t border-line pt-4">
      <h4 className={`mb-3 ${SECTION_HEADING_CLASS}`}>
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
  );
}
