import { z } from "zod";

export const overlaySchema = z.object({
  volume: z.number().min(0).max(100),
  speakNameAmount: z.boolean(),
  audioOnly: z.boolean(),
  defaultNarrator: z.string().min(1, "Selecione um narrador"),
});

export type OverlayFormValues = z.infer<typeof overlaySchema>;
