import type { components } from "../generated/api-schema";
import { api, authHeaders, fetchApi } from "../http/client";

export type RegisterPayload = components["schemas"]["RegisterAuthDto"];
export type RegisterInitPayload = components["schemas"]["RegisterInitDto"];
export type LoginPayload = components["schemas"]["LoginAuthDto"];
export type ForgotPasswordPayload = components["schemas"]["ForgotPasswordDto"];
export type ResetPasswordPayload = components["schemas"]["ResetPasswordDto"];
export type VerifyOtpPayload = components["schemas"]["VerifyOtpDto"];
export type LoginResult =
  | string
  | components["schemas"]["Pending2faDto"];
export type Login2faPayload = components["schemas"]["Login2faDto"];

/** Resposta do verify-otp: JWT (conta existente), conclusão pendente (e-mail novo) ou 2FA */
export type VerifyOtpResult =
  | string
  | components["schemas"]["RegistrationPendingDto"]
  | { requiresLogin: boolean };

type ValidateUsernameResult = { available: true };

export const authApi = {
  validateUsername: (username: string) =>
    fetchApi<ValidateUsernameResult>(
      api.post("/auth/validate-username", { username }),
    ),
  registerInit: (body: RegisterInitPayload) =>
    fetchApi<string>(api.post("/auth/register/init", body)),
  register: (body: RegisterPayload) =>
    fetchApi<string>(api.post("/auth/register", body)),
  login: (body: LoginPayload) =>
    fetchApi<LoginResult>(api.post("/auth/login", body)),
  login2fa: (body: Login2faPayload) =>
    fetchApi<string>(api.post("/auth/login-2fa", body)),
  verifyOtp: (body: VerifyOtpPayload) =>
    fetchApi<VerifyOtpResult>(api.post("/auth/verify-otp", body)),
  forgotPassword: (body: ForgotPasswordPayload) =>
    fetchApi<string>(api.post("/auth/forgot-password", body)),
  resetPassword: (body: ResetPasswordPayload) =>
    fetchApi<string>(api.post("/auth/reset-password", body)),
};
