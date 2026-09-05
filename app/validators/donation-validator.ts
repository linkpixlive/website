import { z } from "zod";
import { parseCurrencyToCents } from "~/util/currency";

export function createDonationSchema(maxMessageLength: number, minAmountCents: number) {
  return z.object({
    name: z.string().min(1, "Seu nome é obrigatório"),
    message: z.string().max(maxMessageLength, `A mensagem deve ter no máximo ${maxMessageLength} caracteres`),
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
