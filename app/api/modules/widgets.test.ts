import { beforeEach, describe, expect, it, vi } from "vitest";

const { createApiClientMock } = vi.hoisted(() => ({
  createApiClientMock: vi.fn(),
}));

vi.mock("~/api/http/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("~/api/http/client")>()),
  createApiClient: createApiClientMock,
}));

import { widgetsApi } from "./widgets";

const widget = {
  token: "token-123",
  type: "overlay",
  active: true,
  settings: {
    volume: 100,
    speakNameAmount: true,
    audioOnly: false,
    defaultNarrator: "Ricardo",
    isPaused: false,
  },
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function axiosError(status: number, message: string) {
  return {
    response: {
      status,
      data: { success: false, error: { message, code: status } },
    },
    message,
    config: { url: "" },
  };
}

describe("ensureSettings", () => {
  beforeEach(() => {
    createApiClientMock.mockReset();
  });

  it("retorna o widget existente sem criar quando o GET dá 200", async () => {
    const put = vi.fn();
    createApiClientMock.mockReturnValue({
      get: () => Promise.resolve({ data: { success: true, data: widget } }),
      put,
    });

    const res = await widgetsApi.ensureSettings("t", "overlay");

    expect(res.success).toBe(true);
    expect(put).not.toHaveBeenCalled();
  });

  it("cria via PUT sem body quando o GET dá 404", async () => {
    const put = vi.fn(() =>
      Promise.resolve({ data: { success: true, data: widget } }),
    );
    createApiClientMock.mockReturnValue({
      get: () => Promise.reject(axiosError(404, "não encontrado")),
      put,
    });

    const res = await widgetsApi.ensureSettings("t", "overlay");

    expect(res.success).toBe(true);
    expect(put).toHaveBeenCalledTimes(1);
    // Sem body: o backend aplica os defaults do tipo.
    expect(put).toHaveBeenCalledWith("/widgets/overlay", undefined);
  });

  it("propaga o erro sem criar quando o GET falha com outro status", async () => {
    const put = vi.fn();
    createApiClientMock.mockReturnValue({
      get: () => Promise.reject(axiosError(500, "erro interno")),
      put,
    });

    const res = await widgetsApi.ensureSettings("t", "overlay");

    expect(res.success).toBe(false);
    expect(put).not.toHaveBeenCalled();
  });
});
