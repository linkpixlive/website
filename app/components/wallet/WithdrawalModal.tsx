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
import { getPixDisplayName } from "./pix-key-format";
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
  has2fa?: boolean;
  available: number;
  success?: boolean;
}

interface WithdrawalReceipt {
  amount: number;
  fee: number;
  net: number;
  dest: string;
}

export function WithdrawalModal({
  isOpen,
  onClose,
  pixKeys,
  onOpenManageKeys,
  error,
  has2fa,
  available,
  success = false,
}: WithdrawalModalProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  const feePercentage = WITHDRAWAL_FEE_PERCENTAGE;
  const maxAmount = MAX_WITHDRAWAL_AMOUNT;

  const [amountDisplay, setAmountDisplay] = useState("");
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [receipt, setReceipt] = useState<WithdrawalReceipt | null>(null);

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
    trigger,
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

  const { feeAmount, netAmount } = useMemo(() => {
    const val = Number(amountWatch);
    if (isNaN(val) || val <= 0) return { feeAmount: 0, netAmount: 0 };
    const fee = +(val * (feePercentage / 100)).toFixed(2);
    return { feeAmount: fee, netAmount: +(val - fee).toFixed(2) };
  }, [amountWatch, feePercentage]);

  useResetOnOpen(isOpen, () => {
    reset({ amount: "", pixId: "", password: "" });
    setAmountDisplay("");
    setStep("details");
    setReceipt(null);
    idempotencyRef.current = null;
  });

  const handleContinue = async () => {
    const valid = await trigger(["amount", "pixId"]);
    if (valid) setStep("confirm");
  };

  const selectedKey = pixKeys.find((pk) => pk.id === pixIdWatch);

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

    const destKey = pixKeys.find((pk) => pk.id === data.pixId);
    setReceipt({
      amount: data.amount,
      fee: feeAmount,
      net: netAmount,
      dest: destKey ? getPixDisplayName(destKey, true) : "—",
    });

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        success ? "Saque solicitado" : step === "details" ? "Solicitar Saque" : "Confirmar saque"
      }
    >
      {success && receipt ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <Icon name="check-circle" size={20} strokeWidth={2} />
            </span>
            <p className="text-sm font-medium text-ink-secondary">
              Seu saque foi registrado e será processado.
            </p>
          </div>
          <dl className="divide-y divide-line/60">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[13px] font-medium text-ink-secondary">
                Valor do saque
              </dt>
              <dd className="text-sm font-bold text-ink-heading tabular-nums">
                {formatBRLReais(receipt.amount)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[13px] font-medium text-ink-secondary">
                Taxa ({feePercentage}%)
              </dt>
              <dd className="text-sm font-semibold text-error tabular-nums">
                -{formatBRLReais(receipt.fee)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[13px] font-medium text-ink-secondary">
                Destino
              </dt>
              <dd className="min-w-0 truncate font-mono text-[13px] font-medium text-ink-body">
                {receipt.dest}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm font-bold text-ink-heading">
                Você receberá
              </dt>
              <dd className="text-base font-extrabold text-ink-heading tabular-nums">
                {formatBRLReais(receipt.net)}
              </dd>
            </div>
          </dl>
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink-secondary">
            <Icon
              name="clock-circle"
              size={14}
              strokeWidth={1.9}
              className="text-ink-muted shrink-0"
            />
            O valor cai na chave selecionada em até 1 dia útil.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="w-full"
          >
            Entendido
          </Button>
        </div>
      ) : (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === "details" ? (
          <>
            <p className="text-[13px] font-medium text-ink-secondary">
              Disponível:{" "}
              <strong className="font-bold text-ink-heading tabular-nums">
                {formatBRLReais(available)}
              </strong>
            </p>

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

            <SubmitButton
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="w-full"
            >
              Continuar
            </SubmitButton>
          </>
        ) : (
          <>
            <dl className="divide-y divide-line/60">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[13px] font-medium text-ink-secondary">
                  Valor do saque
                </dt>
                <dd className="text-sm font-bold text-ink-heading tabular-nums">
                  {formatBRLReais(Number(amountWatch))}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[13px] font-medium text-ink-secondary">
                  Taxa ({feePercentage}%)
                </dt>
                <dd className="text-sm font-semibold text-error tabular-nums">
                  -{formatBRLReais(feeAmount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[13px] font-medium text-ink-secondary">
                  Destino
                </dt>
                <dd className="min-w-0 truncate font-mono text-[13px] font-medium text-ink-body">
                  {selectedKey ? getPixDisplayName(selectedKey, true) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-sm font-bold text-ink-heading">
                  Você receberá
                </dt>
                <dd className="text-base font-extrabold text-ink-heading tabular-nums">
                  {formatBRLReais(netAmount)}
                </dd>
              </div>
            </dl>

            {error && <AlertMessage variant="error" message={error} />}

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

            <div className="flex gap-3 pt-4 border-t border-line">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("details")}
                className="flex-1"
              >
                Voltar
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
          </>
        )}
      </form>
      )}
    </Modal>
  );
}
