import type { components } from "../generated/api-schema";
import { api, authHeaders, fetchApi } from "../http/client";

export type CreatePixKeyPayload = components["schemas"]["CreatePixKeyDto"];

export type PixKey = components["schemas"]["PixKeyEntity"];

export const pixKeysApi = {
  list: (token?: string | null) =>
    fetchApi<PixKey[]>(api.get("/pix-keys", { headers: authHeaders(token) })),
  listMasked: (token?: string | null) =>
    fetchApi<PixKey[]>(
      api.get("/pix-keys/masked", { headers: authHeaders(token) }),
    ),
  create: (token: string | null | undefined, body: CreatePixKeyPayload) =>
    fetchApi<PixKey>(
      api.post("/pix-keys", body, { headers: authHeaders(token) }),
    ),
  delete: (token: string | null | undefined, id: string) =>
    fetchApi<PixKey>(
      api.delete(`/pix-keys/${id}`, { headers: authHeaders(token) }),
    ),
};
