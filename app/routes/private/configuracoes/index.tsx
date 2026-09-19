import { redirect } from "react-router";

export async function loader() {
  throw redirect("/configuracoes/conta");
}

export default function ConfiguracoesIndex() {
  return null;
}
