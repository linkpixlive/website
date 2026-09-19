import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/public/layout.tsx", [
    route(":username", "routes/public/$username.tsx"),
    route("doacao/:id", "routes/public/donation-confirmation.tsx"),
    layout("routes/public/auth/layout.tsx", [
      route("auth/login", "routes/public/auth/login.tsx"),
      route("auth/register", "routes/public/auth/register.tsx"),
      route("auth/forgot-password", "routes/public/auth/forgot-password.tsx"),
      route("auth/reset-password", "routes/public/auth/reset-password.tsx"),
      route("auth/verify-email", "routes/public/auth/verify-email.tsx"),
    ]),
  ]),
  layout("routes/private/layout.tsx", [
    index("routes/private/home.tsx"),
    route("carteira", "routes/private/wallet/index.tsx"),
    route("widgets", "routes/private/widgets/layout.tsx", [
      index("routes/private/widgets/index.tsx"),
      route("overlay", "routes/private/widgets/overlay.tsx"),
      route("regras", "routes/private/widgets/regras.tsx"),
    ]),
    route("doacoes", "routes/private/donations.tsx"),
    route("fila", "routes/private/queue.tsx"),
    route("perfil", "routes/private/profile.tsx"),
    route("conta", "routes/private/conta.tsx"),
    route("configuracoes", "routes/private/configuracoes/layout.tsx", [
      index("routes/private/configuracoes/index.tsx"),
      route("conta", "routes/private/configuracoes/conta.tsx"),
      route("doacoes", "routes/private/configuracoes/doacoes.tsx"),
    ]),
  ]),
  route("fila/popout", "routes/private/queue-popout.tsx"),
  route("overlay", "routes/public/overlay.tsx"),
] satisfies RouteConfig;
