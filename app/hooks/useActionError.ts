import { useEffect, useState } from "react";

/** Sincroniza `{ error }` de `useActionData` com estado local de `AlertMessage`.
 *  Padrão A: `RHF + zod -> action`. Retorna `[error, clearError]`. */
export function useActionError(actionData: { error?: string } | undefined | null) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actionData && "error" in actionData && typeof actionData.error === "string") {
      setError(actionData.error);
    }
  }, [actionData]);

  return [error, () => setError(null)] as const;
}
