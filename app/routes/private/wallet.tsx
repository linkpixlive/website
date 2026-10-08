import { useState } from "react";
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { accountSettingsApi } from "~/api/modules/account-settings";
import { pixKeysApi } from "~/api/modules/pix-keys";
import { walletsApi } from "~/api/modules/wallets";
import {
  DEFAULT_PAGE_LIMIT,
  toWithdrawalStatus,
  withdrawalsApi,
} from "~/api/modules/withdrawals";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { DatePicker } from "~/components/ui/DatePicker";
import { EyeToggleButton } from "~/components/ui/EyeToggleButton";
import { FilterShell } from "~/components/ui/FilterShell";
import { SelectField } from "~/components/ui/SelectField";
import { Pagination } from "~/components/ui/Pagination";
import { PixKeysModal } from "~/components/wallet/PixKeysModal";
import { WalletHero } from "~/components/wallet/WalletHero";
import { WithdrawalHistoryList } from "~/components/wallet/WithdrawalHistoryList";
import { WithdrawalModal } from "~/components/wallet/WithdrawalModal";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { usePageParam } from "~/hooks/usePageParam";
import { getPageParam, setParamOrDelete, updateParams } from "~/util/search-params";
import { clearAuthCookie, getAuthToken } from "~/util/session.server";
import {
  createWithdrawalSchema,
  MAX_WITHDRAWAL_AMOUNT,
  MIN_WITHDRAWAL_AMOUNT,
  pixKeySchema,
} from "~/validators/wallet-validator";
import type { Route } from "./+types/wallet";

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  const url = new URL(request.url);

  const page = getPageParam(url);
  const limit = getPageParam(url, "limit", DEFAULT_PAGE_LIMIT);

  const walletPage = await walletsApi.getWalletPage(token, {
    page,
    limit,
    status: toWithdrawalStatus(url.searchParams.get("status")),
    startDate: url.searchParams.get("startDate") || undefined,
    endDate: url.searchParams.get("endDate") || undefined,
  });

  const account = await accountSettingsApi.getSettings(token);

  if (!account.success) {
    throw new Response(account.error.message, { status: 502 });
  }

  return {
    ...walletPage,
    page,
    totalPages: walletPage.withdrawals.meta.totalPages,
    has2fa: account.data.has2fa,
  };
}

type WalletActionResult = {
  success: boolean;
  action: string;
  error?: string;
};

async function createWithdrawalAction(
  token: string | null,
  formData: FormData,
): Promise<WalletActionResult> {
  const parsed = createWithdrawalSchema(
    MIN_WITHDRAWAL_AMOUNT,
    MAX_WITHDRAWAL_AMOUNT,
  ).safeParse({
    amount: String(formData.get("amount") ?? ""),
    pixId: String(formData.get("pixId") ?? ""),
    password: String(formData.get("password") ?? ""),
    totp: formData.get("totp") ? String(formData.get("totp")) : undefined,
  });

  const intent = "createWithdrawal";

  if (!parsed.success) {
    return fail(intent, parsed.error.issues[0].message);
  }

  const { amount, pixId, password, totp } = parsed.data;
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");

  if (!idempotencyKey) {
    return fail(intent, "Falha interna: chave de idempotência ausente.");
  }

  const res = await withdrawalsApi.create(
    token,
    { amount, pixId, password, totp },
    idempotencyKey,
  );

  if (!res.success) {
    return fail(intent, res.error.message);
  }

  return ok(intent);
}

async function createPixKeyAction(
  token: string | null,
  formData: FormData,
): Promise<WalletActionResult> {
  const parsed = pixKeySchema.safeParse({
    key: String(formData.get("key") ?? ""),
    alias: formData.get("alias") ? String(formData.get("alias")) : undefined,
  });
  const intent = "createPixKey";

  if (!parsed.success) {
    return fail(intent, parsed.error.issues[0].message);
  }

  const res = await pixKeysApi.create(token, {
    key: parsed.data.key,
    alias: parsed.data.alias,
  });

  if (!res.success) {
    return fail(intent, res.error.message);
  }

  return ok(intent);
}

async function deletePixKeyAction(
  token: string | null,
  formData: FormData,
): Promise<WalletActionResult> {
  const id = String(formData.get("id") ?? "");
  const intent = "deletePixKey";
  if (!id) {
    return fail(intent, "Chave Pix inválida.");
  }

  const res = await pixKeysApi.delete(token, id);

  if (!res.success) {
    return fail(intent, res.error.message);
  }

  return ok(intent);
}

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const handler = intentHandlers[String(formData.get("intent") ?? "")];
  return handler ? handler(token, formData) : null;
}

type WalletIntentHandler = (
  token: string | null,
  formData: FormData,
) => Promise<WalletActionResult>;

const intentHandlers: Record<string, WalletIntentHandler> = {
  logout: async () => {
    throw redirect("/auth/login", {
      headers: { "Set-Cookie": clearAuthCookie() },
    });
  },

  createWithdrawal: (token, formData) =>
    createWithdrawalAction(token, formData),

  createPixKey: (token, formData) => createPixKeyAction(token, formData),

  deletePixKey: (token, formData) => deletePixKeyAction(token, formData),
};

function fail(action: string, error: string): WalletActionResult {
  return { success: false, action, error };
}

function ok(action: string): WalletActionResult {
  return { success: true, action };
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendente" },
  { value: "processing", label: "Processando" },
  { value: "success", label: "Concluído" },
  { value: "failed", label: "Falhou" },
];

export default function WalletPage() {
  const { balances, pixKeys, withdrawals, page, totalPages, has2fa } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { handlePageChange } = usePageParam();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [modal, setModal] = useState<"withdraw" | "pixKeys" | null>(null);

  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFullKeys, setShowFullKeys] = useState(false);

  const loadingData = navigation.state === "loading";

  useFetcherFeedback<WalletActionResult>({
    data: actionData,
    state: navigation.state,
    onResult: (result) => {
      if (result.action !== "createWithdrawal") return;
      if (result.success) {
        setWithdrawSuccess(true);
        setWithdrawalError(null);
      } else if (result.error) {
        setWithdrawalError(result.error);
      }
    },
  });

  const openWithdrawal = () => {
    setWithdrawalError(null);
    setWithdrawSuccess(false);
    setModal("withdraw");
  };

  const closeModals = () => {
    setModal(null);
    setWithdrawSuccess(false);
    setWithdrawalError(null);
  };

  const status = searchParams.get("status") || "all";
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : null;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : null;

  const handleStatusChange = (value: string) => {
    updateParams(searchParams, setSearchParams, (params) => {
      setParamOrDelete(params, "status", value, "all");
      params.delete("page");
    });
  };

  const handleDateChange = (key: "startDate" | "endDate") => (date: Date | null) => {
    updateParams(searchParams, setSearchParams, (params) => {
      if (date) {
        params.set(key, date.toISOString().split("T")[0]);
      } else {
        params.delete(key);
      }
      params.delete("page");
    });
  };

  const handleClearFilters = () => {
    updateParams(searchParams, setSearchParams, (params) => {
      params.delete("status");
      params.delete("startDate");
      params.delete("endDate");
      params.delete("page");
    });
  };

  const hasActiveFilters =
    status !== "all" ||
    searchParams.has("startDate") ||
    searchParams.has("endDate");

  return (
    <div>
      <PageHeader
        title="Carteira"
        subtitle="Seu saldo, seus saques e suas chaves Pix em um só lugar."
      />

      <div className="mt-2">
        <WalletHero
          balances={balances}
          loading={loadingData}
          onWithdraw={openWithdrawal}
          onManageKeys={() => setModal("pixKeys")}
        />
      </div>

        <section aria-label="Extrato de saques" className="mt-8 border-t border-line pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink-heading">
              Extrato de saques{" "}
              <span className="ml-1 rounded-full bg-wash px-2 py-0.5 text-[11px] font-extrabold text-ink-secondary">
                {withdrawals.meta.total}
              </span>
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-semibold text-ink-secondary">
                {showFullKeys ? "Ocultar chaves" : "Revelar chaves"}
              </span>
              <EyeToggleButton
                visible={showFullKeys}
                onToggle={() => setShowFullKeys((v) => !v)}
                iconSize={14}
                showLabel="Revelar chaves"
                hideLabel="Ocultar chaves"
              />
            </div>
          </div>
          <div className="mt-4">
            <FilterShell
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              isOpen={filtersOpen}
              onToggleOpen={() => setFiltersOpen((v) => !v)}
            >
              <div className="w-full sm:w-44">
                <SelectField
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={handleStatusChange}
                />
              </div>
              <div className="w-full sm:w-48">
                <DatePicker
                  label="Data de Início"
                  value={startDate}
                  onChange={handleDateChange("startDate")}
                />
              </div>
              <div className="w-full sm:w-48">
                <DatePicker
                  label="Data Final"
                  value={endDate}
                  onChange={handleDateChange("endDate")}
                />
              </div>
            </FilterShell>
          </div>
          <div className="mt-2">
            <WithdrawalHistoryList
              items={withdrawals.items}
              loading={loadingData}
              showFull={showFullKeys}
            />
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
      </section>

      {/* Modals */}
      <WithdrawalModal
        isOpen={modal === "withdraw"}
        onClose={closeModals}
        pixKeys={pixKeys}
        onOpenManageKeys={() => setModal("pixKeys")}
        error={withdrawalError}
        has2fa={has2fa}
        available={balances.available}
        success={withdrawSuccess}
      />

      <PixKeysModal
        isOpen={modal === "pixKeys"}
        onClose={closeModals}
        pixKeys={pixKeys}
      />
    </div>
  );
}
