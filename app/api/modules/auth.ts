import type { components } from "../generated/api-schema";
import { client, fetchApi } from "../http/client";

export type RegisterPayload = components["schemas"]["RegisterAuthDto"];
export type LoginPayload = components["schemas"]["LoginAuthDto"];
export type ForgotPasswordPayload = components["schemas"]["ForgotPasswordDto"];
export type ResetPasswordPayload = components["schemas"]["ResetPasswordDto"];
export type VerifyOtpPayload = components["schemas"]["VerifyOtpDto"];

// O `oneOf` do schema não gera `content` utilizável; a união espelha o
// runtime (JWT ou { requires2fa, nonce }) a partir dos dois ramos.
export type LoginResult =
  | string
  | components["schemas"]["Pending2faDto"];

export type Login2faPayload = components["schemas"]["Login2faDto"];

export const authApi = {
  register: (body: RegisterPayload) =>
    fetchApi(client.post("/auth/register", body)),
  login: (body: LoginPayload) =>
    fetchApi<LoginResult>(client.post("/auth/login", body)),
  login2fa: (body: Login2faPayload) =>
    fetchApi<string>(client.post("/auth/login-2fa", body)),
  verifyOtp: (body: VerifyOtpPayload) =>
    fetchApi<string>(client.post("/auth/verify-otp", body)),
  forgotPassword: (body: ForgotPasswordPayload) =>
    fetchApi<string>(client.post("/auth/forgot-password", body)),
  resetPassword: (body: ResetPasswordPayload) =>
    fetchApi<string>(client.post("/auth/reset-password", body)),
};
