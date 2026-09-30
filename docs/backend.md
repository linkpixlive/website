# Backend — integração e tipagens

> Verificado contra o código em 2026-09-30.

## Camada HTTP

`api/http/client.ts`: singleton axios (`VITE_API_URL`, https em prod, timeout 15s) → `fetchApi` (nunca lança, retorna envelope `{ success, data | error }`) → `dataOrThrow`. Auth por request via `authHeaders(token)`, nunca em defaults.

## Modules (`api/modules/*`)

Um arquivo por domínio; única porta de entrada do server. Contém chamadas + mappers wire↔front. Canônico: `public-donations.ts` (`getStreamerByUsername`, `createDonation` + `buildDonationBody`, `DonationRequestError` com `code`).

- **Dinheiro**: backend em reais, front em centavos. Conversão só nos mappers (`reaisToCents`).
- **Um dono por endpoint** (hoje `POST /overlay/test` duplicado em `overlay.ts`/`widgets.ts` — unificar, não repetir).

## Tipagens

- Backend: `api/generated/api-schema.d.ts` via `pnpm update:apischema`. Usar `components["schemas"]["..."]` e `operations["..."]["parameters"]["query"]` para queries paginadas.
- Front: só `types/donation.ts` (`expired` derivado em `resolveStatus`) e `types/queue.ts` (socket, sem contraparte). Marcar com `// Client-only:` + porquê.
- Envelope: `ApiResponse<T>` com `unknown` + narrowing; sem `any` em callbacks.

## Auth

Cookie `auth_token` 7d `HttpOnly; SameSite=Strict; Path=/` (`util/session.server.ts`). `requireValidAuth` (`util/auth.server.ts`) valida via `GET /auth/me`: 401 → `/auth/login` (limpa cookie), resto → `/indisponivel`.
