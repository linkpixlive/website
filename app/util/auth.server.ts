import { redirect } from "react-router";
import axios from "axios";
import type { components } from "~/api/generated/api-schema";
import { api, authHeaders } from "~/api/http/client";
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
    const response = await api.get("/auth/me", {
      headers: authHeaders(token),
    });

    const user = (response.data?.data ?? response.data) as
      | components["schemas"]["SafeUser"]
      | undefined;

    if (!user?.id) {
      redirectToLogin(true);
    }

    return user;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      redirectToLogin(true);
    }
    throw redirect("/indisponivel");
  }
}
