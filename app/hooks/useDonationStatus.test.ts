import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDonationStatus } from "./useDonationStatus";
import { getDonationView } from "~/api/modules/public-donations";
import type { DonationView } from "~/types/donation";

vi.mock("~/api/modules/public-donations", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("~/api/modules/public-donations")>();
  return { ...actual, getDonationView: vi.fn() };
});

const view = (overrides: Partial<DonationView>): DonationView => ({
  id: "don-1",
  status: "pending",
  amount: 100,
  donorName: "Henrique",
  message: null,
  streamerName: "Streama",
  streamerUsername: "streama",
  voiceName: null,
  createdAt: 0,
  expiredAt: Date.now() + 60_000,
  ...overrides,
});

const INTERVAL = 10;

beforeEach(() => {
  vi.mocked(getDonationView).mockReset();
});

describe("useDonationStatus", () => {
  it("para o polling quando a doação fica paga", async () => {
    vi.mocked(getDonationView).mockResolvedValue(view({ status: "paid" }));

    const { result } = renderHook(() =>
      useDonationStatus("don-1", { intervalMs: INTERVAL }),
    );

    await waitFor(() => expect(result.current.status).toBe("paid"));
    await new Promise((r) => setTimeout(r, INTERVAL * 3));

    expect(getDonationView).toHaveBeenCalledTimes(1);
  });

  it("continua o polling enquanto pendente", async () => {
    vi.mocked(getDonationView).mockResolvedValue(view({ status: "pending" }));

    renderHook(() => useDonationStatus("don-1", { intervalMs: INTERVAL }));

    await waitFor(() =>
      expect(
        vi.mocked(getDonationView).mock.calls.length,
      ).toBeGreaterThanOrEqual(3),
    );
  });

  it("marca connectionLost após 5 falhas consecutivas e segue tentando", async () => {
    vi.mocked(getDonationView).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() =>
      useDonationStatus("don-1", { intervalMs: INTERVAL }),
    );

    await waitFor(() => expect(result.current.connectionLost).toBe(true));
    expect(result.current.status).toBe("pending");
    expect(
      vi.mocked(getDonationView).mock.calls.length,
    ).toBeGreaterThanOrEqual(5);

    await new Promise((r) => setTimeout(r, INTERVAL * 3));
    expect(vi.mocked(getDonationView).mock.calls.length).toBeGreaterThanOrEqual(6);
  });

  it("reseta connectionLost no primeiro sucesso", async () => {
    for (let i = 0; i < 5; i++) {
      vi.mocked(getDonationView).mockRejectedValueOnce(new Error("boom"));
    }
    vi.mocked(getDonationView).mockResolvedValue(view({ status: "pending" }));

    // Intervalo longo o bastante para o waitFor observar o estado `true`
    // entre a 5ª falha e o primeiro sucesso.
    const { result } = renderHook(() =>
      useDonationStatus("don-1", { intervalMs: 150 }),
    );

    await waitFor(() => expect(result.current.connectionLost).toBe(true), {
      timeout: 3000,
    });
    await waitFor(() => expect(result.current.connectionLost).toBe(false));
    expect(result.current.status).toBe("pending");
  });
});
