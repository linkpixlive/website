import { Outlet } from "react-router";
import { Icon } from "~/components/ui/Icon";
import { RouteErrorState } from "~/components/ui/ErrorState";
import { useTheme } from "~/contexts/useTheme";
import { roundButtonClasses } from "~/components/ui/header-styles";

export default function PublicLayoutRoute() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex justify-end px-4 pt-4">
        <button
          type="button"
          aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          onClick={toggleTheme}
          className={roundButtonClasses}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={20} strokeWidth={1.9} />
        </button>
      </div>
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <RouteErrorState />
    </div>
  );
}
