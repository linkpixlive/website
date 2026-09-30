import type { IconName } from "~/components/ui/Icon";

export interface MenuItem {
  label: string;
  to: string;
  icon: IconName;
  end?: boolean;
}

export const menuItems: MenuItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: "widget-2", end: true },
  { label: "Carteira", to: "/carteira", icon: "wallet" },
  { label: "Integrações", to: "/widgets/overlay", icon: "link-minimalistic" },
  { label: "Doações", to: "/doacoes", icon: "list" },
  { label: "Perfil", to: "/perfil", icon: "user-circle" },
  {
    label: "Conta",
    to: "/conta",
    icon: "lock",
  },
];

export function getPublicPageUrl(username: string): string {
  return `/${username}`;
}

export const PUBLIC_PAGE_BASE = "linkpix.com.br/";
