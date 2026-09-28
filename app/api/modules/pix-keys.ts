import type { components } from "../generated/api-schema";
import { createApiClient, fetchApi } from "../http/client";

export type CreatePixKeyPayload = components["schemas"]["CreatePixKeyDto"];

export type PixKey = components["schemas"]["PixKeyEntity"];

export const pixKeysApi = {
  list: (token?: string | null) =>
    fetchApi<PixKey[]>(createApiClient(token).get("/pix-keys")),
  listMasked: (token?: string | null) =>
    fetchApi<PixKey[]>(createApiClient(token).get("/pix-keys/masked")),
  create: (token: string | null | undefined, body: CreatePixKeyPayload) =>
    fetchApi<PixKey>(createApiClient(token).post("/pix-keys", body)),
  delete: (token: string | null | undefined, id: string) =>
    fetchApi<PixKey>(createApiClient(token).delete(`/pix-keys/${id}`)),
};
