# Arquitetura

> Verificado contra o código em 2026-09-30.

## Estrutura (`app/`)

| Pasta | Contém | Exemplo |
|---|---|---|
| `routes/` | páginas finas (loader/action + composição) | `private/dashboard.tsx` |
| `components/<domínio>/` | blocos da página | `components/wallet/` |
| `components/ui/` | compartilhados (único lugar genérico) | `Button.tsx`, `classes.ts` |
| `api/modules/` | um arquivo por domínio do backend | `public-donations.ts` |
| `hooks/` | estado client-only reutilizável | `useDonationStatus.ts` |
| `util/` + `validators/` | `*.server.ts` (cookie/auth) + schemas zod pt-BR | `auth.server.ts`, `donation-validator.ts` |

Alias `~/*` → `app/*`. SSR ligado (`react-router.config.ts`).

## Rotas

Definidas em `app/routes.ts` (não por filesystem). `public/layout.tsx` = só tema; `private/layout.tsx` = `requireValidAuth` + shell (`bg-shell` + `bg-canvas p-4 sm:p-6 lg:p-7`) + `ErrorBoundary`. `/fila/popout` e `/overlay` (OBS) vivem fora do shell.

## Nova página

1. Entrada em `routes.ts` → 2. `loader` (+ `action` se muta, ver `patterns.md`) → 3. componente fino em `routes/` compondo `components/<domínio>/` → 4. `meta()` em pt-BR. Canônico: `private/dashboard.tsx` (loader + `buildChecklist`).

## Novo componente

Domínio em `components/<domínio>/`; genérico em `ui/`. Sem CSS modules; `cn()`; primitivos via Base-UI; formulários via RHF + zod.

## Convenções

- Arquivos `kebab-case.tsx`; dinâmicos com `$` (`$username.tsx`); um `layout.tsx` por segmento.
- **Comentários**: só `porquê`/armadilha/divergência de contrato (ex. `types/queue.ts:1`). Marcador de seção (`{/* Title block */}`) ou `o quê` óbvio, apague.
- Verificação: `pnpm typecheck` + `pnpm build`.
