import { Outlet } from "react-router";
import { requireValidAuth } from "~/util/auth.server";
import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  await requireValidAuth(request);
  return null;
}

export default function PrivateLayoutRoute() {
  return <Outlet />;
}
