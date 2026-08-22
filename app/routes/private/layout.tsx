import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "~/components/dashboard/Sidebar";
import { BottomNav } from "~/components/dashboard/BottomNav";
import { ToastProvider } from "~/components/ui/ToastProvider";
import { requireValidAuth } from "~/util/auth.server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireValidAuth(request);
  return { user };
}

export default function PrivateLayoutRoute() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-shell text-text-primary flex flex-col lg:flex-row">
        {/* Desktop rail / Mobile drawer */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64">
          {/* Page contents container (light work surface) */}
          <main className="flex-1 bg-canvas p-4 pb-20 sm:p-6 sm:pb-6 lg:p-7">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <BottomNav onOpenMenu={() => setIsSidebarOpen(true)} />
      </div>
    </ToastProvider>
  );
}
