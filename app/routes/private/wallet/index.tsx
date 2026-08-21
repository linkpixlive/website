import { useEffect, useState } from "react";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { pixKeysApi, type PixKey } from "~/api/modules/pix-keys";
import { walletsApi } from "~/api/modules/wallets";
import { withdrawalsApi, type Withdrawal } from "~/api/modules/withdrawals";
import { PageHeader } from "~/components/dashboard/PageHeader";
import { Button } from "~/components/ui/Button";
import { Pagination } from "~/components/ui/Pagination";
import { useToast } from "~/components/ui/useToast";
import { BalanceCard } from "~/components/wallet/BalanceCard";
import { PixKeysModal } from "~/components/wallet/PixKeysModal";
import { WithdrawalFilters } from "~/components/wallet/WithdrawalFilters";
import { WithdrawalHistoryTable } from "~/components/wallet/WithdrawalHistoryTable";
import { WithdrawalModal } from "~/components/wallet/WithdrawalModal";
import { clearAuthCookie, getAuthToken } from "~/util/session.server";
import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const token = getAuthToken(request);
  const url = new URL(request.url);

  // Search parameters for filters and pagination
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "10");
  const status = url.searchParams.get("status") || undefined;
  const startDate = url.searchParams.get("startDate") || undefined;
  const endDate = url.searchParams.get("endDate") || undefined;

  let balances = { available: 0, pending: 0, blocked: 0 };
  let pixKeys: PixKey[] = [];
  let withdrawals: {
    items: Withdrawal[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  } = {
    items: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  };

  try {
    const [balRes, keysRes, withRes] = await Promise.all([
      walletsApi.getBalances(token),
      pixKeysApi.list(token),
      withdrawalsApi.list(token, { page, limit, status, startDate, endDate }),
    ]);

    if (balRes.success) balances = balRes.data;
    if (keysRes.success) pixKeys = keysRes.data;
    if (withRes.success) withdrawals = withRes.data;
  } catch (err) {
    console.error("Loader fetch error:", err);
  }

  return {
    balances,
    pixKeys,
    withdrawals,
    page,
    totalPages: withdrawals.meta.totalPages,
  };
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
    const amount = Number(formData.get("amount"));
    const pixId = formData.get("pixId") as string;

    const res = await withdrawalsApi.create(token, { amount, pixId });

    if (!res.success) {
      return {
        success: false,
        action: "createWithdrawal",
        error: res.error.message,
      };
    }

    return { success: true, action: "createWithdrawal" };
  }

  if (intent === "createPixKey") {
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

  if (intent === "deletePixKey") {
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

  return null;
}

import { redirect } from "react-router";

export default function WalletPage() {
  const { balances, pixKeys, withdrawals, page, totalPages } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const { toast } = useToast();

  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isPixKeysOpen, setIsPixKeysOpen] = useState(false);

  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  const loadingData = navigation.state === "loading";

  // Handle action results (toast feedbacks & modal closing)
  useEffect(() => {
    if (!actionData) return;

    if (actionData.success) {
      if (actionData.action === "createWithdrawal") {
        toast("Saque solicitado com sucesso!", "success");
        setIsWithdrawalOpen(false);
        setWithdrawalError(null);
      }
    } else if (actionData.error && actionData.action === "createWithdrawal") {
      setWithdrawalError(actionData.error);
    }
  }, [actionData, toast]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Carteira"
        subtitle="Gerencie seus saldos e solicite transferências"
        actions={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={() => setIsPixKeysOpen(true)}
              className="flex-1 sm:flex-initial"
            >
              Chaves Pix
            </Button>
            <Button
              onClick={() => {
                setWithdrawalError(null);
                setIsWithdrawalOpen(true);
              }}
              className="flex-1 sm:flex-initial"
            >
              Solicitar Saque
            </Button>
          </div>
        }
      />

      {/* Balances Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <BalanceCard
          label="Disponível para Saque"
          amount={balances.available}
          variant="available"
          loading={loadingData}
        />
        <BalanceCard
          label="Saldo Pendente"
          amount={balances.pending}
          variant="pending"
          loading={loadingData}
        />
        <BalanceCard
          label="Saldo Bloqueado"
          amount={balances.blocked}
          variant="blocked"
          loading={loadingData}
        />
      </div>

      {/* History section title */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text-heading">
          Histórico de Saques
        </h2>
      </div>

      {/* Filters Panel */}
      <WithdrawalFilters />

      {/* History Table / Cards */}
      <WithdrawalHistoryTable items={withdrawals.items} loading={loadingData} />

      {/* Paginations */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modals */}
      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        pixKeys={pixKeys}
        onOpenManageKeys={() => {
          setIsWithdrawalOpen(false);
          setIsPixKeysOpen(true);
        }}
        error={withdrawalError}
      />

      <PixKeysModal
        isOpen={isPixKeysOpen}
        onClose={() => setIsPixKeysOpen(false)}
        pixKeys={pixKeys}
      />
    </div>
  );
}
