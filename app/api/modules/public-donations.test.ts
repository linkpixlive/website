import { describe, expect, it } from "vitest";
import {
  buildDonationBody,
  mapDonationPayment,
  mapDonationView,
  mapStreamerProfile,
  providerTag,
  reaisToCents,
  resolveStatus,
} from "./public-donations";

describe("providerTag", () => {
  it("traduz providers conhecidos e mantém os demais", () => {
    expect(providerTag("google")).toBe("Google");
    expect(providerTag("gradium")).toBe("Gradium");
    expect(providerTag("outro")).toBe("outro");
  });
});

describe("reaisToCents", () => {
  it("converte reais em centavos sem erro de ponto flutuante", () => {
    expect(reaisToCents(10)).toBe(1000);
    expect(reaisToCents(2.5)).toBe(250);
    expect(reaisToCents(10.55)).toBe(1055);
    expect(reaisToCents(0.1)).toBe(10);
  });
});

describe("buildDonationBody", () => {
  it("omite voiceId quando nulo (doação Voz padrão)", () => {
    const body = buildDonationBody(
      { name: "Henrique", message: "Boa!", amount: 200, voiceId: null },
      "streama",
    );
    expect(body).toEqual({
      name: "Henrique",
      message: "Boa!",
      amount: 2,
      username: "streama",
    });
    expect("voiceId" in body).toBe(false);
  });

  it("envia voiceId e amount em reais quando uma voz é escolhida", () => {
    const body = buildDonationBody(
      { name: "Henrique", message: "", amount: 500, voiceId: "voice-1" },
      "streama",
    );
    expect(body).toEqual({
      name: "Henrique",
      message: "",
      amount: 5,
      username: "streama",
      voiceId: "voice-1",
    });
  });
});

describe("mapDonationPayment", () => {
  it("normaliza amount para centavos e datas para epoch ms", () => {
    const payment = mapDonationPayment({
      id: "don-1",
      amount: 2,
      status: "pending",
      pix: "00020101",
      createdAt: "2026-09-05T12:00:00.000Z",
      expiredAt: "2026-09-05T12:30:00.000Z",
    });

    expect(payment).toEqual({
      id: "don-1",
      amount: 200,
      pix: "00020101",
      createdAt: Date.parse("2026-09-05T12:00:00.000Z"),
      expiredAt: Date.parse("2026-09-05T12:30:00.000Z"),
    });
  });
});

describe("mapDonationView", () => {
  it("normaliza os campos para a página de confirmação", () => {
    const view = mapDonationView({
      id: "don-1",
      status: "pending",
      amount: 7.3,
      donorName: "Henrique",
      message: "Boa live!",
      streamerName: "Streama",
      streamerUsername: "streama",
      voiceName: null,
      createdAt: "2026-09-05T12:00:00.000Z",
      expiredAt: null,
    });

    expect(view.amount).toBe(730);
    expect(view.createdAt).toBe(Date.parse("2026-09-05T12:00:00.000Z"));
    expect(view.expiredAt).toBe(0);
    expect(view.voiceName).toBeNull();
  });

  it("usa username vazio quando o backend omite streamerUsername", () => {
    const view = mapDonationView({
      id: "don-1",
      status: "paid",
      amount: 7.3,
      donorName: "Henrique",
      message: null,
      streamerName: "Streama",
      voiceName: null,
      createdAt: "2026-09-05T12:00:00.000Z",
      expiredAt: null,
    });

    expect(view.streamerUsername).toBe("");
  });
});

describe("resolveStatus", () => {
  it("mantém o status do backend", () => {
    expect(resolveStatus(view("paid"))).toBe("paid");
    expect(resolveStatus(view("failed"))).toBe("failed");
  });

  it("deriva expired quando pending passou do expiredAt", () => {
    const future = { ...view("pending"), expiredAt: Date.now() + 60_000 };
    const past = { ...view("pending"), expiredAt: Date.now() - 1000 };

    expect(resolveStatus(future)).toBe("pending");
    expect(resolveStatus(past)).toBe("expired");
  });

  it("trata expiredAt zerado como pendente (Pix sem expiração)", () => {
    expect(resolveStatus({ ...view("pending"), expiredAt: 0 })).toBe("pending");
  });
});

describe("mapStreamerProfile", () => {
  const base = {
    name: "Streama",
    username: "streama",
    profileImageUrl: null,
    overlayActive: true,
    minAudioAmount: 5,
    minTextAmount: 1,
    maxLength: 250,
  };

  it("propaga o selo de verificado do backend", () => {
    expect(mapStreamerProfile({ ...base, verified: true }).verified).toBe(true);
    expect(mapStreamerProfile({ ...base, verified: false }).verified).toBe(false);
  });

  it("assume não verificado quando o backend omite o campo", () => {
    expect(mapStreamerProfile({ ...base }).verified).toBe(false);
  });
});

function view(status: Parameters<typeof resolveStatus>[0]["status"]) {
  return {
    id: "don-1",
    status,
    amount: 100,
    donorName: "Henrique",
    message: null,
    streamerName: "Streama",
    streamerUsername: "streama",
    voiceName: null,
    createdAt: 0,
    expiredAt: 0,
  };
}
