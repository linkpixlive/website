import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useBlocker } from "react-router";
import { ConfirmButtons } from "./ConfirmButtons";
import { Modal } from "./Modal";

interface UnsavedChangesContextValue {
  setDirty: (dirty: boolean) => void;
}

const UnsavedChangesContext =
  createContext<UnsavedChangesContextValue | null>(null);

export function useUnsavedChanges(dirty: boolean) {
  const context = useContext(UnsavedChangesContext);

  useEffect(() => {
    if (!context) return;
    context.setDirty(dirty);
    return () => context.setDirty(false);
  }, [context, dirty]);

  if (!context) {
    throw new Error("useUnsavedChanges must be used inside UnsavedChangesProvider");
  }
}

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dirty, setDirtyState] = useState(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const setDirty = useCallback((nextDirty: boolean) => {
    setDirtyState(nextDirty);
  }, []);

  const value = useMemo(() => ({ setDirty }), [setDirty]);

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <Modal
        isOpen={blocker.state === "blocked"}
        onClose={() => blocker.reset?.()}
        title="Alterações não salvas"
        size="sm"
      >
        <p className="mb-5 text-sm leading-relaxed text-ink-secondary">
          Você possui alterações não salvas. Deseja sair sem salvar?
        </p>
        <ConfirmButtons
          confirmLabel="Sair sem salvar"
          cancelLabel="Continuar editando"
          onConfirm={() => blocker.proceed?.()}
          onCancel={() => blocker.reset?.()}
        />
      </Modal>
    </UnsavedChangesContext.Provider>
  );
}
