# UI — design.md como lei

> Verificado contra o código em 2026-09-30.

`design.md` é a spec visual; o código é a tradução: `app/app.css @theme` (tokens) + `components/ui/classes.ts` + `header-styles.ts` (classes). Não importar `design.md`, não usar literais.

## Tokens (usar, nunca hex literal)

Shell `#111216` · canvas `#edf0f7` · card `#fff` · wash `#eceef3` · brand `#ffd037`/button `#fed130`/hover `#fcc717` · ink `heading #11151e / body #333945 / secondary #707684 / muted #828896 / label #9ca3af` · `danger #ef4444 / success #10b981 / info #2563eb`. Radius: card `rounded-[26px]`, resto pill `rounded-full`. Sombra máx. `shadow-xs` em card. Motion ≤260ms `ease-out`. Fonte Satoshi (UI); Clash Display só logo/marketing.

## Compartilhados

`CARD_CLASS`, `SECTION_HEADING_CLASS`, `LINK_CLASS`, `STAT_NUMBER_CLASS`, `ICON_TILE_CLASS`, `MENU_ITEM_CLASS`. Proibidos: `bg-white` (→`bg-card`), `hover:bg-black` (→`hover:bg-inverse-hover`), `hover:text-blue-700`, `text-emerald-700`, hexes arbitrários.

## Icon

Só via `ui/Icon` (`name`, `size`, `strokeWidth` → tier: `<2` linear, `2–2.2` outline, `≥2.3` bold). Nunca importar `@solar-icons/react` direto, nunca SVG hand-drawn.

## Shell

Toda view autenticada: rail dark `w-64` / bottom-bar mobile + canvas claro. Página = título (`text-xl→2xl`, extrabold) + cards `rounded-[26px]`. Públicas (`/:username`, `/doacao/:id`, auth): coluna `max-w-md` sem shell.
