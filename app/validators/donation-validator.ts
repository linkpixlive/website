import { z } from "zod";
import { parseCurrencyToCents } from "~/util/currency";

export function createDonationSchema(maxMessageLength: number, minAmountCents: number) {
  const effectiveMaxMessageLength = Math.min(maxMessageLength, 250);

  return z.object({
    name: z.string().trim().max(100, "O nome deve ter no máximo 100 caracteres"),
    message: z.string().max(
      effectiveMaxMessageLength,
      `A mensagem deve ter no máximo ${effectiveMaxMessageLength} caracteres`,
    ),
    amountText: z
      .string()
      .min(1, "Informe um valor")
      .transform((value) => parseCurrencyToCents(value))
      .refine(
        (cents) => cents >= minAmountCents,
        `O valor mínimo é ${(minAmountCents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}`,
      ),
    voiceId: z.string().optional(),
  });
}

export interface DonationFormValues {
  name: string;
  message: string;
  amount: number;
  voiceId: string | null;
}
