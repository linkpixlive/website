import { redirect } from "react-router";

// Rota legada: regras de doação agora vivem em /widgets/regras (hub Integrações).
export async function loader() {
  throw redirect("/widgets/regras");
}

export default function ConfiguracoesDoacoesLegacy() {
  return null;
}
