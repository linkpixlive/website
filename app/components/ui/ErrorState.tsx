import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import { Button } from "./Button";
import { CARD_CLASS } from "./classes";
import { Icon } from "./Icon";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Card de erro único do app (mesmo visual em root, privado e público). */
export function ErrorState({
  title = "Não foi possível carregar",
  message = "Verifique sua conexão e tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
}: ErrorStateProps) {
  return (
    <div className={`${CARD_CLASS} text-center flex flex-col items-center gap-4`}>
      <span className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error">
        <Icon name="danger-circle" size={22} strokeWidth={2} />
      </span>
      <div>
        <h1 className="text-base font-bold text-ink-heading">{title}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{message}</p>
      </div>
      {onRetry && (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/** Lê o erro da rota e traduz para o ErrorState (401 → login, resto → retry). */
export function RouteErrorState() {
  const error = useRouteError();
  const navigate = useNavigate();
  const reload = () => window.location.reload();

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return (
        <ErrorState
          title="Sessão expirada"
          message="Entre novamente para continuar."
          onRetry={() => navigate("/auth/login")}
          retryLabel="Ir para o login"
        />
      );
    }
    if (error.status === 404) {
      return (
        <ErrorState
          title="Não encontrado"
          message="O conteúdo pode ter sido removido."
          onRetry={reload}
        />
      );
    }
    const message =
      typeof error.data === "string" && error.data
        ? error.data
        : "Nossos sistemas estão com problemas. Tente novamente mais tarde.";
    return <ErrorState message={message} onRetry={reload} />;
  }

  return <ErrorState onRetry={reload} />;
}
