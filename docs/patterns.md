# Padrões — loader, action, forms, realtime

> Verificado contra o código em 2026-09-30.

## Loader

SSR: lê cookie via `getAuthToken`, chama `api/modules/*`, `throw redirect` em erro. Público sem auth (`$username.tsx`); privado com `requireValidAuth` (`dashboard.tsx`, `wallet.tsx` paginado). Falha de loader vira UI de erro (`ErrorState`/`AlertMessage`), nunca `EmptyState` de "vazio".

## Action + intent

`formData.get("intent")` → `intentHandlers: Record<string, handler>` (ex. `profile.tsx`: `savePublicData|uploadPhoto|removePhoto`). Validar com `validators/*` (`safeParse`, mensagens pt-BR) **antes** de chamar `api/*`; retornar `{ success, action, error }` para `useFetcherFeedback`/`useActionError`. Um canal de feedback por action.

## Forms

Dois padrões, nada além: `RHF + zodResolver → action` (mutação com redirect) e `fetcher.Form` (edição inline). Proibido `fetch` direto de componente (client-only é burlável — hoje em `register/forgot/reset`).

## Realtime

`useQueueSocket` + `useDonationHistorySocket` (mesmo namespace `/dashboard` — unificar num singleton); `useOverlayAlerts` é o modelo (lazy, `document.hidden` desconecta, heartbeat 25s, cleanup total); `useDonationStatus` é polling 8s (pausar em `hidden`).

## Loading/erro

`navigation.state`/`fetcher.state` para loading; `toast` para sucesso transitório, `AlertMessage` inline para erro de form. `connectionLost` deve ser exibido, não ignorado.
