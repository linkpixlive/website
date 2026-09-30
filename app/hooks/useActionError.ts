import { useEffect, useState } from "react";

/** Syncs server action error to local alert state. Returns error plus a clear handler. */
export function useActionError(actionData: { error?: string } | undefined | null) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actionData && "error" in actionData && typeof actionData.error === "string") {
      setError(actionData.error);
    }
  }, [actionData]);

  return [error, () => setError(null)] as const;
}
