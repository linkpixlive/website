# Spec — Account Settings Integration (Frontend `/conta` ⇄ `account-settings`)

**Date:** 2026-08-24
**Status:** Approved (grilled & confirmed with product owner)
**Triage:** `ready-for-agent`
**Project:** `linkpix-frontend` — Account Settings page wired to the existing `tipply-backend` account-settings module
**Tracker note:** Published locally per owner instruction (GitHub CLI unavailable at writing time). When posting to the tracker, apply the `ready-for-agent` label as-is.

---

## Problem Statement

Streamers opening the account settings page see a mock-up: a fake "active sessions" count, a two-factor badge stuck on "Ativa" regardless of reality, and buttons that do nothing. They cannot actually change their password or email, cannot turn TOTP two-factor on or off, and cannot deactivate their account. The page also promises permanent deletion ("Excluir conta"), which the product does not offer — the real behavior is soft deactivation with automatic reactivation on login. In short: the security-critical surface of the product is decorative, and some of its copy is misleading about what will happen to the streamer's data.

## Solution

Wire the `/conta` page to the real account-settings REST module so every action performs its true effect against the backend:

- The page loads the streamer's **real account state**: masked email, two-factor status, active flag.
- **Alterar senha**, **alterar e-mail**, **gerenciar 2FA (TOTP)** and **desativar conta** become fully working flows behind confirmation modals, each requiring the current password exactly as the API demands.
- Changing the email drops all sessions and lands the streamer straight into the existing verify-email OTP flow for the new address.
- Deactivating drops all sessions, clears the local auth cookie, and returns the streamer to login — where signing in again reactivates the account (auto-reactivation, an existing backend behavior now surfaced honestly in the copy).
- Fabricated content disappears: no more invented session counts.
- The two preference switches (alertas sonoros, modo compacto) remain, but persist locally on the device instead of pretending to be saved server-side.

Everything follows the project's visual design system (`design.md`) and the established page conventions (server loader/action with intent-based mutations, toast feedback, inline modal errors).

## User Stories

1. As a streamer, I want the Conta page to show my real account settings on load, so that I trust what I'm seeing is my actual account state.
2. As a streamer, I want my email displayed in masked form (e.g. `j***@gmail.com`), so that shoulder-surfers can't read it while I can still recognize it.
3. As a streamer, I want the two-factor row to reflect whether 2FA is really enabled, so that I know my true protection level at a glance.
4. As a streamer, I want to change my password by providing my current password and a new one, so that a leaked password stops working.
5. As a streamer, I want a "confirm new password" field, so that a typo doesn't lock me out of my own account.
6. As a streamer, I want client-side validation of the new password (minimum 8, maximum 36 characters, upper/lower case plus digit or special character), so that I get instant feedback matching what the server will accept.
7. As a streamer, I want an inline error when my current password is wrong, so that I can retry inside the same modal without losing my typing.
8. As a streamer, I want a success confirmation when my password changes, so that I know the action took effect — and since my current session survives, I expect to stay logged in.
9. As a streamer, I want my other devices' sessions revoked when I change my password, so that a stolen session elsewhere dies immediately (backend behavior; the UI communicates success quietly).
10. As a streamer, I want to start enabling 2FA and immediately see a QR code, so that I can scan it with my authenticator app without extra clicks.
11. As a streamer, I want the raw secret shown alongside the QR, so that I can add the entry manually when scanning isn't practical.
12. As a streamer, I want to confirm activation by typing the 6-digit code from my authenticator, so that a mistyped secret never locks me out.
13. As a streamer, I want an inline error when the confirmation code is wrong, so that I can correct just that field.
14. As a streamer, I want to restart the setup when it expired (pending setup lives only 10 minutes server-side), so that a stalled activation isn't a dead end.
15. As a streamer with 2FA enabled, I want to disable it by re-entering my password, so that a thief with only my unlocked phone can't strip my protection.
16. As a streamer, I want the 2FA badge to flip between Ativa/Inativa right after enabling or disabling, so that the page reflects reality without a manual reload.
17. As a streamer, I want an "Alterar e-mail" action showing my current masked email, so that I have one obvious place to update my login address.
18. As a streamer, I want to confirm an email change with my password, so that nobody can hijack my account through an open tab.
19. As a streamer, I want an inline error when I type the wrong password on sensitive actions, so that I understand exactly what failed.
20. As a streamer, I want an inline error when the new email is already taken, so that I can pick another address.
21. As a streamer who just changed my email, I want to be taken directly to the verify-email screen pre-filled for the new address, so that I complete verification while the OTP (sent automatically) is still fresh.
22. As a streamer whose sessions were dropped by an email change, I want stale links into private pages to land me on login instead of error screens, so that recovery is obvious.
23. As a streamer, I want a clearly labeled "Desativar conta" action — not "Excluir" — so that I understand my data isn't instantly destroyed and that logging back in reactivates the account.
24. As a streamer, I want the deactivation confirmation to require my password inside a red-styled danger modal, so that the weight of the action is unmistakable.
25. As a deactivated streamer, I want to be returned to the login page with my session cookie cleared, so that no ghost state lingers in my browser.
26. As a deactivated streamer, I want logging in again to reactivate my account, so that deactivation is reversible without support tickets (backend behavior, communicated by the modal copy).
27. As a streamer, I want the fake "Sessões ativas" row removed, so that the page stops asserting things it doesn't know.
28. As a streamer, I want sound-alert and compact-mode toggles that remember their state on my device across visits, so that my preferences stick without needing server support.
29. As a streamer, I want a brief loading indication while settings load, so that empty-looking cards aren't mistaken for lost data.
30. As a streamer, I want rate-limit errors (e.g. too many password-change attempts) shown as readable messages, so that throttling doesn't look like a bug.
31. As a streamer on mobile, I want the whole page usable in a single column below the bottom nav, so that account management works from my phone.
32. As a streamer using a keyboard or screen reader, I want setting rows to be real focusable controls and modals closable via ESC/backdrop, so that the page is operable beyond the mouse.

## Implementation Decisions

**Scope boundary.** Frontend-only work. The backend module (`tipply-backend`, `modules/account-settings`) is treated as immutable and consumed as-is; its design contract is the approved backend spec of 2026-08-04. The display-name update endpoint (`PATCH /profile`) is deliberately excluded here — identity/profile editing belongs to the Perfil page.

**API consumption layer.** A new domain module joins the existing frontend API client family (one module per backend domain, exported from the shared index). It exposes typed functions for: get settings, change password, change email, deactivate, 2FA setup, 2FA enable, 2FA disable. Types come preferably from regenerated OpenAPI schema types (project has a generator script against the backend's swagger JSON); hand-written interfaces matching the DTOs are the accepted fallback when the backend isn't running. Every call goes through the standard response-envelope wrapper (`{success, data}` / `{success:false, error:{message, code}}`) used by all other modules.

**API contract consumed (all JWT-guarded via Bearer token from the auth cookie):**

| Method | Path | Payload | Success result |
|---|---|---|---|
| GET | `/account-settings` | — | `{ id, email(masked), has2fa, active, usernameChangedAt }` |
| PATCH | `/account-settings/password` | `{ currentPassword, newPassword }` | `{ message }`; keeps current session, kills others |
| PATCH | `/account-settings/email` | `{ email, password }` | `{ message }`; kills ALL sessions, sends OTP to new email |
| PATCH | `/account-settings/deactivate` | `{ password }` | `{ message }`; sets inactive, kills ALL sessions |
| POST | `/account-settings/2fa/setup` | — | `{ otpauthUrl, secret }`; pending secret lives 600 s server-side |
| POST | `/account-settings/2fa/enable` | `{ token }` (6 digits) | `{ message }` |
| POST | `/account-settings/2fa/disable` | `{ password }` | `{ message }` |

Errors arrive as HTTP 400/401/409/429 inside the envelope; the human-readable `message` is displayed verbatim in the UI.

**Route structure.** The account route keeps the established loader/action pattern: the loader fetches settings server-side with the cookie token (safe defaults on failure, mirroring the wallet page); the action dispatches intent-based mutations. Two intents terminate in document redirects thrown from the action — email change → `/auth/verify-email?email=<new>` (the destination register/login already use whenever an OTP was just sent) and deactivation → `/auth/login` with the auth cookie cleared. All other intents return success/error payloads that modals consume through their own fetchers (the exact interaction style of the Pix-keys modal).

**Validation.** A new zod validator group mirrors the backend DTOs: password strength regex identical to the backend rule, 6-digit 2FA token length, email format/length, non-empty passwords. The password form adds a client-only "confirm new password" equality refinement — the API receives only `currentPassword`/`newPassword`.

**Two-factor experience.** One dual-mode component serves both directions. Enable mode fires setup automatically on open (loading spinner until `{otpauthUrl, secret}` arrives), renders the QR client-side from the `otpauth://` URL via the new `qrcode.react` dependency (backend intentionally does not generate images), shows the secret for manual entry beside it, then collects the first TOTP code to activate. Disable mode asks for the password. Setup-expiry errors render with a regenerate affordance. This honors the backend spec's explicit decision: "the frontend renders the QR".

**Honesty edits.** The "Excluir conta" zone becomes "Desativar conta" with copy stating the account is recoverable by logging in again (auto-reactivation). The invented "Sessões ativas" row is removed outright. The Segurança card gains an E-mail row (current masked email as description) opening the change-email modal.

**Preferences.** The two switches become controlled components persisted to localStorage (no backend contract exists); they initialize lazily on mount to avoid SSR hydration mismatches.

**Design system compliance.** All new surfaces reuse the shared Modal/Button/FormField/PasswordField/OtpInput/AlertMessage primitives, which already encode `design.md`: centered white `rounded-[26px]` modals, pill inputs with wash fill, yellow reserved for primary actions only, destructive confirmations as one-sentence copy with stacked full-red/cancel pills, Solar icons exclusively through the Icon wrapper, short ease-out motion, Satoshi typography, quiet inline success (toast) rather than celebratory screens.

**Session-loss resilience.** No special client handling beyond what exists: the private layout's auth guard already redirects dead tokens to login; the two redirect intents clear the cookie eagerly so the browser never holds a useless token.

## Testing Decisions

**What makes a good test here:** assert external behavior only — given a network response, what renders; given a user action, which request goes out with which payload; given an error response, which message appears where; given a successful sensitive mutation, where the router lands. No assertions on internal state, hooks, or component internals.

**Single seam: the HTTP boundary.** Tests render the real page through a memory router and invoke the real route-module loader/action, with MSW intercepting `/account-settings*` at the network level speaking the genuine response envelope. Nothing else is mocked — not the API modules, not the validators, not the components. One seam, the highest available.

**New tooling (accepted cost):** vitest + jsdom + @testing-library/react + MSW as devDependencies; this is the frontend's first test infrastructure, so the setup itself is part of the deliverable.

**Modules under test:** account route (loader defaults on failure, each action intent, both document redirects including cookie clearing); change-password flow (happy, wrong-password, strength rejection, confirm mismatch); 2FA component (setup-on-open request, QR+secret rendering, invalid code, expiry-regenerate, disable-with-password); email-change flow (redirect target, conflict and credential errors); deactivation flow (redirect, cookie clearing, wrong-password error); preferences (localStorage round-trip).

**Prior art:** none inside this repo — these are the founding tests. The backend's companion design spec plans service-level unit seams for its own scope; we deliberately sit higher (network boundary) because the feature's logic is orchestration and UX state, not computation.

**Supplement:** a manual smoke checklist (real backend running) covers what mocks can't prove — actual TOTP verification with an authenticator app, real OTP email delivery, live rate limiting. `pnpm typecheck` remains the standing gate for every change.

## Out of Scope

- Display-name updates (`PATCH /profile`) — owned by the Perfil page.
- Permanent account deletion, grace periods, or any destructive hard-delete flow.
- 2FA backup/recovery codes (backend v2 item).
- Active-session listing or remote sign-out UI (no backend endpoint exists).
- Login-2FA challenge changes — authentication pipeline untouched.
- Profile picture management; email blacklist on change; audit/history views.
- Any modification to backend code, DTOs, or endpoints.
- Internationalization (UI copy stays pt-BR).

## Further Notes

- Vocabulary follows the backend design spec (2026-08-04): *streamer*, *deactivate/auto-reactivate*, *kills all sessions*, *masked email*, *TOTP setup pending key*. No synonyms drifted.
- Server-side named throttles already bound each sensitive endpoint (3 attempts / 15 min for email, password and deactivation; 5 / 5 min for 2FA). The frontend surfaces the envelope's message rather than inventing retry logic.
- When this lands, consider regenerating the OpenAPI schema types so future modules inherit them; the fallback hand-written types should be deleted in favor of generated ones at that point.
- If the tracker becomes reachable later, port this spec to a GitHub issue on `linkpixlive/api` verbatim with the `ready-for-agent` label and delete nothing — this file remains the source of truth for implementation context.
