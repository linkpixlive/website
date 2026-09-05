import { redirect } from "react-router";
import type { Route } from "./+types/queue";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Fila de Alertas — LinkPix" },
    { name: "description", content: "Gerencie a fila de doações em tempo real" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  throw redirect(`/doacoes${url.search}`);
}

export default function Queue() {
  return null;
}
