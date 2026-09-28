import type { IconName } from "~/components/ui/Icon";

export interface MenuItem {
  label: string;
  to: string;
  icon: IconName;
  end?: boolean;
}

/** Itens internos, fonte única para rail desktop e drawer mobile. */
export const menuItems: MenuItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: "widget-2", end: true },
  { label: "Carteira", to: "/carteira", icon: "wallet" },
  { label: "Integrações", to: "/widgets", icon: "link-minimalistic" },
  { label: "Doações", to: "/doacoes", icon: "list" },
  { label: "Perfil", to: "/perfil", icon: "user-circle" },
  {
    label: "Conta",
    to: "/configuracoes",
    icon: "lock",
  },
];

/** URL da página pública do streamer, na mesma origem. */
export function getPublicPageUrl(username: string): string {
  return `/${username}`;
}

/**
 * Domínio canônico exibido nos textos de URL pública (prefixo do campo de
 * username, cartão Minha página). Os links seguem mesma-origem.
 */
export const PUBLIC_PAGE_BASE = "linkpix.com.br/";
