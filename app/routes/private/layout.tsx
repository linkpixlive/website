import { useState } from "react";
import { Outlet, useLoaderData } from "react-router";
import { Sidebar } from "~/components/dashboard/Sidebar";
import { Topbar } from "~/components/dashboard/Topbar";
import { ToastProvider } from "~/components/ui/ToastProvider";
import { requireValidAuth } from "~/util/auth.server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireValidAuth(request);
  return { user };
}

export default function PrivateLayoutRoute() {
  const { user } = useLoaderData<typeof loader>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-text-primary flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-60">
          {/* Topbar for mobile and tablet */}
          <Topbar onOpenSidebar={() => setIsSidebarOpen(true)} user={user} />

          {/* Page contents container */}
          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
