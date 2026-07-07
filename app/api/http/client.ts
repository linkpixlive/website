import axios from "axios";
import type { ApiErrorResponse, ApiSuccessResponse } from "./types";

export const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function createApiClient(token?: string | null) {
  const apiClient = axios.create({
    baseURL: apiUrl,
  });

  apiClient.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return apiClient;
}

export const client = createApiClient();

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export async function fetchApi<T>(
  request: Promise<{ data?: any; error?: any }>,
): Promise<ApiResponse<T>> {
  try {
    const { data } = await request;
    return data as ApiSuccessResponse<T>;
  } catch (e: any) {
    const responseData = e.response?.data;

    if (responseData?.success === false) {
      return responseData as ApiErrorResponse;
    }

    return {
      success: false,
      error: {
        message:
          e.message ||
          "Nossos sistemas estão com problemas. Tente novamente mais tarde.",
        code: e.response?.status || 500,
      },
      timestamp: new Date().toISOString(),
      path: e.config?.url || "",
    };
  }
}
