import { redirect } from "react-router";

// Sem galeria: /widgets cai direto no primeiro widget (Overlay).
// Novos widgets entram como abas no widgets/layout.
export async function loader() {
  throw redirect("/widgets/overlay");
}

export default function WidgetsIndex() {
  return null;
}
