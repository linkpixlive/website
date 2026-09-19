import { redirect } from "react-router";

// Compat: a página de Conta agora vive em /configuracoes/conta.
export async function loader() {
  throw redirect("/configuracoes/conta");
}

export default function ContaRedirect() {
  return null;
}
