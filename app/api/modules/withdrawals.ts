import type { components, operations } from "../generated/api-schema";
import { createApiClient, fetchApi } from "../http/client";

export type CreateWithdrawalPayload =
  components["schemas"]["CreateWithdrawalDto"];

export type WithdrawalFilters = NonNullable<
  operations["WithdrawalsController_findAll"]["parameters"]["query"]
>;

const WITHDRAWAL_STATUSES = [
  "pending",
  "processing",
  "success",
  "failed",
] as const satisfies Exclude<WithdrawalFilters["status"], undefined>[];

/** Coage o `status` cru da URL para o enum do contrato (inválido → undefined). */
export function toWithdrawalStatus(
  raw: string | null | undefined,
): WithdrawalFilters["status"] {
  return raw != null &&
    (WITHDRAWAL_STATUSES as readonly string[]).includes(raw)
    ? (raw as NonNullable<WithdrawalFilters["status"]>)
    : undefined;
}

export type Withdrawal = components["schemas"]["WithdrawalEntity"];

/** Default de paginação das listas (popout usa exceção própria documentada). */
export const DEFAULT_PAGE_LIMIT = 10;

// Manual: PaginationMetaDto no schema tem totalPages opcional; aqui é obrigatório
// (backend sempre envia e as telas indexam direto).
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export const withdrawalsApi = {
  /**
   * `idempotencyKey` é obrigatório no backend: sem ele a rota retorna 400 antes
   * de qualquer outra coisa. Repasse a mesma chave ao reenviar a MESMA tentativa
   * (ex.: timeout de rede) — a chave é atada ao payload, então mudar valor ou
   * chave Pix exige uma chave nova.
   */
  create: (
    token: string | null | undefined,
    body: CreateWithdrawalPayload,
    idempotencyKey: string,
  ) =>
    fetchApi<Withdrawal>(
      createApiClient(token).post("/withdrawals", body, {
        headers: { "Idempotency-Key": idempotencyKey },
      }),
    ),
  list: (token: string | null | undefined, query?: WithdrawalFilters) =>
    fetchApi<PaginatedResponse<Withdrawal>>(
      createApiClient(token).get("/withdrawals", { params: query })
    ),
};
