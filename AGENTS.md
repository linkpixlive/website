# LinkPix Web — Guia para agentes

Frontend da plataforma **LinkPix**: doações via Pix, overlay OBS, carteira e saques. React Router 8 SSR · Vite · Tailwind v4 · axios · RHF + zod · socket.io-client.

## Invariantes (valem para qualquer tarefa)

- **Rotas**: central em `app/routes.ts`; `private/layout.tsx` exige `requireValidAuth`. Nada de filesystem routing.
- **Server fala com backend**: `loader`/`action` só via `api/modules/*`; nunca `fetch` direto em rota/componente.
- **Auth**: cookie `auth_token` HttpOnly (`util/session.server.ts`); header por request via `authHeaders()`, nunca em defaults.
- **Dinheiro**: centavos no front, reais no wire — mappers em `api/modules/*` (`reaisToCents`).
- **Tipos**: `api/generated/api-schema.d.ts` (`pnpm update:apischema`); tipos client-only só em `types/` com prefixo `Client-only`.
- **Forms**: RHF + zod no cliente **e** `safeParse` no `action`; mutação via `intent` + `useFetcherFeedback`.
- **UI**: só tokens semânticos (`bg-card`, `text-ink-*`) + `ui/classes.ts`; ícones só via `ui/Icon`.
- **Comentários**: só `porquê`/armadilha/divergência de contrato. O que/seção, apague.
- **Verificação**: `pnpm typecheck` + `pnpm build` (`vitest run` se tocar hook/util).

## Documentação detalhada (leia o que for tocar)

| Doc | Leia quando |
|---|---|
| [docs/architecture.md](docs/architecture.md) | criar/alterar rota, layout, componente, hook |
| [docs/backend.md](docs/backend.md) | tocar em `api/`, schema, mapper, auth, cookie |
| [docs/patterns.md](docs/patterns.md) | loader/action/intent, form, socket, erro/loading |
| [docs/ui.md](docs/ui.md) | tocar em estilo, token, `Icon`, shell/canvas |
| [design.md](design.md) | fonte visual (não importar; `app.css @theme` é a tradução) |
| [docs/agents/artifacts.md](docs/agents/artifacts.md) | salvar plano, spec, ADR ou relatório |

## Artefatos de trabalho

Planos → `docs/plans/` · specs → `docs/specs/` · ADRs → `docs/adr/` · auditorias → `docs/audits/`. Nome: `YYYY-MM-DD-<slug>.md` (ADR: `NNNN-<slug>.md`). Detalhes em [docs/agents/artifacts.md](docs/agents/artifacts.md).
