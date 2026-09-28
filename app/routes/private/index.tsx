import { redirect } from "react-router";

/** `/` existe só por compatibilidade (bookmarks): o dashboard mora em `/dashboard`. */
export function loader() {
  throw redirect("/dashboard");
}
