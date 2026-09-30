import { z } from "zod";

export const donationSettingsSchema = z.object({
  minTextAmount: z.coerce
    .number({
      error:
        "Informe um valor mínimo válido para mensagem de texto (R$ 1,00 ou mais).",
    })
    .min(
      1,
      "Informe um valor mínimo válido para mensagem de texto (R$ 1,00 ou mais).",
    ),
  minAudioAmount: z.coerce
    .number({
      error: "Informe um valor mínimo válido para áudio (R$ 1,00 ou mais).",
    })
    .min(1, "Informe um valor mínimo válido para áudio (R$ 1,00 ou mais)."),
  maxLength: z.coerce
    .number({
      error: "Informe um tamanho máximo de mensagem válido (entre 0 e 250).",
    })
    .int("Informe um tamanho máximo de mensagem válido (entre 0 e 250).")
    .min(0, "Informe um tamanho máximo de mensagem válido (entre 0 e 250).")
    .max(250, "Informe um tamanho máximo de mensagem válido (entre 0 e 250)."),
  aiModeration: z.boolean(),
  filterProfanity: z.boolean(),
  filterSpam: z.boolean(),
  filterHateSpeech: z.boolean(),
  customRules: z
    .string()
    .max(1000, "As regras customizadas devem ter no máximo 1000 caracteres."),
});

export type DonationSettingsFormValues = z.infer<typeof donationSettingsSchema>;
