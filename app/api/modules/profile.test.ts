import { describe, expect, it } from "vitest";
import {
  diffPublicData,
  getUsernameCooldown,
  USERNAME_COOLDOWN_DAYS,
  validateAvatarFile,
  validateUsernameFormat,
} from "./profile";

describe("validateUsernameFormat", () => {
  it("aceita usernames válidos", () => {
    expect(validateUsernameFormat("henrique_souza1")).toBeNull();
    expect(validateUsernameFormat("ABC")).toBeNull();
  });

  it("rejeita fora do tamanho 3–30", () => {
    expect(validateUsernameFormat("ab")).toContain("3 caracteres");
    expect(validateUsernameFormat("a".repeat(31))).toContain("30 caracteres");
  });

  it("rejeita caracteres fora de [a-zA-Z0-9_]", () => {
    expect(validateUsernameFormat("henrique-souza")).toContain("underline");
    expect(validateUsernameFormat("henrique souza")).toContain("underline");
    expect(validateUsernameFormat("@henrique")).toContain("underline");
  });

  it("ignora espaços nas bordas", () => {
    expect(validateUsernameFormat("  abc  ")).toBeNull();
  });
});

describe("diffPublicData", () => {
  it("detecta o que mudou, ignorando espaços nas bordas", () => {
    expect(
      diffPublicData(
        { name: "Ana", username: "ana" },
        { name: "  Ana  ", username: "ana" },
      ),
    ).toEqual({ updateName: false, updateUsername: false });
    expect(
      diffPublicData(
        { name: "Ana", username: "ana" },
        { name: "Ana Souza", username: "ana" },
      ),
    ).toEqual({ updateName: true, updateUsername: false });
    expect(
      diffPublicData(
        { name: "Ana", username: "ana" },
        { name: "Ana", username: "ana2" },
      ),
    ).toEqual({ updateName: false, updateUsername: true });
  });
});

describe("getUsernameCooldown", () => {
  const now = new Date("2026-09-10T12:00:00Z");

  it("libera quando nunca trocou", () => {
    expect(getUsernameCooldown(null, now)).toEqual({
      locked: false,
      availableAt: null,
      remainingDays: 0,
    });
    expect(getUsernameCooldown(undefined, now).locked).toBe(false);
  });

  it("trava dentro da carência de 15 dias", () => {
    const changedAt = new Date(
      now.getTime() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const cooldown = getUsernameCooldown(changedAt, now);
    expect(cooldown.locked).toBe(true);
    expect(cooldown.remainingDays).toBe(10);
    expect(cooldown.availableAt?.toISOString()).toBe(
      new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    );
  });

  it("libera após a carência", () => {
    const changedAt = new Date(
      now.getTime() - USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(getUsernameCooldown(changedAt, now).locked).toBe(false);
  });

  it("libera com data inválida", () => {
    expect(getUsernameCooldown("não-é-data", now).locked).toBe(false);
  });
});

describe("validateAvatarFile", () => {
  it("aceita JPG, PNG e WebP dentro do teto", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      expect(validateAvatarFile({ type, size: 1024 })).toBeNull();
    }
  });

  it("rejeita outros tipos", () => {
    expect(validateAvatarFile({ type: "image/gif", size: 1024 })).toContain(
      "JPG, PNG ou WebP",
    );
    expect(validateAvatarFile({ type: "video/mp4", size: 1024 })).toContain(
      "JPG, PNG ou WebP",
    );
  });

  it("rejeita arquivos acima de 10 MB", () => {
    expect(
      validateAvatarFile({ type: "image/png", size: 11 * 1024 * 1024 }),
    ).toContain("10 MB");
  });
});
