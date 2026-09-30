import {
  apiUrl,
  api,
  authHeaders,
  DEFAULT_ERROR_MESSAGE,
  errorEnvelope,
  fetchApi,
  type ApiResponse,
} from "../http/client";

export interface UsernameResponse {
  username: string;
}

export interface ProfilePhotoResponse {
  profileImageUrl: string | null;
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
      return errorEnvelope(
        "Resposta inesperada do servidor. Tente novamente.",
        response.status,
        "/profile/photo",
      );
    } catch (e: unknown) {
      return errorEnvelope(
        e instanceof Error && e.message
          ? e.message
          : DEFAULT_ERROR_MESSAGE,
        500,
        "/profile/photo",
      );
    }
  },
};
