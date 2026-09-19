import { client, fetchApi } from "../http/client";
import type {
  DonationPayment,
  DonationStatus,
  DonationView,
  StreamerProfile,
  TtsVoice,
} from "~/types/donation";

const DEFAULT_ERROR_MESSAGE =
  "Nossos sistemas estão com problemas. Tente novamente mais tarde.";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  gradium: "Gradium",
};

export function providerTag(provider: string | null | undefined): string {
  if (!provider) return "";
  return PROVIDER_LABELS[provider.toLowerCase()] ?? provider;
}

/** amount chega em reais (Decimal serializado como número) e sai em centavos. */
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

interface DonationViewApiResponse {
  id: string;
  status: DonationStatus;
  amount: number;
  donorName: string;
  message: string | null;
  streamerName: string;
  /** Backends antigos podem omitir; a confirmação resolve o destino com fallback. */
  streamerUsername?: string;
  voiceName: string | null;
  createdAt: string;
  expiredAt: string | null;
}

export function mapDonationView(data: DonationViewApiResponse): DonationView {
  return {
    id: data.id,
    status: data.status,
    amount: reaisToCents(data.amount),
    donorName: data.donorName,
    message: data.message,
    streamerName: data.streamerName,
    streamerUsername: data.streamerUsername ?? "",
    voiceName: data.voiceName,
    createdAt: Date.parse(data.createdAt),
    expiredAt: data.expiredAt ? Date.parse(data.expiredAt) : 0,
  };
}

/** O backend nunca marca expirado: quem decide é o expiredAt do Pix. */
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

interface StreamerProfileApiResponse {
  name: string;
  username: string;
  /** Campo novo no backend; respostas antigas podem omitir. */
  verified?: boolean;
  profileImageUrl: string | null;
  overlayActive: boolean;
  minAudioAmount: number;
  minTextAmount: number;
  maxLength: number;
}

export function mapStreamerProfile(data: StreamerProfileApiResponse): StreamerProfile {
  return {
    name: data.name,
    username: data.username,
    verified: data.verified ?? false,
    profileImageUrl: data.profileImageUrl,
    overlayActive: data.overlayActive,
    minAudioAmount: data.minAudioAmount,
    minTextAmount: data.minTextAmount,
    maxLength: data.maxLength,
  };
}

export async function getStreamerByUsername(
  username: string,
): Promise<StreamerProfile | null> {
  const res = await fetchApi<StreamerProfileApiResponse>(
    client.get(`/user/${encodeURIComponent(username)}`),
  );
  return res.success ? mapStreamerProfile(res.data) : null;
}

interface PublicVoiceApiResponse {
  id: string;
  name: string;
  provider?: string | null;
  sampleUrl: string | null;
  /** Foto do personagem retornada pelo GET /voices. */
  photoUrl?: string | null;
}

export async function listVoices(): Promise<TtsVoice[]> {
  const res = await fetchApi<PublicVoiceApiResponse[]>(client.get("/voices"));
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
  name: string;
  message: string;
  /** Valor em centavos. */
  amount: number;
  voiceId: string | null;
}

/** `voiceId` fica de fora do corpo quando nulo (doação "Voz padrão do streamer"). */
export function buildDonationBody(input: CreateDonationInput, username: string) {
  return {
    name: input.name,
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
    client.post("/donation", buildDonationBody(input, username)),
  );
  if (!res.success) {
    throw new Error(res.error?.message || DEFAULT_ERROR_MESSAGE);
  }
  return mapDonationPayment(res.data);
}

/** `null` = doação não encontrada (404); outras falhas lançam. */
export async function getDonationView(id: string): Promise<DonationView | null> {
  const res = await fetchApi<DonationViewApiResponse>(client.get(`/donation/${id}`));
  if (!res.success) {
    if (res.error?.code === 404) return null;
    throw new Error(res.error?.message || DEFAULT_ERROR_MESSAGE);
  }
  return mapDonationView(res.data);
}
