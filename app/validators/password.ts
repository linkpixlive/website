import { z } from "zod";

export const strongPassword = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(36, "A senha deve ter no máximo 36 caracteres")
  .regex(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    "Senha muito fraca. Use maiúsculas, números e caracteres especiais.",
  );

export const confirmPasswordField = z.string().min(1, "Confirme a nova senha");

export function getPasswordStrength(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1; // Valid if contains at least one uppercase letter
  if (/[0-9]/.test(value)) score += 1; // Valid if contains at least one number
  if (/[^A-Za-z0-9]/.test(value)) score += 1; // Valid if contains at least one special character
  return score;
}

export function withPasswordConfirmation<T extends z.ZodRawShape>(
  shape: T,
  passwordKey: string,
  confirmKey = "confirmPassword",
) {
  return z.object(shape).refine(
    (data) => {
      const record = data as Record<string, unknown>;
      return record[passwordKey] === record[confirmKey];
    },
    { message: "As senhas não coincidem", path: [confirmKey] },
  );
}
