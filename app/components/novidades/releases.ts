import { useCallback, useEffect, useState } from "react";

export type ReleaseItemKind = "feature" | "improvement" | "fix";

export interface ReleaseItem {
  kind: ReleaseItemKind;
  text: string;
}

export interface Release {
  /** Stable id, newest first. Also used as the "seen" cursor in storage. */
  id: string;
  version: string;
  date: string;
  title: string;
  items: ReleaseItem[];
}

/**
 * Mock seed — replace with `GET /changelog` once the backend exposes it.
 * Keep newest first; `id` must stay stable (it is the read cursor).
 */
export const RELEASES: Release[] = [
  {
    id: "2026-09-v240",
    version: "2.4.0",
    date: "10 de set. de 2026",
    title: "Menu da conta e Minha página",
    items: [
      { kind: "feature", text: "Abra sua página pública direto do rodapé ou do menu do perfil." },
      { kind: "feature", text: "Notificações de saques e segurança no menu da conta." },
      { kind: "improvement", text: "Troque o tema pelo menu, sem sair do lugar (Aparência)." },
    ],
  },
  {
    id: "2026-08-v230",
    version: "2.3.0",
    date: "28 de ago. de 2026",
    title: "Carteira com histórico de saques",
    items: [
      { kind: "feature", text: "Histórico de saques com status e chave de destino mascarada." },
      { kind: "improvement", text: "Telefone das chaves Pix sem DDI: só DDD + número." },
      { kind: "fix", text: "Salvar chave Pix não duplica mais o aviso de sucesso." },
    ],
  },
  {
    id: "2026-08-v220",
    version: "2.2.0",
    date: "14 de ago. de 2026",
    title: "Configurações reorganizadas",
    items: [
      { kind: "feature", text: "Página de configurações com seções Conta e Doações." },
      { kind: "improvement", text: "Zona de risco isolada para desativar a conta." },
      { kind: "fix", text: "Item Minha página oculto para quem ainda não tem username." },
    ],
  },
];

const LAST_SEEN_KEY = "linkpix:last-seen-release";

function readLastSeen(): string | null {
  try {
    return window.localStorage.getItem(LAST_SEEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Client-only read cursor over RELEASES. `unseenCount` starts at 0 until
 * hydration to avoid flashing the "new" dot on first paint.
 */
export function useNovidades() {
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLastSeenId(readLastSeen());
    setHydrated(true);
  }, []);

  const markAllSeen = useCallback(() => {
    const latestId = RELEASES[0]?.id;
    if (!latestId) return;
    try {
      window.localStorage.setItem(LAST_SEEN_KEY, latestId);
    } catch {
      // Storage indisponível: marca só em memória.
    }
    setLastSeenId(latestId);
  }, []);

  const seenIndex = lastSeenId
    ? RELEASES.findIndex((release) => release.id === lastSeenId)
    : -1;
  const unseenCount =
    !hydrated || RELEASES.length === 0
      ? 0
      : seenIndex === -1
        ? RELEASES.length
        : seenIndex;

  return {
    releases: RELEASES,
    unseenCount,
    hasUnseen: unseenCount > 0,
    markAllSeen,
  };
}
