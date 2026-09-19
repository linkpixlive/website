import { useEffect, useRef, useState } from "react";
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
import { Icon } from "~/components/ui/Icon";
import { Pagination } from "~/components/ui/Pagination";
import { useToast } from "~/components/ui/useToast";
import { BalanceCard } from "~/components/wallet/BalanceCard";
import { PixKeysCard } from "~/components/wallet/PixKeysCard";
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

const STREAMER_WARNING_KEY = "linkpix:hide-streamer-warning";

function StreamerPrivacyNotice() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STREAMER_WARNING_KEY) === "1") {
        setVisible(false);
      }
    } catch {
      // localStorage indisponível: mantém o aviso visível.
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STREAMER_WARNING_KEY, "1");
    } catch {
      // Ignora falha de persistência e só oculta na sessão atual.
    }
    setVisible(false);
  };

  return (
    <div
      role="note"
      className="mb-5 flex items-start gap-3 rounded-xl border border-info/20 bg-info/10 px-4 py-3 text-info animate-slide-down"
    >
      <Icon name="info-circle" size={16} strokeWidth={1.9} className="shrink-0 mt-0.5" />
      <p className="flex-1 text-[13px] font-medium">
        Vai mostrar essa tela em live? Oculte os valores com o ícone de olho —
        saldos e chaves Pix são informações sensíveis.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dispensar aviso"
        title="Dispensar aviso"
        className="rounded-full p-1 hover:bg-info/10 transition-colors duration-150 cursor-pointer outline-none shrink-0 active:scale-95"
      >
        <Icon name="close-circle" size={16} strokeWidth={1.9} />
      </button>
    </div>
  );
}

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
  const lastHandledAction = useRef<unknown>(null);

  const loadingData = navigation.state === "loading";

  // Handle action results (toast feedbacks & modal closing)
  useEffect(() => {
    if (!actionData || actionData === lastHandledAction.current) return;
    lastHandledAction.current = actionData;

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

  const openWithdrawal = () => {
    setWithdrawalError(null);
    setIsWithdrawalOpen(true);
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
            onManage={() => setIsPixKeysOpen(true)}
          />
        </aside>
      </div>

      {/* History card */}
      <section className="mt-5 rounded-[26px] bg-card border border-line shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-ink-label">
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
