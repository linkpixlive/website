import { createApiClient, fetchApi } from "../http/client";

export const overlayApi = {
  togglePause: (token: string | null) =>
    fetchApi<void>(createApiClient(token).post("/overlay/toggle-pause")),

  skipAlert: (token: string | null) =>
    fetchApi<void>(createApiClient(token).post("/overlay/skip")),

  clearQueue: (token: string | null) =>
    fetchApi<void>(createApiClient(token).delete("/overlay/queue")),

  replayDonation: (token: string | null, donationId: string) =>
    fetchApi<void>(createApiClient(token).post(`/overlay/replay/${donationId}`)),

  removeFromQueue: (token: string | null, donationId: string) =>
    fetchApi<void>(
      createApiClient(token).delete(`/overlay/queue/${donationId}`)
    ),

  testAlert: (token: string | null) =>
    fetchApi<void>(createApiClient(token).post("/overlay/test")),
};
