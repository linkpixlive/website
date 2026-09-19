import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigation, useSubmit } from "react-router";
import type { PixKey } from "~/api/modules/pix-keys";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { Modal } from "~/components/ui/Modal";
import { SelectField } from "~/components/ui/SelectField";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";
import { withdrawalSchema } from "~/validators/wallet-validator";
import { formatPixKeyValue } from "./pixKeyFormat";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKeys: PixKey[];
  onOpenManageKeys: () => void;
  error?: string | null;
}

export function WithdrawalModal({
  isOpen,
  onClose,
  pixKeys,
  onOpenManageKeys,
  error,
}: WithdrawalModalProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  const feePercentage = Number(
    import.meta.env.VITE_WITHDRAWAL_FEE_PERCENTAGE || "4",
  );
  const minAmount = Number(import.meta.env.VITE_MIN_WITHDRAWAL_AMOUNT || "10");
  const maxAmount = 100000;

  const [netAmount, setNetAmount] = useState(0);
  const [feeAmount, setFeeAmount] = useState(0);
  const [amountDisplay, setAmountDisplay] = useState("");

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      pixId: "",
    },
  });

  const amountWatch = watch("amount");
  const pixIdWatch = watch("pixId");

  // Currency mask helpers

  const getLimitedCents = (value: string): number | null => {
    const onlyDigits = value.replace(/\D/g, "");
    if (!onlyDigits) return null;
    const cents = parseInt(onlyDigits, 10);
    return Math.min(cents, maxAmount * 100);
  };

  /** Formats a raw numeric string (e.g. "123456") into "R$ 1.234,56" */
  const maskCurrency = (digits: string): string => {
    const cents = getLimitedCents(digits);
    if (cents === null) return "";
    const formatted = (cents / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$ ${formatted}`;
  };

  /** Converts a masked display value ("R$ 1.234,56") to a plain numeric string ("1234.56") */
  const parseCurrency = (masked: string): string => {
    const cents = getLimitedCents(masked);
    if (cents === null) return "";
    return (cents / 100).toFixed(2);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCurrency(e.target.value);
    setAmountDisplay(masked);
    setValue("amount", parseCurrency(e.target.value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Calculate fees on the fly
  useEffect(() => {
    const val = Number(amountWatch);
    if (!isNaN(val) && val > 0) {
      const fee = +(val * (feePercentage / 100)).toFixed(2);
      setFeeAmount(fee);
      setNetAmount(+(val - fee).toFixed(2));
    } else {
      setFeeAmount(0);
      setNetAmount(0);
    }
  }, [amountWatch, feePercentage]);

  // Clean form values on modal open — destinatário sempre começa vazio
  // para exigir seleção manual (evita saque na chave errada por padrão).
  useEffect(() => {
    if (isOpen) {
      reset({ amount: "", pixId: "" });
      setAmountDisplay("");
    }
  }, [isOpen, reset]);

  const onSubmit = (data: { amount: number; pixId: string }) => {
    const formData = new FormData();
    formData.append("intent", "createWithdrawal");
    formData.append("amount", data.amount.toString());
    formData.append("pixId", data.pixId);
    submit(formData, { method: "post" });
  };

  const pixKeyOptions = pixKeys.map((pk) => {
    // Valor completo (sem máscara) para o usuário confirmar o destino exato.
    // Fallback para keyMasked caso a chave descriptografada não venha na listagem.
    const displayValue = formatPixKeyValue(pk.key ?? pk.keyMasked, pk.keyType);
    return {
      value: pk.id,
      label: pk.alias ? `${pk.alias} (${displayValue})` : displayValue,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Saque">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <AlertMessage variant="error" message={error} />}

        <FormField
          label="Valor do Saque"
          name="amount"
          type="text"
          inputMode="numeric"
          placeholder="R$ 0,00"
          value={amountDisplay}
          onChange={handleAmountChange}
          error={errors.amount?.message}
          disabled={loading}
        />

        <div className="space-y-1">
          {pixKeys.length === 0 ? (
            <div className="text-center p-4 bg-wash rounded-2xl">
              <p className="text-[13px] font-medium text-ink-secondary mb-1">
                Sem chaves Pix cadastradas
              </p>
              <button
                type="button"
                onClick={onOpenManageKeys}
                className="text-xs font-semibold text-info hover:text-blue-700 underline cursor-pointer outline-none"
              >
                Cadastrar Chave Pix
              </button>
            </div>
          ) : (
            <SelectField
              label="Destinatário (Chave Pix)"
              options={pixKeyOptions}
              value={pixIdWatch}
              onChange={(val) =>
                setValue("pixId", val, { shouldValidate: true })
              }
              placeholder="Selecione a chave Pix..."
              error={errors.pixId?.message}
              disabled={loading}
            />
          )}

          {pixKeys.length > 0 && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onOpenManageKeys}
                className="text-xs font-semibold text-info hover:text-blue-700 underline transition-colors duration-150 cursor-pointer outline-none"
              >
                Gerenciar chaves Pix
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2.5 bg-wash rounded-2xl p-3.5">
          <Icon
            name="info-circle"
            size={16}
            strokeWidth={1.9}
            className="text-chrome-icon shrink-0 mt-0.5"
          />
          <div className="text-[13px] font-medium text-ink-secondary">
            <p>
              Valor mínimo para saques:{" "}
              <span className="text-ink-body font-bold">
                {formatCurrency(minAmount)}
              </span>
            </p>
            <p className="mt-1">
              Taxa de saque aplicada:{" "}
              <span className="text-ink-body font-bold">{feePercentage}%</span>
            </p>
          </div>
        </div>

        {netAmount > 0 && (
          <div className="bg-wash rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-[13px] font-medium text-ink-secondary">
              <span>Desconto da taxa ({feePercentage}%)</span>
              <span className="text-error font-semibold">
                -{formatCurrency(feeAmount)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-line">
              <span className="text-sm font-bold text-ink-heading">
                Você receberá
              </span>
              <span className="text-sm font-bold text-ink-heading">
                {formatCurrency(netAmount)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <SubmitButton
            loading={loading}
            disabled={pixKeys.length === 0 || loading}
            className="flex-1"
          >
            Confirmar Saque
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
