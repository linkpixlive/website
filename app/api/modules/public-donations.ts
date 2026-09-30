import type {
  DonationPayment,
  DonationStatus,
  DonationView,
  StreamerProfile,
  TtsVoice,
} from "~/types/donation";
import type { components } from "../generated/api-schema";
import { api, DEFAULT_ERROR_MESSAGE, fetchApi } from "../http/client";

export class DonationRequestError extends Error {
  code: unknown;
  constructor(message: string, code?: unknown) {
    super(message);
    this.name = "DonationRequestError";
    this.code = code;
  }
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  gradium: "Gradium",
};

export function providerTag(provider: string | null | undefined): string {
  if (!provider) return "";
  return PROVIDER_LABELS[provider.toLowerCase()] ?? provider;
}

export function reaisToCents(amount: number): number {
  return Math.round(amount * 100);
}

interface DonationApiResponse {
  id: string;
  amount: number;
  status: string;
  pix: string | null;
  createdAt: string;
  expiredAt: string | null;
}

export function mapDonationPayment(data: DonationApiResponse): DonationPayment {
  return {
    id: data.id,
    amount: reaisToCents(data.amount),
    pix: data.pix ?? "",
    createdAt: Date.parse(data.createdAt),
    expiredAt: data.expiredAt ? Date.parse(data.expiredAt) : 0,
  };
}

type DonationViewApiResponse = components["schemas"]["DonationStatusEntity"];

export function mapDonationView(data: DonationViewApiResponse): DonationView {
  return {
    id: data.id,
    status: data.status,
    amount: reaisToCents(data.amount),
    donorName: data.donorName,
    message: data.message,
    streamerName: data.streamerName,
    streamerUsername: data.streamerUsername,
    voiceName: data.voiceName,
    createdAt: Date.parse(data.createdAt),
    expiredAt: data.expiredAt ? Date.parse(data.expiredAt) : 0,
  };
}

export function resolveStatus(view: DonationView): DonationStatus {
  if (
    view.status === "pending" &&
    view.expiredAt > 0 &&
    Date.now() > view.expiredAt
  ) {
    return "expired";
  }
  return view.status;
}

type StreamerProfileApiResponse = components["schemas"]["PublicUserEntity"];

export function mapStreamerProfile(
  data: StreamerProfileApiResponse,
): StreamerProfile {
  return {
    name: data.name,
    username: data.username,
    verified: data.verified,
    profileImageUrl: data.profileImageUrl,
    overlayActive: data.overlayActive,
    minAudioAmount: data.minAudioAmount,
    minTextAmount: data.minTextAmount,
    maxLength: Math.min(data.maxLength, 250),
  };
}

export async function getStreamerByUsername(
  username: string,
): Promise<StreamerProfile | null> {
  const res = await fetchApi<StreamerProfileApiResponse>(
    api.get(`/donations/user/${encodeURIComponent(username)}`),
  );
  return res.success ? mapStreamerProfile(res.data) : null;
}

type PublicVoiceApiResponse = components["schemas"]["PublicVoiceEntity"] & {
  provider?: string | null;
  photoUrl?: string | null;
};

export async function listVoices(): Promise<TtsVoice[]> {
  const res = await fetchApi<PublicVoiceApiResponse[]>(api.get("/voices"));
  if (!res.success) return [];
  return res.data.map((voice) => ({
    id: voice.id,
    name: voice.name,
    tag: providerTag(voice.provider),
    sampleUrl: voice.sampleUrl ?? null,
    imageUrl: voice.photoUrl ?? null,
  }));
}

export interface CreateDonationInput {
  name?: string;
  message: string;
  amount: number;
  voiceId: string | null;
}

export function buildDonationBody(
  input: CreateDonationInput,
  username: string,
) {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new DonationRequestError("Valor da doação inválido.");
  }
  if (input.message.length > 250 || (input.name?.length ?? 0) > 100) {
    throw new DonationRequestError("Dados da doação inválidos.");
  }
  const name = input.name?.trim();

  return {
    ...(name ? { name } : {}),
    message: input.message,
    amount: input.amount / 100,
    username,
    ...(input.voiceId ? { voiceId: input.voiceId } : {}),
  };
}

export async function createDonation(
  input: CreateDonationInput,
  username: string,
): Promise<DonationPayment> {
  const res = await fetchApi<DonationApiResponse>(
    api.post("/donations/donation", buildDonationBody(input, username)),
  );
  if (!res.success) {
    throw new DonationRequestError(
      res.error?.message || DEFAULT_ERROR_MESSAGE,
      res.error?.code,
    );
  }
  return mapDonationPayment(res.data);
}

export async function getDonationView(
  id: string,
): Promise<DonationView | null> {
  const res = await fetchApi<DonationViewApiResponse>(
    api.get(`/donations/donation/${id}`),
  );
  if (!res.success) {
    if (res.error?.code === 404) return null;
    throw new Error(res.error?.message || DEFAULT_ERROR_MESSAGE);
  }
  return mapDonationView(res.data);
}
