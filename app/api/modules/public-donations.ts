import type { DonationPayment, DonationStatus, StreamerProfile, TtsVoice } from "~/types/donation";

const MOCK_STREAMERS: Record<string, StreamerProfile> = {
  tipply: {
    name: "Tipply",
    username: "tipply",
    profileImageUrl: null,
    overlayActive: true,
    minAudioAmount: 5,
    minTextAmount: 1,
    maxLength: 250,
  },
  mari_live: {
    name: "Mari Live",
    username: "mari_live",
    profileImageUrl: null,
    overlayActive: false,
    minAudioAmount: 10,
    minTextAmount: 2,
    maxLength: 200,
  },
};

export const MOCK_VOICES: TtsVoice[] = [
  { id: "voice-ana", name: "Ana", tag: "Feminina · Brasileira", sampleUrl: "/tts-samples/ana.wav" },
  {
    id: "voice-bruno",
    name: "Bruno",
    tag: "Masculina · Brasileira",
    sampleUrl: "/tts-samples/bruno.wav",
  },
  {
    id: "voice-carla",
    name: "Carla",
    tag: "Feminina · Neutra",
    sampleUrl: "/tts-samples/carla.wav",
  },
  {
    id: "voice-diego",
    name: "Diego",
    tag: "Masculina · Grave",
    sampleUrl: "/tts-samples/diego.wav",
  },
];

const DONATION_TTL_MS = 30 * 60 * 1000;
// Simula o webhook do gateway: a doação vira "paid" alguns segundos após a criação.
const MOCK_CONFIRM_DELAY_MS = 9000;
const MOCK_PIX_CODE =
  "00020126360014br.gov.bcb.pix0114tipply@pagamento.com520400005303986540610.005802BR5919TIPPYLIVE6009SAO PAULO62070503***6304ABCD";

export interface CreateDonationInput {
  name: string;
  message: string;
  amount: number;
  voiceId: string | null;
}

const donations = new Map<string, { confirmAt: number; expiredAt: number }>();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getStreamerByUsername(username: string): Promise<StreamerProfile | null> {
  await delay(200);
  return MOCK_STREAMERS[username.toLowerCase()] ?? null;
}

export async function createDonation(input: CreateDonationInput): Promise<DonationPayment> {
  await delay(600);
  const now = Date.now();
  const id = `don_${now.toString(36)}`;
  const expiredAt = now + DONATION_TTL_MS;
  donations.set(id, { confirmAt: now + MOCK_CONFIRM_DELAY_MS, expiredAt });
  return {
    id,
    amount: input.amount,
    pix: MOCK_PIX_CODE,
    createdAt: now,
    expiredAt,
  };
}

export async function getDonationStatus(id: string): Promise<DonationStatus> {
  await delay(150);
  const entry = donations.get(id);
  if (!entry) return "failed";
  if (Date.now() >= entry.expiredAt) return "expired";
  return Date.now() >= entry.confirmAt ? "paid" : "pending";
}

export async function listVoices(): Promise<TtsVoice[]> {
  return MOCK_VOICES;
}
