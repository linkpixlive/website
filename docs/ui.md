# UI — design.md como lei

> Verificado contra o código em 2026-10-05.

`design.md` é a spec visual; o código é a tradução: `app/app.css @theme` (tokens) + `components/ui/classes.ts` + `header-styles.ts` (classes).

## Tokens (usar, nunca hex literal)

Extraídos do protótipo `/novo` (`app/routes/novo.tsx`, mantido como referência visual):

Canvas creme `#FBF8EF` · card `#fff` · wash/ninho `#FBF8EF` · rail `#111111` (fixo nos dois temas) · borda `#E8E4DB` · tinta `heading #111111 / body+secondary #6B6558 / muted+label #8F887C` · marca azul `#AEC6E8` (ativos, logo, avatares) · CTA amarelo `#F5D85D` (só ação primária e badge pendente) · `info #2B4B7A / success #4C5E27 / error #A02A2A` (sólidos com texto branco: `error-solid`, `success-solid`) · pendente `#F5D85D` + `on-pending #111111` (igual nos temas).

Dark (sem inversão mecânica): canvas `#1D1913` · card `#292420` · borda `#3B342A` · textos `#F6F5EE/#B7AB97/#8C8271` · hero `#0C0A07` · primário escuro vira claro (`inverse #F6F5EE` + `on-inverse #111111`) · `success #C2D197 / info #AEC6E8 / error #F0A6A6 / warning #F5D85D` (só texto/suave).

Radius: card `rounded-[28px]`, seção/modal `rounded-[28px]`, linha `rounded-2xl`, resto pill `rounded-full`. Card sem sombra (borda + fill definem a superfície). Motion ≤300ms `ease-out` com delay direcional no rail. Fonte Satoshi (UI); Clash Display só logo/marketing.

## Compartilhados

`CARD_CLASS` (`rounded-[28px]`, sem sombra), `SECTION_HEADING_CLASS`, `LINK_CLASS`, `STAT_NUMBER_CLASS`, `ICON_TILE_CLASS`, `MENU_ITEM_CLASS`. Proibidos: `bg-white` (→`bg-card`), `hover:bg-black` (→`hover:bg-inverse-hover`), `hover:text-blue-700`, `text-emerald-700`, hexes arbitrários.

## Icon

Só via `ui/Icon` (`name`, `size`, `strokeWidth` → tier: `<2` linear, `2–2.2` outline, `≥2.3` bold). Nunca importar `@solar-icons/react` direto, nunca SVG hand-drawn (o `/novo` usa SVG só por ser protótipo isolado).

## Shell

Toda view autenticada: rail `w-60` recolhível (88px, transição com delay direcional) / drawer mobile-tablet com push (`max-lg:translate-x-72`, sem backdrop) + canvas creme com `lg:rounded-l-[24px]` e scroll interno (`lg:h-dvh`, shell travado). Rodapé do rail: user card + popup (Conta/Minha página/Novidades/Aparência/Sair) + botão Recolher. Página = título extrabold + superfícies `rounded-[28px]`. Públicas (`/:username`, `/doacao/:id`, auth): coluna `max-w-md` sem shell.
