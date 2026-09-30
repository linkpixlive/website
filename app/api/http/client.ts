import axios from "axios";
import type { ApiErrorResponse, ApiSuccessResponse } from "./types";

const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!configuredApiUrl && import.meta.env.PROD) {
  throw new Error("VITE_API_URL ausente no build de produção.");
}

export const apiUrl = configuredApiUrl || "http://localhost:3000";

if (import.meta.env.PROD && apiUrl.startsWith("http://")) {
  throw new Error("VITE_API_URL deve ser https em produção.");
}

export const DEFAULT_ERROR_MESSAGE =
  "Nossos sistemas estão com problemas. Tente novamente mais tarde.";

/** Single shared instance (SSR-safe): auth travels per request via `authHeaders`, never on defaults. */
export const api = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
});

/** Per-request auth header. Empty without token to keep call sites uniform. */
export function authHeaders(token?: string | null): {
  Authorization?: string;
} {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

function isErrorEnvelope(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { success?: unknown }).success === false
  );
}

function fallbackError(
  e: unknown,
  code?: number,
  path?: string,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message:
        e instanceof Error && e.message ? e.message : DEFAULT_ERROR_MESSAGE,
      code: code ?? 500,
    },
    timestamp: new Date().toISOString(),
    path: path ?? "",
  };
}

export async function fetchApi<T>(
  request: Promise<{ data: unknown }>,
): Promise<ApiResponse<T>> {
  try {
    const { data } = await request;
    return data as ApiSuccessResponse<T>;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const responseData: unknown = e.response?.data;

      if (isErrorEnvelope(responseData)) {
        return responseData;
      }

      return fallbackError(e, e.response?.status, e.config?.url);
    }

    return fallbackError(e);
  }
}
