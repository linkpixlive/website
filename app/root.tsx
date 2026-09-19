import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import { ThemeProvider } from "~/components/ui/ThemeProvider";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [];

/**
 * Aplica o tema salvo antes da primeira pintura (o ThemeProvider assume isto
 * — ver comentário em ThemeProvider.tsx) para evitar flash de tema claro.
 */
const themePrePaintScript = `(function(){try{var d=localStorage.getItem("linkpix:theme")==="dark";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <Outlet />
    </ThemeProvider>
  );
}
