# Visual Design System

Source of truth: the home page (`src/app/page.tsx` and its components). These rules apply to **every** screen — settings, lists, detail views, empty states, auth, overlays — not only the current layout.

If a new screen looks like a generic Tailwind dashboard (Inter, indigo, 8px cards, gray-900 on white), it is wrong. Match this file, not a default template.

---

## Tone

Quiet, dense, slightly warm product UI. Dark chrome around a cool-gray canvas of oversized, softly padded white cards. One yellow punch. Rounded almost to the point of being pillowy — never sharp, never “enterprise gray box.”

It should feel like a lived-in collaboration tool: compact type, real avatars, hairline borders, almost no drop shadow. Friendly because of its soft radii and the yellow, not because of illustrations, blobs, or gradients.

**This is not:** a marketing landing page, a glassmorphism concept, a purple SaaS kit, or an airy “AI app” with huge empty space and a centered hero.

**This is:** a dark shell + light work surface. Information sits close together. Accent is scarce. Motion is short. Corners are large.

---

## Color

Use these hex values. Do not approximate with Tailwind’s default `gray-*` / `yellow-*` / `black` except where noted.

### Shell (dark)

| Token | Hex | Use |
|---|---|---|
| Shell | `#111216` | Page outer, nav rail, bottom bar, drawers |
| Inset dark | `#181a1f` | Banners, floating pills, media chrome |
| Media void | `#1e232d` | Video / image wells, empty media frames |
| Inverse action | `#16181e` | Dark circular / pill actions on light cards; hover `#000000` |

On dark surfaces, inactive icons are `#7f8594`. Active icons are white (desktop rail) or yellow (mobile bar). Hover wash is `white/5`, never a light gray panel.

### Canvas (light)

| Token | Hex | Use |
|---|---|---|
| Canvas | `#edf0f7` | The work area behind cards. Content never full-bleeds white. |
| Surface | `#ffffff` | Cards, modals, popovers, sheets, inputs-on-white |
| Wash | `#eceef3` | Nested wells, list hover, secondary buttons, search fields, chat bubbles |
| Tile | `#f9fafb` (`gray-50`) | Tiny icon tiles only |

### Text

| Role | Hex | Weight |
|---|---|---|
| Heading / names | `#11151e` | bold / extrabold |
| Inline emphasis | `#141822` / `#12151f` | bold, inside muted sentences |
| Body | `#333945` / `#222834` | medium / semibold |
| Secondary | `#707684` | medium |
| Muted | `#828896` | medium |
| Label / meta | `#9ca3af` | medium, or extrabold + uppercase for section labels |
| Placeholder | `#707684` | medium |
| Chrome icon (on white) | `#3e4452` | — |

Do not use `#000000` or `gray-900` for text. Do not use `gray-500` as a catch-all muted.

On dark surfaces: white for titles, `#9ca3af` for supporting lines.

### Accent — yellow, used sparingly

| Token | Hex | Use |
|---|---|---|
| Brand | `#ffd037` | Logo tile, active-nav tick, badges, unread dots, selection highlight |
| Button | `#fed130` | Primary pills and circular send/confirm |
| Button hover | `#fcc717` | Primary hover |
| Yellow ink | `#b58a00` | Icons sitting on a yellow wash |
| Yellow wash | `#fff7d6` | Rare: a 36px icon tile that *is* about a yellow-coded object (e.g. calendar) |

Yellow is a **signal**, not a theme. A page should have at most a handful of yellow objects: one primary action, maybe a badge, maybe the logo. Never yellow section backgrounds, never yellow text on white, never yellow borders around cards.

Text on yellow is always `#11151e` (or `#111216` on the logo). Never white on yellow.

### Semantic (not brand)

| Role | Hex | Notes |
|---|---|---|
| Destructive | `#ef4444` | Hover `#dc2626`. On dark chrome, idle `#f87171` → hover `#ef4444`. |
| Success | `#10b981` | Inline confirmation only (“Copied”, “Invite sent”). |
| Link / info | `#2563eb` | Hover `#1d4ed8`. Underline links in running text. |
| Warning tint | `#f59e0b` | Icon-only, in notification tiles. |

Destructive actions are isolated: last in a menu, separated by a hairline, `text-[#ef4444] hover:bg-red-50`. Confirmations that destroy (leave, delete) use a full red pill, not yellow.

Avatar identity rings (pink `#ec4899`, gold `#eab308`, blue `#3b82f6`, cyan `#06b6d4`) are **person color**, not UI accent. Do not reuse them for buttons or badges.

### Selection

`selection:bg-[#ffd037]/40 selection:text-black`

---

## Typography

**Families (two-role system), both from Fontshare (ITF Free Font License), self-hosted via `next/font/local` from `src/app/fonts/` (license texts kept alongside the files):**

- **UI / body — Satoshi** (variable, wght 300–900; intermediate weights such as semibold interpolate cleanly). The default family: exposed through the `--font-sans` token (`--font-satoshi` CSS variable on `<html>`). Every role below uses Satoshi unless marked display.
- **Display — Clash Display** (variable, wght 200–700). Exposed as the `--font-display` token → `font-display` utility (`--font-clash-display` CSS variable on `<html>`). **Reserved exclusively for marketing/landing surfaces — not used in the product UI today.** When that surface is built, its headlines use Clash Display while body copy stays Satoshi. Its weight axis caps at 700; never fake heavier weights with transforms.

**Rendering:** `antialiased`.

Do not apply the display family to menus, labels, badges, buttons, or running text. No Inter, Geist, Roboto, system-ui stacks, or display serifs.

### Scale

| Role | Size | Weight | Tracking / leading |
|---|---|---|---|
| Page title | `text-xl` → `sm:text-2xl` → `lg:text-[26px]` | extrabold | `tracking-tight leading-tight` |
| Overlay / empty title | `text-lg` | extrabold | `tracking-tight` |
| Card title | `text-base` (16px) | bold | default |
| Item title | `text-[15px]` | bold | `leading-snug` |
| Panel title | `text-sm` | bold | `leading-tight` |
| Menu / list name | `text-[13px]` | bold or semibold | `leading-tight` / `leading-snug` |
| Body / notes | `text-xs` ~ `text-[13px]` | medium | `leading-snug` or `leading-relaxed` |
| Chat | `text-xs` / `sm:text-[12.5px]` | medium | `leading-relaxed` |
| Supporting line | `text-xs` ~ `text-sm` | medium | — |
| Section label | `text-[11px]` | extrabold | `uppercase tracking-wider` `#9ca3af` |
| Badge / micro | `text-[10px]`–`text-[11px]` | extrabold | — |
| Timestamp | `text-[11px]` | semibold | `text-gray-400` |

Page titles are the only large type. Do not invent an H1 > 26px. Do not use `font-light` or `font-black`.

**Weight meaning:** medium = running text, semibold = controls and meta, bold = titles and names, extrabold = the few things that must punch (page title, uppercase labels, numeric badges).

---

## Borders

Borders are **hairlines**, almost atmospheric. If you can see a border from across the room, it is too strong.

| Context | Token |
|---|---|
| Card, modal, popover | `border border-gray-100/70` |
| White icon button | `border-gray-100/80` |
| White-on-white input / composer | `border-gray-200/90` |
| Nested attachment / tile | `border-gray-100` or `border-gray-100/90` |
| Dividers (lists, destructive menu group) | `border-t border-gray-100` |
| Dark pills on media | `border-white/10` |
| Mobile nav top edge | `border-t border-white/10` |
| Avatar on light | `border border-white` + `shadow-2xs` |
| Avatar stacked / on media | `border-2 border-white` |
| Focus (inputs) | `border-[#fcc717]` + `ring-2 ring-[#ffd037]/30` |
| Destructive well | `border-[#ef4444]/20` or `/30` |
| Yellow tile | `border-[#ffd037]/40` |

No 2px gray frames around cards. No `border-gray-300`. No colored outlines as decoration.

**Radius is part of the border language.** Prefer rounding over stroking: a card is defined by its fill + radius + whisper border, not by a box.

---

## Radius

This system is aggressively round. Default Tailwind `rounded` / `rounded-md` / `rounded-lg` on a card is a defect.

| Token | Value | Use |
|---|---|---|
| Pill | `rounded-full` | Buttons, text fields, icon buttons, badges, avatars, chips, send controls |
| Media | `rounded-[28px]` | Large image / video wells |
| Card | `rounded-[26px]` | Surfaces, modals, mobile sheets (`rounded-t-[26px]`) |
| Nested chrome | `rounded-[20px]` | Dark banners inside a card, desktop popovers |
| Nested surface | `rounded-2xl` (16px) | Profile wells, file-type icons, inner cards |
| Row | `rounded-xl` (12px) | Menu items, search hits, list rows |
| Tile | `rounded-[12px]` / `rounded-lg` | 36px icon squares |
| Logo | `rounded-2xl` | Brand mark on the shell |
| Bubble notch | `rounded-2xl` + `rounded-tr-xs` or `rounded-tl-xs` | Chat: flatten only the corner that faces the avatar |

Sheets coming from the bottom keep the 26px radius on the **top** corners only.

---

## Shadow

Shadows are small. Elevation is implied by the canvas/card contrast, not by a drop.

| Level | Token | Use |
|---|---|---|
| Whisper | `shadow-2xs` | Nested chips, composers, avatars, send buttons |
| Card | `shadow-xs` | White cards, header icon buttons, dark banners |
| Control | `shadow-sm` / `shadow-md` | Floating controls on media |
| Accent glow | `shadow-lg shadow-[#ffd037]/20` | Logo only |
| Danger glow | `shadow-md shadow-[#ef4444]/30`–`/40` | End-call / destructive primary only |
| Overlay | `shadow-xl` (modal), `shadow-2xl` (drawer / sheet) | — |

No stacked “soft UI” shadows. No `shadow-2xl` on resting cards. No colored glows except the two accent cases above.

---

## Spacing

Dense product spacing. Padding is generous *inside* round cards; gaps *between* regions stay moderate. Do not pad like a landing page.

### Page

- Work-area padding: `p-4 sm:p-6 lg:p-7`
- Mobile extra bottom: `pb-20` so content clears the bottom nav (`md:pb-6`)
- Title block to content: `mb-6`
- Major regions: `gap-5`

### Surface

- Standard card: `p-5`
- Dense panel (chat-like): `p-3 sm:p-3.5`
- Modal body: `p-5 sm:p-6`; compact lists `p-4`; confirmations `p-6` centered
- Popover / menu: `p-2` around items, or `p-4` when the popover has a header
- Menu item: `px-3.5 py-2.5`, `gap-3` icon-to-label, `gap-0.5` between items
- Destructive group: `mt-1.5 pt-1.5` after a divider
- Overlay inset on media: `top-4 / left-4 / right-4 / bottom-4`, control cluster `gap-2`

### Hits

- Icon button: **44×44** (`w-11 h-11`) on the canvas
- Media control: **40×40**, `sm:` **44×44**
- Send / compact circular action: **32×32**
- List avatar: 28–36px; notes trailing avatar: 20px
- Active-nav tick: 6×28px (`w-1.5 h-7`) rounded on the inner side

Do not use `gap-8`+ between cards, `p-10` card padding, or centered max-w-prose columns unless the page is truly a long reading view.

---

## Layout

Rules below are structural. They are not tied to one screen.

### Shell and canvas

Every authenticated view is a **dark shell** (`#111216`) holding a **light canvas** (`#edf0f7`).

- Desktop: an expanded dark rail (`w-64`, `px-3`, sticky, full viewport height) on the start edge. Logo at top, primary nav in the middle, destructive/session action at the bottom. Nav rows are `rounded-xl`, icon 20px + `text-[13px] font-semibold` label, `gap-3` icon-to-label, `px-3.5 py-2.5`, `gap-1` between rows, `overflow-y-auto scrollbar-thin` so more than ~9 items never clip. Active row: white + `bg-white/5` (persistent light wash), tick on the inner edge; idle `#7f8594`, `hover:text-white hover:bg-white/5`. Group rows (accordion) carry a trailing `ChevronDown` that rotates 180° when open; children rows indent under the parent label start (`pl-[46px]`), and the group auto-opens when one of its children is the selected page. Session action: red Log Out row under a `border-t border-white/10` divider.
- Mobile: the same nav becomes a **fixed bottom bar** (`z-50`, `border-t border-white/10`). A hamburger on the canvas opens a **left dark drawer** (`w-72`, `max-w-[85vw]`).
- The canvas is the only place white cards live. Do not put white cards on `#111216`. Do not put a light top-nav bar above the canvas.

### Content geometry

- Primary column + optional secondary column. At `lg`: 12-column grid, primary `col-span-7` (or 8 at `xl`), secondary the remainder. Below `lg`: single column, `gap-5`.
- Inner pairs (two sibling cards) split at `sm` (`grid-cols-2`), stack on the smallest screens.
- Cards **stretch** (`h-full`, `items-stretch`). A card is a region, not a shrink-wrapped widget floating in whitespace.
- Page title sits at the top of the canvas, left-aligned, with compact utility controls (search, alerts, avatar) on the end edge. On small screens, title stacks above controls; controls `self-end`.

### What a page is made of

Compose from **cards**, not from full-bleed sections.

1. One page title + one supporting sentence (muted, with bold fragments for numbers/names).
2. One or more `rounded-[26px]` white surfaces.
3. Optional nested dark banner (`#181a1f`, `rounded-[20px]`) when a card has its own mini-header (people stack, count, title).
4. Lists inside cards: either `divide-y divide-gray-100` or `gap-5` blocks — pick one per list, don’t mix.

Do not introduce a third chrome (tabs as a second top bar, a light sidebar, a footer). If a view needs local navigation, put it in the existing rail or as in-card segmented control that still uses pills / yellow tick — not underline tabs.

### Overlays (system-wide)

| Pattern | Surface | Motion | Dismiss |
|---|---|---|---|
| Modal | Centered white `rounded-[26px]`, `shadow-xl`, `max-h-[90vh]`. Sizes: 420 / 560 / 720. Backdrop `bg-black/40 backdrop-blur-sm`. | `animate-scale-in` | ESC, backdrop |
| Popover | Anchored, `rounded-[20px]`, `shadow-lg`, 8px below trigger. | `animate-pop-in` | ESC, outside click |
| Mobile fallback for popover | Bottom sheet, `rounded-t-[26px]`, `shadow-2xl`, titled, close button. | `animate-slide-up` | ESC, backdrop |
| Drawer | Left, dark `#111216`, `shadow-2xl`. Backdrop `bg-black/50`. | `animate-slide-left` | ESC, backdrop |

Lock body scroll while a modal or drawer is open. `z-50` for all overlays. Do not stack competing overlay systems.

---

## Controls

### Buttons

All actions are **pills** (`rounded-full`) unless they are a square-ish menu row.

| Kind | Fill | Text | Notes |
|---|---|---|---|
| Primary | `#fed130` → hover `#fcc717` | `#11151e` bold | `active:scale-95` or `active:scale-[0.98]` |
| Secondary | `#f4f5f8` → hover `gray-100` | `#333945` bold | Cancel, quiet |
| Inverse | `#16181e` → hover black | white | Downloads, “add” FABs |
| Destructive | `#ef4444` → hover `#dc2626` | white | Optional red glow |
| Success (transient) | `#10b981` | white | Only after a completed action, replacing the inverse/primary label |

Full-width buttons in dialogs: `py-3 text-sm font-bold`. Compact: `px-4 h-10 text-xs font-bold`. Hero compact: `px-6 py-2.5 text-sm`.

### Icon buttons

Circle, 44px, `bg-white hover:bg-gray-50`, hairline border, `shadow-xs`, icon 20px at the default weight (Outline), color `#3e4452`. `active:scale-95`.

On media: frosted `bg-white/90 backdrop-blur-md` when on, `bg-[#181a1f]/90` when off. Off-camera/off-mic tints red.

### Inputs

Pill. Two legal fills:

1. **Wash field** — `bg-[#eceef3] border-[#dfe3ea]`, used in modals and search.
2. **Composer** — `bg-white border-gray-200/90`, used when the field sits on a white card (chat, inline edit).

Both: transparent inner input, `font-medium`, placeholder `#707684`, no outline. Focus is `focus-within:border-[#fcc717] focus-within:ring-2 focus-within:ring-[#ffd037]/30`. Leading icon in `#707684`. Trailing submit is a 32px yellow circle.

### Menus

`text-[13px] font-semibold text-[#333945] rounded-xl hover:bg-[#f4f5f8]`. Icons 16px, `#707684`, stroke ~1.9. Destructive row last, red, `hover:bg-red-50`. Clipboard success swaps the icon to a green check and the label to “Copied!” for ~1.6s — no toast required.

### Badges & ticks

- Numeric / unread: 16px yellow circle, `#11151e` extrabold 11px, or a 10px yellow dot.
- Status chip: yellow pill, `px-2 py-0.5`, 10px extrabold (`Speaking`).
- Nav active: yellow tick on the inner edge of the rail (`rounded-r-full`) or a 24×4px yellow cap on the mobile bar. Active icon scales slightly and switches to the Bold tier (vs Linear idle).

### Avatars

Always circular, `object-cover`. Stack with negative space (`-space-x-1.5` to `-space-x-2`). Hover `scale-110`. “+N” overflow is a dark circle, white 2px ring, bold 12px.

---

## Icons & imagery

- **Icons:** Solar only (`@solar-icons/react`), imported through the `@/components/ui/Icon` wrapper, which maps `strokeWidth` to a style tier: `<2` → Linear (idle / menu icons; the exact stroke value passes through, 1.5–1.9), `2–2.2` → Outline (default controls), `≥2.3` → Bold (active nav, send, confirmation checks — Solar has no heavy stroke style, so its Bold weight is filled; that fill is legal *only* on this accent tier). Never import from `@solar-icons/react` directly, never use Duotone/Broken styles. Do not mix icon sets.
- **Icons are Solar** — Solar icon set by 480-Design (`@solar-icons/react`, MIT package / CC-BY-4.0 glyphs).
- **Photos:** real people, cropped as circles or as media wells. Media wells `rounded-[28px] overflow-hidden` with a dark fallback `#1e232d`.
- **Logo:** 48px rounded-2xl yellow tile, dark glyph, yellow glow. Hover `scale-105`.
- **Emoji:** allowed as a single page-title companion or as reactions. Not as empty-state illustration, not as a row of three decorative glyphs.

No undraw / blob / gradient-mesh illustrations. Empty states are type-only: bold title + muted sentence, centered, modest vertical padding (`py-6` to `py-10`).

---

## Motion

All motion is short and `ease-out`. If it takes longer than 260ms, it is too slow.

| Name | Duration | From |
|---|---|---|
| `fade-in` | 200ms | opacity 0 |
| `scale-in` | 200ms | opacity 0, scale 0.96 |
| `pop-in` | 180ms | 6px down, scale 0.97 |
| `slide-up` | 240ms | 100% down (sheets) |
| `slide-left` | 260ms | 100% left (drawers) |

Interaction: `active:scale-95` on circles, `active:scale-[0.98]` on wide pills, `hover:scale-110` on small avatars and emoji cells. Hover-reveal controls use `opacity-0 group-hover:opacity-100` — do not leave ⋯ buttons permanently visible on dense lists.

No bounce. No spring overshoot. No looping animations except a single `animate-ping` on a live destructive control (end-call). No page-load choreography.

Scrollbars in dense panels: 4px, thumb `#e2e8f0` → hover `#cbd5e1`, transparent track (`scrollbar-thin`).

---

## Copy & density

- Titles are specific (“Interview with CEO and Marketing”), not generic (“Dashboard”, “Overview”, “My Workspace”).
- Supporting lines carry numbers in **bold near-black** inside muted sentences: “Today you have **14 meetings** planned for **4 projects**.”
- Section labels are tiny uppercase, not H3s.
- Confirmation copy is one sentence, then two stacked pills (destructive on top, cancel below) — not a three-button footer.
- Success is inline and quiet. Prefer swapping a label to “Copied!” over a toast stack.

---

## Anti-slop checklist

Reject a screen that does any of the following:

1. **Wrong typeface** — Inter, Geist, system-ui, or a serif display.
2. **Wrong accent** — indigo, violet, cyan-as-brand, rainbow tags, gradient buttons.
3. **Wrong surface** — white page, gray-900 sidebar, glass panels, mesh/blob backgrounds, dark cards on a dark canvas.
4. **Wrong radius** — 8–12px cards, squared buttons, `rounded-md` inputs.
5. **Wrong border** — visible gray frames, 2px outlines, dashed drop-zones as decoration.
6. **Wrong shadow** — large soft shadows, colored ambient glows on every card.
7. **Wrong spacing** — marketing whitespace, centered 480px columns, `gap-8`+ card grids, `p-10` empty cards.
8. **Wrong type scale** — 36–48px heroes, thin weights, muted-everywhere, or all-caps body.
9. **Wrong controls** — underline tabs, rectangular primary buttons, ghost-border buttons as the default, floating action buttons in Material style (except the 32px inverse “+” that sits on a card corner).
10. **Wrong motion** — fade-up-on-scroll, staggered card reveals, 400ms+ easings, bounce.
11. **Stock AI layout** — three equal stat cards with big numbers, a purple sparkline, a “Welcome back,” and a right-rail of generic “tips.”
12. **Illustration kits** and decorative emoji rows.
13. **Yellow everywhere** — if more than one large object is yellow, remove yellow until only the primary action (and logo/badge) remain.

When in doubt: **dark shell, cool-gray canvas, 26px white card, hairline border, pill yellow action, Satoshi extrabold title in `#11151e`.**
)
