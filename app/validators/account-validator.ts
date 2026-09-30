import { z } from "zod";
import {
  confirmPasswordField,
  strongPassword,
  withPasswordConfirmation,
} from "./password";

export const totpField = z
  .string()
  .length(6, "O código tem 6 dígitos")
  .optional();

export const changePasswordSchema = withPasswordConfirmation(
  {
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: strongPassword,
    confirmPassword: confirmPasswordField,
    totp: totpField,
  },
  "newPassword",
);

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const changeEmailSchema = z.object({
  email: z
    .email("Informe um e-mail válido")
    .min(1, "Informe o novo e-mail")
    .max(100, "O e-mail deve ter no máximo 100 caracteres"),
  password: z.string().min(1, "Confirme com sua senha"),
  totp: totpField,
});

export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

export const deactivateAccountSchema = z.object({
  password: z.string().min(1, "Confirme com sua senha"),
});

export type DeactivateAccountValues = z.infer<typeof deactivateAccountSchema>;

export const setup2faSchema = z.object({
  password: z.string().min(1, "Confirme com sua senha"),
});

export type Setup2faValues = z.infer<typeof setup2faSchema>;

export const confirmEmailChangeSchema = z.object({
  otp: z.string().length(6, "O código tem 6 dígitos"),
});

export type ConfirmEmailChangeValues = z.infer<typeof confirmEmailChangeSchema>;
