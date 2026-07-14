import { createApiClient, fetchApi } from "../http/client";

export interface CreatePixKeyPayload {
  key: string;
  alias?: string;
}

export interface PixKey {
  id: string;
  key?: string;
  keyMasked: string;
  keyType: string;
  alias?: string | null;
  createdAt: string;
}

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
