import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    username: z
      .string()
      .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Nome de usuário pode conter apenas letras, números e underscores"),
    email: z.email("E-mail inválido"),
    cpf: z
      .string()
      .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter um número")
      .regex(/[^A-Za-z0-9]/, "Senha deve conter um caractere especial"),
    confirmPassword: z.string().min(1, "Por favor, confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter um número")
      .regex(/[^A-Za-z0-9]/, "Senha deve conter um caractere especial"),
    confirmPassword: z.string().min(1, "Por favor, confirme sua senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  otp: z.string().length(6, "Código de verificação deve ter exatamente 6 dígitos"),
  email: z.email("E-mail inválido"),
});

export function getPasswordStrength(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}
