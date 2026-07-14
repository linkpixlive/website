import { z } from "zod";

// We'll read these values inside components or actions using import.meta.env
const minAmount = Number(import.meta.env.VITE_MIN_WITHDRAWAL_AMOUNT || "10");
const maxAmount = 100000;

export const withdrawalSchema = z.object({
  amount: z
    .string()
    .min(1, "Informe o valor do saque")
    .transform((val) => Number(val.replace(",", ".")))
    .refine((val) => !isNaN(val) && val >= minAmount, {
      message: `O valor minimo para saque e R$ ${minAmount}`,
    })
    .refine((val) => val <= maxAmount, {
      message: `O valor maximo para saque e R$ ${maxAmount.toLocaleString("pt-BR")}`,
    }),
  pixId: z.string().min(1, "Selecione uma chave Pix"),
});

export const pixKeySchema = z.object({
  key: z.string().min(1, "Informe a chave Pix"),
  alias: z.string().max(100, "O alias deve ter no maximo 100 caracteres").optional(),
});