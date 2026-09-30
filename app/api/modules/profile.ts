import {
  apiUrl,
  api,
  authHeaders,
  fetchApi,
  type ApiResponse,
} from "../http/client";
import type { ApiErrorResponse } from "../http/types";

export interface UsernameResponse {
  username: string;
}

export interface ProfilePhotoResponse {
  profileImageUrl: string | null;
}

function unexpectedPhotoResponse(status: number): ApiErrorResponse {
  return {
    success: false,
    error: {
      message: "Resposta inesperada do servidor. Tente novamente.",
      code: status,
    },
    timestamp: new Date().toISOString(),
    path: "/profile/photo",
  };
}

export const profileApi = {
  changeUsername: (token: string | null, newUsername: string) =>
    fetchApi<UsernameResponse>(
      api.patch("/profile/username", { newUsername }, { headers: authHeaders(token) }),
    ),
  removePhoto: (token: string | null) =>
    fetchApi<ProfilePhotoResponse>(
      api.delete("/profile/photo", { headers: authHeaders(token) }),
    ),
  uploadPhoto: async (
    token: string | null,
    file: Blob,
  ): Promise<ApiResponse<ProfilePhotoResponse>> => {
    const formData = new FormData();
    formData.append("file", file, "avatar.webp");

    try {
      const response = await fetch(`${apiUrl}/profile/photo`, {
        method: "PUT",
        headers: { ...authHeaders(token) },
        body: formData,
      });
      const json: unknown = await response.json();
      if (
        typeof json === "object" &&
        json !== null &&
        typeof (json as { success?: unknown }).success === "boolean"
      )
        return json as ApiResponse<ProfilePhotoResponse>;
      return unexpectedPhotoResponse(response.status);
    } catch (e: unknown) {
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
        path: "/profile/photo",
      };
    }
  },
};
