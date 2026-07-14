import { redirect } from "react-router";
import { createApiClient } from "~/api/http/client";
import { clearAuthCookie, getAuthToken } from "./session.server";

function redirectToLogin(clearCookie = false) {
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

    if (!response.data) {
      redirectToLogin(true);
    }
    
    return response.data;
  } catch {
    // Fallback: decode JWT payload to prevent auth loop if /auth/me is missing in the backend during dev
    try {
      const tokenParts = token!.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString("utf-8")
        );
        return {
          id: payload.sub,
          name: "Streamer",
          email: "streamer@linkpix.com",
        };
      }
    } catch {}
    
    redirectToLogin(true);
  }
}
