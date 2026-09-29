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
import { toWithdrawalStatus, withdrawalsApi, DEFAULT_PAGE_LIMIT } from "~/api/modules/withdrawals";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { Pagination } from "~/components/ui/Pagination";
import { useToast } from "~/components/ui/useToast";
import { BalanceCard } from "~/components/wallet/BalanceCard";
import { PixKeysCard } from "~/components/wallet/PixKeysCard";
import { PixKeysModal } from "~/components/wallet/PixKeysModal";
import { StreamerPrivacyNotice } from "~/components/wallet/StreamerPrivacyNotice";
import { WithdrawalFilters } from "~/components/wallet/WithdrawalFilters";
import { WithdrawalHistoryTable } from "~/components/wallet/WithdrawalHistoryTable";
import { WithdrawalModal } from "~/components/wallet/WithdrawalModal";
import { clearAuthCookie, getAuthToken } from "~/util/session.server";
import { useFetcherFeedback } from "~/hooks/useFetcherFeedback";
import { usePageParam } from "~/hooks/usePageParam";
import { getPageParam } from "~/util/search-params";
import { CARD_CLASS, SECTION_HEADING_CLASS } from "~/components/ui/classes";
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  const url = new URL(request.url);

  // Search parameters for filters and pagination
  const page = getPageParam(url);
  const limit = getPageParam(url, "limit", DEFAULT_PAGE_LIMIT);

  const walletPage = await walletsApi.getWalletPage(token, {
    page,
    limit,
    status: toWithdrawalStatus(url.searchParams.get("status")),
    startDate: url.searchParams.get("startDate") || undefined,
    endDate: url.searchParams.get("endDate") || undefined,
  });

  // `has2fa` decide se o saque pede só a senha ou senha + TOTP no formulário.
  const account = await accountSettingsApi.getSettings(token);

  return {
    ...walletPage,
    page,
    totalPages: walletPage.withdrawals.meta.totalPages,
    has2fa: account.success ? account.data.has2fa : false,
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
  const amount = Number(formData.get("amount"));
  const pixId = formData.get("pixId") as string;
  const password = String(formData.get("password") ?? "");
  const totp = formData.get("totp") ? String(formData.get("totp")) : undefined;
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");

  if (!idempotencyKey) {
    return {
      success: false,
      action: "createWithdrawal",
      error: "Falha interna: chave de idempotência ausente.",
    };
  }

  const res = await withdrawalsApi.create(
    token,
    { amount, pixId, password, totp },
    idempotencyKey,
  );

  if (!res.success) {
    return {
      success: false,
      action: "createWithdrawal",
      error: res.error.message,
    };
  }

  return { success: true, action: "createWithdrawal" };
}

async function createPixKeyAction(
  token: string | null,
  formData: FormData,
): Promise<WalletActionResult> {
  const key = formData.get("key") as string;
  const alias = (formData.get("alias") as string) || undefined;

  const res = await pixKeysApi.create(token, { key, alias });

  if (!res.success) {
    return {
      success: false,
      action: "createPixKey",
      error: res.error.message,
    };
  }

  return { success: true, action: "createPixKey" };
}

async function deletePixKeyAction(
  token: string | null,
  formData: FormData,
): Promise<WalletActionResult> {
  const id = formData.get("id") as string;

  const res = await pixKeysApi.delete(token, id);

  if (!res.success) {
    return {
      success: false,
      action: "deletePixKey",
      error: res.error.message,
    };
  }

  return { success: true, action: "deletePixKey" };
}

export async function action({ request }: Route.ActionArgs) {
  const token = getAuthToken(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "logout") {
    throw redirect("/auth/login", {
      headers: { "Set-Cookie": clearAuthCookie() },
    });
  }

  if (intent === "createWithdrawal") {
    return createWithdrawalAction(token, formData);
  }

  if (intent === "createPixKey") {
    return createPixKeyAction(token, formData);
  }

  if (intent === "deletePixKey") {
    return deletePixKeyAction(token, formData);
  }

  return null;
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

  // Handle action results (toast feedbacks & modal closing)
  useFetcherFeedback<WalletActionResult>({
    data: actionData,
    state: navigation.state,
    onResult: (result) => {
      if (result.success) {
        if (result.action === "createWithdrawal") {
          toast("Saque solicitado com sucesso!", "success");
          setModal(null);
          setWithdrawalError(null);
        }
      } else if (result.error && result.action === "createWithdrawal") {
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

      <StreamerPrivacyNotice />

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
          <PixKeysCard
            pixKeys={pixKeys}
            onManage={() => setModal("pixKeys")}
          />
        </aside>
      </div>

      {/* History card */}
      <section className={`mt-5 ${CARD_CLASS}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={SECTION_HEADING_CLASS}>
            Histórico de saques
          </h2>
          {withdrawals.meta.total > 0 && (
            <span className="text-[11px] font-semibold text-ink-label">
              {withdrawals.meta.total}{" "}
              {withdrawals.meta.total === 1 ? "registro" : "registros"}
            </span>
          )}
        </div>

        <WithdrawalFilters />

        <div className="mt-5">
          <WithdrawalHistoryTable items={withdrawals.items} loading={loadingData} />
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
