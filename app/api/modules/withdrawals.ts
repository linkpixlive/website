import type { components, operations } from "../generated/api-schema";
import { api, authHeaders, fetchApi } from "../http/client";
import type { PaginatedResponse } from "../http/types";

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

export function toWithdrawalStatus(
  raw: string | null | undefined,
): WithdrawalFilters["status"] {
  return raw != null &&
    (WITHDRAWAL_STATUSES as readonly string[]).includes(raw)
    ? (raw as NonNullable<WithdrawalFilters["status"]>)
    : undefined;
}

export type Withdrawal = components["schemas"]["WithdrawalEntity"];

export const DEFAULT_PAGE_LIMIT = 10;

export const withdrawalsApi = {
  create: (
    token: string | null | undefined,
    body: CreateWithdrawalPayload,
    idempotencyKey: string,
  ) =>
    fetchApi<Withdrawal>(
      api.post("/withdrawals", body, {
        headers: { ...authHeaders(token), "Idempotency-Key": idempotencyKey },
      }),
    ),
  list: (token: string | null | undefined, query?: WithdrawalFilters) =>
    fetchApi<PaginatedResponse<Withdrawal>>(
      api.get("/withdrawals", { params: query, headers: authHeaders(token) })
    ),
};
