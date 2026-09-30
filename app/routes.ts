import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/public/layout.tsx", [
    route(":username", "routes/public/$username.tsx"),
    route("doacao/:id", "routes/public/donation-confirmation.tsx"),
    route("indisponivel", "routes/public/indisponivel.tsx"),
    route("auth/login", "routes/public/auth/login.tsx"),
    route("auth/register", "routes/public/auth/register.tsx"),
    route("auth/forgot-password", "routes/public/auth/forgot-password.tsx"),
    route("auth/reset-password", "routes/public/auth/reset-password.tsx"),
    route("auth/verify-email", "routes/public/auth/verify-email.tsx"),
  ]),
  layout("routes/private/layout.tsx", [
    index("routes/private/index.tsx"),
    route("dashboard", "routes/private/dashboard.tsx"),
    route("carteira", "routes/private/wallet.tsx"),
    route("widgets", "routes/private/widgets/layout.tsx", [
      route("overlay", "routes/private/widgets/overlay.tsx"),
      route("regras", "routes/private/widgets/regras.tsx"),
    ]),
    route("doacoes", "routes/private/donations.tsx"),
    route("perfil", "routes/private/profile.tsx"),
    route("conta", "routes/private/conta.tsx"),
  ]),
  route("fila/popout", "routes/private/queue-popout.tsx"),
  route("overlay", "routes/public/overlay.tsx"),
] satisfies RouteConfig;
