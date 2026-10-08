import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import { ThemeProvider, themePrePaintScript } from "~/contexts/ThemeProvider";
import { UnsavedChangesProvider } from "~/components/ui/UnsavedChangesProvider";
import { RouteErrorState } from "~/components/ui/ErrorState";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icon-dark.svg" />
        <script dangerouslySetInnerHTML={{ __html: themePrePaintScript }} />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UnsavedChangesProvider>
        <Outlet />
      </UnsavedChangesProvider>
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas">
      <RouteErrorState />
    </main>
  );
}
