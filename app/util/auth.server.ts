import { redirect } from "react-router";
import axios from "axios";
import type { components } from "~/api/generated/api-schema";
import { createApiClient } from "~/api/http/client";
import { clearAuthCookie, getAuthToken } from "./session.server";

function redirectToLogin(clearCookie = false): never {
  throw redirect("/auth/login", {
    headers: clearCookie ? { "Set-Cookie": clearAuthCookie() } : undefined,
  });
}

export async function requireValidAuth(request: Request) {
  const token = getAuthToken(request);

  if (!token) {
    redirectToLogin();
  }

  try {
    const client = createApiClient(token);
    const response = await client.get("/auth/me");

    // O backend envolve as respostas no envelope { success, data, ... }.
    const user = (response.data?.data ?? response.data) as
      | components["schemas"]["SafeUser"]
      | undefined;

    if (!user?.id) {
      redirectToLogin(true);
    }

    return user;
  } catch (e: unknown) {
    // 401 = sessão inválida → login + limpa cookie. 5xx/rede → indisponível
    // com cookie preservado (o retry decide o destino).
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      redirectToLogin(true);
    }
    throw redirect("/indisponivel");
  }
}
