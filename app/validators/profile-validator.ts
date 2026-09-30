export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_COOLDOWN_DAYS = 15;

export const ACCEPTED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_ORIGINAL_AVATAR_BYTES = 10 * 1024 * 1024;
export const AVATAR_EXPORT_SIZE = 512;

export function validateAvatarFile(file: {
  type: string;
  size: number;
}): string | null {
  if (!(ACCEPTED_AVATAR_TYPES as readonly string[]).includes(file.type)) {
    return "Use uma imagem JPG, PNG ou WebP.";
  }
  if (file.size > MAX_ORIGINAL_AVATAR_BYTES) {
    return "A imagem deve ter no máximo 10 MB.";
  }
  return null;
}

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

export function diffPublicData(
  current: { name: string; username: string },
  next: { name: string; username: string },
): PublicDataDiff {
  return {
    updateName: next.name.trim() !== current.name,
    updateUsername: next.username.trim() !== current.username,
  };
}
