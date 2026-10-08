import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import { Button } from "./Button";
import { StatusPage } from "./StatusPage";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Não foi possível carregar",
  message = "Verifique sua conexão e tente novamente.",
  onRetry,
  retryLabel = "Tentar novamente",
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-1 py-6">
      <p className="text-sm font-bold text-ink-heading">{title}</p>
      <p className="text-sm leading-relaxed text-ink-secondary">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-3"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export function RouteErrorState() {
  const error = useRouteError();
  const navigate = useNavigate();
  const reload = () => window.location.reload();

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return (
        <StatusPage
          tone="reconnect"
          eyebrow="Sessão expirada"
          title="Sua sessão terminou"
          body="Por segurança, desconectamos após um tempo sem atividade. Entre de novo para continuar de onde parou."
          primaryLabel="Entrar novamente"
          onPrimary={() => navigate("/auth/login")}
          reassurance="Sua conta e seus dados continuam como você deixou."
        />
      );
    }
    if (error.status === 404) {
      return (
        <StatusPage
          tone="neutral"
          eyebrow="Não encontrado"
          title="Essa página não existe"
          body="O conteúdo pode ter sido removido ou o endereço está incompleto. Volte e tente outro caminho."
          primaryLabel="Voltar"
          onPrimary={() => navigate(-1)}
          secondaryLabel="Ir para o início"
          onSecondary={() => navigate("/")}
        />
      );
    }
    const message =
      typeof error.data === "string" && error.data
        ? error.data
        : "Nossos sistemas estão com problemas. Tente novamente em instantes.";
    return (
      <StatusPage
        tone="failure"
        eyebrow="Algo deu errado"
        title="Não conseguimos carregar esta página"
        body={message}
        primaryLabel="Tentar novamente"
        onPrimary={reload}
        reassurance="Seus dados e seu saldo continuam intactos."
      />
    );
  }

  return (
    <StatusPage
      tone="failure"
      eyebrow="Algo deu errado"
      title="Não conseguimos carregar esta página"
      body="Verifique sua conexão e tente novamente."
      primaryLabel="Tentar novamente"
      onPrimary={reload}
      reassurance="Seus dados e seu saldo continuam intactos."
    />
  );
}
