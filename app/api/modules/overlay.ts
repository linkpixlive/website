import { api, authHeaders, fetchApi } from "../http/client";

export const overlayApi = {
  togglePause: (token: string | null) =>
    fetchApi<void>(
      api.post("/overlay/toggle-pause", undefined, {
        headers: authHeaders(token),
      }),
    ),

  skipAlert: (token: string | null) =>
    fetchApi<void>(
      api.post("/overlay/skip", undefined, { headers: authHeaders(token) }),
    ),

  clearQueue: (token: string | null) =>
    fetchApi<void>(
      api.delete("/overlay/queue", { headers: authHeaders(token) }),
    ),

  replayDonation: (token: string | null, donationId: string) =>
    fetchApi<void>(
      api.post(`/overlay/replay/${donationId}`, undefined, {
        headers: authHeaders(token),
      }),
    ),

  removeFromQueue: (token: string | null, donationId: string) =>
    fetchApi<void>(
      api.delete(`/overlay/queue/${donationId}`, {
        headers: authHeaders(token),
      }),
    ),

  testAlert: (token: string | null) =>
    fetchApi<void>(
      api.post("/overlay/test", undefined, { headers: authHeaders(token) }),
    ),
};
