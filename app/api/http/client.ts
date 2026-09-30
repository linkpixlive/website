import axios, { type AxiosInstance } from "axios";
import type { ApiErrorResponse, ApiSuccessResponse } from "./types";

const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!configuredApiUrl && import.meta.env.PROD) {
  throw new Error("VITE_API_URL ausente no build de produção.");
}

export const apiUrl = configuredApiUrl || "http://localhost:3000";

if (import.meta.env.PROD && apiUrl.startsWith("http://")) {
  throw new Error("VITE_API_URL deve ser https em produção.");
}

// Singleton por token: um axios.create por identidade, não por chamada.
const clients = new Map<string, AxiosInstance>();

export function createApiClient(token?: string | null) {
  const key = token ?? "";
  const cached = clients.get(key);
  if (cached) return cached;

  const apiClient = axios.create({
    baseURL: apiUrl,
    timeout: 15000,
  });

  apiClient.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  clients.set(key, apiClient);
  return apiClient;
}

export const client = createApiClient();

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

function isErrorEnvelope(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { success?: unknown }).success === false
  );
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

      return {
        success: false,
        error: {
          message:
            e.message ||
            "Nossos sistemas estão com problemas. Tente novamente mais tarde.",
          code: e.response?.status ?? 500,
        },
        timestamp: new Date().toISOString(),
        path: e.config?.url || "",
      };
    }

    return {
      success: false,
      error: {
        message:
          e instanceof Error
            ? e.message
            : "Nossos sistemas estão com problemas. Tente novamente mais tarde.",
        code: 500,
      },
      timestamp: new Date().toISOString(),
      path: "",
    };
  }
}
