import { useState } from "react";
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
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
import { HistorySectionShell } from "~/components/ui/HistorySectionShell";
import { Pagination } from "~/components/ui/Pagination";
import { useToast } from "~/contexts/useToast";
import { BalanceCard } from "~/components/wallet/BalanceCard";
import { PixKeysCard } from "~/components/wallet/PixKeysCard";
import { PixKeysModal } from "~/components/wallet/PixKeysModal";
import { WithdrawalFilters } from "~/components/wallet/WithdrawalFilters";
import { WithdrawalHistoryTable } from "~/components/wallet/WithdrawalHistoryTable";
import { WithdrawalModal } from "~/components/wallet/WithdrawalModal";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { usePageParam } from "~/hooks/usePageParam";
import { getPageParam } from "~/util/search-params";
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

export default function WalletPage() {
  const { balances, pixKeys, withdrawals, page, totalPages, has2fa } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { handlePageChange } = usePageParam();
  const navigation = useNavigation();
  const { toast } = useToast();

  const [modal, setModal] = useState<"withdraw" | "pixKeys" | null>(null);

  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  const loadingData = navigation.state === "loading";

  useFetcherFeedback<WalletActionResult>({
    data: actionData,
    state: navigation.state,
    onResult: (result) => {
      if (result.action !== "createWithdrawal") return;
      if (result.success) {
        toast("Saque solicitado com sucesso!", "success");
        setModal(null);
        setWithdrawalError(null);
      } else if (result.error) {
        setWithdrawalError(result.error);
      }
    },
  });

  const openWithdrawal = () => {
    setWithdrawalError(null);
    setModal("withdraw");
  };

  return (
    <div>
      {/* Title block */}
      <PageHeader
        title="Carteira"
        subtitle="Acompanhe seu saldo disponível e o histórico de saques."
      />

      {/* Primary + secondary columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8">
          <BalanceCard
            balances={balances}
            loading={loadingData}
            onWithdraw={openWithdrawal}
          />
        </div>
        <aside className="lg:col-span-5 xl:col-span-4">
          <PixKeysCard pixKeys={pixKeys} onManage={() => setModal("pixKeys")} />
        </aside>
      </div>

      {/* History card */}
      <HistorySectionShell
        title="Histórico de saques"
        total={withdrawals.meta.total}
        className="mt-5"
      >
        <WithdrawalFilters />

        <div className="mt-5">
          <WithdrawalHistoryTable
            items={withdrawals.items}
            loading={loadingData}
          />
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </HistorySectionShell>

      {/* Modals */}
      <WithdrawalModal
        isOpen={modal === "withdraw"}
        onClose={() => setModal(null)}
        pixKeys={pixKeys}
        onOpenManageKeys={() => setModal("pixKeys")}
        error={withdrawalError}
        has2fa={has2fa}
      />

      <PixKeysModal
        isOpen={modal === "pixKeys"}
        onClose={() => setModal(null)}
        pixKeys={pixKeys}
      />
    </div>
  );
}
