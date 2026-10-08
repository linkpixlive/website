import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "~/components/dashboard/Sidebar";
import { MobileHeader } from "~/components/dashboard/MobileHeader";
import { ToastProvider } from "~/contexts/ToastProvider";
import { RouteErrorState } from "~/components/ui/ErrorState";
import { requireValidAuth } from "~/util/auth.server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireValidAuth(request);
  return { user };
}

const RAIL_STORAGE_KEY = "linkpix:sidebar-collapsed";

function readStoredRailCollapsed(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(RAIL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persistRailCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(RAIL_STORAGE_KEY, collapsed ? "1" : "0");
  } catch {}
}

export default function PrivateLayoutRoute() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(readStoredRailCollapsed);
  return (
    <ToastProvider>
      <div className="min-h-dvh w-full overflow-x-clip bg-shell text-ink-heading lg:flex lg:h-dvh lg:overflow-hidden">
        {/* Desktop rail / Mobile drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          collapsed={railCollapsed}
          onToggleCollapse={() =>
            setRailCollapsed((v) => {
              const next = !v;
              persistRailCollapsed(next);
              return next;
            })
          }
        />

        {/* Main Content Area (o drawer empurra o conteúdo no mobile) */}
        <div
          className={`min-w-0 flex-1 transition-transform duration-300 ease-out ${
            isSidebarOpen ? "max-lg:translate-x-72" : ""
          }`}
        >
          <div className="bg-canvas p-4 pb-10 sm:p-6 lg:h-dvh lg:overflow-y-auto lg:rounded-l-[24px] lg:p-8">
            <MobileHeader onOpenMenu={() => setIsSidebarOpen(true)} />
            {/* Page contents container (light work surface) */}
            <main className="mx-auto w-full max-w-6xl">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <RouteErrorState />
    </div>
  );
}
