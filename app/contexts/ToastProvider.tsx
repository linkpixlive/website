import { createContext, useCallback, useMemo, useRef, type ReactNode } from "react";
import { Toast } from "@base-ui/react/toast";
import { ToastList } from "~/components/ui/Toast";

export type ToastVariant = "success" | "error" | "info";

export interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

function ToastBridge({ children }: { children: ReactNode }) {
  const manager = Toast.useToastManager();
  const addRef = useRef(manager.add);
  addRef.current = manager.add;

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      addRef.current({
        title: message,
        type: variant,
        priority: variant === "error" ? "high" : "low",
      });
    },
    [],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider timeout={4000}>
      <ToastBridge>{children}</ToastBridge>
      <Toast.Portal>
        <Toast.Viewport className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 outline-none max-w-full">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
