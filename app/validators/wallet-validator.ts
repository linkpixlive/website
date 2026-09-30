import { z } from "zod";
import { totpField } from "./account-validator";

export const MIN_WITHDRAWAL_AMOUNT = Number(
  import.meta.env.VITE_MIN_WITHDRAWAL_AMOUNT || "10",
);
export const MAX_WITHDRAWAL_AMOUNT = 100000;
export const WITHDRAWAL_FEE_PERCENTAGE = Number(
  import.meta.env.VITE_WITHDRAWAL_FEE_PERCENTAGE || "4",
);

export function createWithdrawalSchema(minAmount: number, maxAmount: number) {
  return z.object({
    amount: z
      .string()
      .min(1, "Informe o valor do saque")
      .transform((val) => Number(val.replace(",", ".")))
      .refine((val) => !isNaN(val) && val >= minAmount, {
        message: `O valor mínimo para saque é R$ ${minAmount}`,
      })
      .refine((val) => val <= maxAmount, {
        message: `O valor máximo para saque é R$ ${maxAmount.toLocaleString("pt-BR")}`,
      }),
    pixId: z.string().min(1, "Selecione uma chave Pix"),
    password: z.string().min(1, "Confirme com sua senha"),
    totp: totpField,
  });
}

export const pixKeySchema = z.object({
  key: z.string().min(1, "Informe a chave Pix"),
  alias: z.string().max(100, "O alias deve ter no maximo 100 caracteres").optional(),
});