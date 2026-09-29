import {
  apiUrl,
  createApiClient,
  fetchApi,
  type ApiResponse,
} from "../http/client";
import type { ApiErrorResponse } from "../http/types";

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
/** Carência entre trocas de username, em dias (regra do backend). */
export const USERNAME_COOLDOWN_DAYS = 15;

/** Tipos aceitos pelo `PUT /profile/photo` (validados no backend). */
export const ACCEPTED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * Teto do arquivo original escolhido pelo usuário. O export do crop sai em
 * 512px webp (dezenas de KB), bem abaixo do limite de 2 MB do servidor —
 * este teto existe só para não carregar arquivos absurdos na memória.
 */
export const MAX_ORIGINAL_AVATAR_BYTES = 10 * 1024 * 1024;

/** Lado do quadrado exportado pelo editor (espelha o backend). */
export const AVATAR_EXPORT_SIZE = 512;

// Manual: o schema não define body de resposta p/ username/photo (content?: never)
// — formato observado do envelope; multipart segue via fetch nativo abaixo.
export interface UsernameResponse {
  username: string;
}

export interface ProfilePhotoResponse {
  profileImageUrl: string | null;
}

/** `null` = arquivo válido; string = mensagem de erro exibível. */
export function validateAvatarFile(file: {
  type: string;
  size: number;
}): string | null {
  if (
    !(ACCEPTED_AVATAR_TYPES as readonly string[]).includes(file.type)
  ) {
    return "Use uma imagem JPG, PNG ou WebP.";
  }
  if (file.size > MAX_ORIGINAL_AVATAR_BYTES) {
    return "A imagem deve ter no máximo 10 MB.";
  }
  return null;
}

/** `null` = formato válido; string = mensagem de erro exibível. */
export function validateUsernameFormat(value: string): string | null {
  const username = value.trim();
  if (username.length < USERNAME_MIN_LENGTH) {
    return `O username deve ter no mínimo ${USERNAME_MIN_LENGTH} caracteres.`;
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return `O username deve ter no máximo ${USERNAME_MAX_LENGTH} caracteres.`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return "Use apenas letras, números e underline (_).";
  }
  return null;
}

export interface UsernameCooldown {
  locked: boolean;
  availableAt: Date | null;
  remainingDays: number;
}
/** Deriva o estado da carência de 15 dias a partir de `usernameChangedAt`. */
export function getUsernameCooldown(
  usernameChangedAt: string | null | undefined,
  now: Date = new Date(),
): UsernameCooldown {
  if (!usernameChangedAt) {
    return { locked: false, availableAt: null, remainingDays: 0 };
  }
  const availableAt = new Date(
    new Date(usernameChangedAt).getTime() +
      USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
  );
  if (Number.isNaN(availableAt.getTime()) || availableAt <= now) {
    return { locked: false, availableAt: null, remainingDays: 0 };
  }
  const remainingDays = Math.ceil(
    (availableAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );
  return { locked: true, availableAt, remainingDays };
}

export interface PublicDataDiff {
  updateName: boolean;
  updateUsername: boolean;
}

/** Descobre o que mudou para o Salvar único só chamar o que precisa. */
export function diffPublicData(
  current: { name: string; username: string },
  next: { name: string; username: string },
): PublicDataDiff {
  return {
    updateName: next.name.trim() !== current.name,
    updateUsername: next.username.trim() !== current.username,
  };
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
      createApiClient(token).patch("/profile/username", { newUsername }),
    ),
  removePhoto: (token: string | null) =>
    fetchApi<ProfilePhotoResponse>(createApiClient(token).delete("/profile/photo")),
  /**
   * Upload via `fetch` nativo com `FormData`: o endpoint multipart não está
   * no schema gerado e o axios JSON não serve aqui. Funciona no browser e na
   * action do servidor (Node 18+), que repassa o `File` recebido do formulário.
   */
  uploadPhoto: async (
    token: string | null,
    file: Blob,
  ): Promise<ApiResponse<ProfilePhotoResponse>> => {
    const formData = new FormData();
    formData.append("file", file, "avatar.webp");

    try {
      const response = await fetch(`${apiUrl}/profile/photo`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
