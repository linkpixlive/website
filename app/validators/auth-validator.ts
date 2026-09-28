import { z } from "zod";
import {
  confirmPasswordField,
  strongPassword,
  withPasswordConfirmation,
} from "./password";

export const loginSchema = z.object({
  email: z.email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = withPasswordConfirmation(
  {
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    username: z
      .string()
      .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Nome de usuário pode conter apenas letras, números e underscores"),
    email: z.email("E-mail inválido"),
    cpf: z
      .string()
      .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos"),
    password: strongPassword,
    confirmPassword: confirmPasswordField,
  },
  "password",
);

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

export const resetPasswordSchema = withPasswordConfirmation(
  {
    newPassword: strongPassword,
    confirmPassword: confirmPasswordField,
  },
  "newPassword",
);

export const verifyEmailSchema = z.object({
  otp: z.string().length(6, "Código de verificação deve ter exatamente 6 dígitos"),
  email: z.email("E-mail inválido"),
});
