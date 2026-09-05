import type { components } from "../generated/api-schema";
import { client, fetchApi } from "../http/client";

export type RegisterPayload = components["schemas"]["RegisterAuthDto"];
export type LoginPayload = components["schemas"]["LoginAuthDto"];
export type ForgotPasswordPayload = components["schemas"]["ForgotPasswordDto"];
export type ResetPasswordPayload = components["schemas"]["ResetPasswordDto"];
export type VerifyOtpPayload = components["schemas"]["VerifyOtpDto"];

export type LoginResult = string | { requires2fa: true; nonce: string };

export interface Login2faPayload {
  email: string;
  password: string;
  totp: string;
  nonce: string;
}

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
