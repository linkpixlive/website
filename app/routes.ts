import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/public/layout.tsx", [
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
    route("widgets", "routes/private/widgets.tsx"),
    route("fila", "routes/private/queue.tsx"),
    route("perfil", "routes/private/profile.tsx"),
    route("conta", "routes/private/account.tsx"),
  ]),
  route("fila/popout", "routes/private/queue-popout.tsx"),
] satisfies RouteConfig;
