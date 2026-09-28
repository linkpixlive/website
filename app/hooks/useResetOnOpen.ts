import { useEffect, useRef } from "react";

/** Roda `reset` na transição fechado→aberto (limpa estado entre aberturas).
 *  `reset` inline é seguro: só dispara na transição, sempre na versão atual. */
export function useResetOnOpen(isOpen: boolean, reset: () => void) {
  const resetRef = useRef(reset);
  resetRef.current = reset;
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) resetRef.current();
    wasOpen.current = isOpen;
  }, [isOpen]);
}
