import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigation, useSubmit } from "react-router";
import type { PixKey } from "~/api/modules/pix-keys";
import { OtpField } from "~/components/auth/OtpField";
import { PasswordField } from "~/components/auth/PasswordField";
import { AlertMessage } from "~/components/ui/AlertMessage";
import { FormField } from "~/components/ui/FormField";
import { Modal } from "~/components/ui/Modal";
import { SubmitButton } from "~/components/ui/SubmitButton";
import { Icon } from "~/components/ui/Icon";
import { Button } from "~/components/ui/Button";
import { WithdrawalDestination } from "./WithdrawalDestination";
import {
  MAX_WITHDRAWAL_AMOUNT,
  MIN_WITHDRAWAL_AMOUNT,
  WITHDRAWAL_FEE_PERCENTAGE,
  createWithdrawalSchema,
} from "~/validators/wallet-validator";
import {
  clampCents,
  formatBRLReais,
  maskCurrencyInput,
  parseCurrencyToCents,
} from "~/util/currency";
import { useResetOnOpen } from "~/hooks/useResetOnOpen";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixKeys: PixKey[];
  onOpenManageKeys: () => void;
  error?: string | null;
  /** Com 2FA ativo o backend exige senha + TOTP no saque. */
  has2fa?: boolean;
}

export function WithdrawalModal({
  isOpen,
  onClose,
  pixKeys,
  onOpenManageKeys,
  error,
  has2fa,
}: WithdrawalModalProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  const feePercentage = WITHDRAWAL_FEE_PERCENTAGE;
  const minAmount = MIN_WITHDRAWAL_AMOUNT;
  const maxAmount = MAX_WITHDRAWAL_AMOUNT;

  const [amountDisplay, setAmountDisplay] = useState("");

  // Chave de idempotência presa ao payload: reenviar a MESMA tentativa (timeout
  // de rede, duplo clique) reaproveita a chave e o backend devolve o mesmo saque
  // em vez de criar outro. Mudar valor ou chave Pix exige uma chave nova.
  const idempotencyRef = useRef<{
    key: string;
    amount: number;
    pixId: string;
  } | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(
      createWithdrawalSchema(MIN_WITHDRAWAL_AMOUNT, MAX_WITHDRAWAL_AMOUNT),
    ),
    defaultValues: {
      amount: "",
      pixId: "",
      password: "",
    },
  });

  const amountWatch = watch("amount");
  const pixIdWatch = watch("pixId");
  const totpWatch = watch("totp");

  // Currency mask helpers (centavos → "R$ 1.234,56"), com teto do saque.

  const getLimitedCents = (value: string): number | null =>
    clampCents(parseCurrencyToCents(value), maxAmount * 100);

  /** Formats a raw numeric string (e.g. "123456") into "R$ 1.234,56" */
  const maskCurrency = (digits: string): string => {
    const cents = getLimitedCents(digits);
    if (cents === null) return "";
    return `R$ ${maskCurrencyInput(String(cents))}`;
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

  // Taxa derivada do valor (sem useEffect+setState para valor derivado).
  const { feeAmount, netAmount } = useMemo(() => {
    const val = Number(amountWatch);
    if (isNaN(val) || val <= 0) return { feeAmount: 0, netAmount: 0 };
    const fee = +(val * (feePercentage / 100)).toFixed(2);
    return { feeAmount: fee, netAmount: +(val - fee).toFixed(2) };
  }, [amountWatch, feePercentage]);

  // Clean form values on modal open — destinatário sempre começa vazio
  // para exigir seleção manual (evita saque na chave errada por padrão).
  useResetOnOpen(isOpen, () => {
    reset({ amount: "", pixId: "", password: "" });
    setAmountDisplay("");
    idempotencyRef.current = null;
  });

  const onSubmit = (data: {
    amount: number;
    pixId: string;
    password: string;
    totp?: string;
  }) => {
    const cached = idempotencyRef.current;
    const attempt =
      cached && cached.amount === data.amount && cached.pixId === data.pixId
        ? cached
        : { key: crypto.randomUUID(), amount: data.amount, pixId: data.pixId };
    idempotencyRef.current = attempt;

    const formData = new FormData();
    formData.append("intent", "createWithdrawal");
    formData.append("amount", data.amount.toString());
    formData.append("pixId", data.pixId);
    formData.append("password", data.password);
    if (data.totp) formData.append("totp", data.totp);
    formData.append("idempotencyKey", attempt.key);
    submit(formData, { method: "post" });
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

        <WithdrawalDestination
          pixKeys={pixKeys}
          value={pixIdWatch}
          onChange={(val) =>
            setValue("pixId", val, { shouldValidate: true })
          }
          error={errors.pixId?.message}
          disabled={loading}
          onManageKeys={onOpenManageKeys}
        />

        <PasswordField
          label="Senha"
          icon="lock"
          autoComplete="current-password"
          error={errors.password?.message}
          disabled={loading}
          {...register("password")}
        />

        {has2fa && (
          <OtpField
            label="Código do autenticador"
            isOpen={isOpen}
            disabled={loading}
            error={Boolean(error) && !totpWatch}
            onChange={(code) => setValue("totp", code)}
          />
        )}

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
                {formatBRLReais(minAmount)}
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
                -{formatBRLReais(feeAmount)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-line">
              <span className="text-sm font-bold text-ink-heading">
                Você receberá
              </span>
              <span className="text-sm font-bold text-ink-heading">
                {formatBRLReais(netAmount)}
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
            disabled={
              pixKeys.length === 0 ||
              loading ||
              (has2fa && totpWatch?.length !== 6)
            }
            className="flex-1"
          >
            Confirmar Saque
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
