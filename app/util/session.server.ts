export function createAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  const isProduction = process.env.NODE_ENV === "production";

  const parts = [
    `auth_token=${token}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${maxAge}`,
  ];

  if (isProduction) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function clearAuthCookie(): string {
  return "auth_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0";
}

export function getAuthToken(request: Request): string | null {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return null;
  const match = cookie.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}
