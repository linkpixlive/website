import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .max(36, "A senha deve ter no máximo 36 caracteres")
      .regex(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        "Senha muito fraca. Use maiúsculas, números e caracteres especiais.",
      ),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const changeEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o novo e-mail")
    .email("Informe um e-mail válido")
    .max(100, "O e-mail deve ter no máximo 100 caracteres"),
  password: z.string().min(1, "Confirme com sua senha"),
});

export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;
