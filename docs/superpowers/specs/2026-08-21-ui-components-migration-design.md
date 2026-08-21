# UI Components Migration — Design Spec

Date: 2026-08-21
Scope: Phase 1 of the layout migration — restyle all reusable components in `app/components/ui` to match `design.md` (source of truth), reusing their existing HTML structure and keeping public APIs backward-compatible.

## Approved decisions

1. **Icons:** install `@solar-icons/react` and create `app/components/ui/Icon.tsx` wrapper mapping `strokeWidth` to style tiers: `<2` → Linear, `2–2.2` → Outline (default), `≥2.3` → Bold. Only components under `ui/` switch from lucide in this phase.
2. **Fonts:** self-host Satoshi (UI/body) + Clash Display (display, unused in product UI today) as variable `.woff2` in `app/fonts/`, registered via `@font-face` and exposed through `--font-sans` / `--font-display`. Google Fonts/Inter links removed from `root.tsx`.
3. **Tokens:** replace the old palette in `app.css @theme` now. Old token *names* are remapped to nearest new-system values so un-migrated pages stay coherent; new tokens are added for the full design.md vocabulary.
4. **Component APIs:** keep existing props/variants working; add new ones additively.

## Foundation

### Token remap (old name → new value)

| Old token | New value | Rationale |
|---|---|---|
| `background` | `#111216` | Shell |
| `surface` | `#181a1f` | Inset dark |
| `surface-hover` | `#23252c` | ~white/5 solid on inset |
| `border` | `#2a2d35` | ~white/10 solid |
| `border-focus` | `#fcc717` | Focus per spec |
| `primary` / `-hover` | `#fed130` / `#fcc717` | Yellow button |
| `primary-disabled` | `#e8eaef` | Disabled fill |
| `secondary` | `#f4f5f8` | Wash field fill |
| `text-heading` | `#ffffff` | Titles on dark |
| `text-primary` | `#9ca3af` | Label/meta |
| `text-secondary` | `#7f8594` | Inactive chrome |
| `text-muted` | `#707684` | Secondary text |
| `success/error/warning/info` | `#10b981` / `#ef4444` / `#f59e0b` / `#2563eb` | Semantic |

### New tokens
Shell/canvas/card/wash/tile/inset-dark/media-void/inverse; brand `#ffd037`, button `#fed130`, hover `#fcc717`; yellow-ink `#b58a00`, yellow-wash `#fff7d6`; ink scale (`#11151e`, `#333945`, `#222834`, `#707684`, `#828896`, `#9ca3af`, `#a0a6b2`, `#3e4452`); destructive-hover `#dc2626`.

### Base & motion
- Body: canvas `#edf0f7`, ink-body, Satoshi, antialiased; `::selection { background: #ffd03740; color: black }`.
- Animations: `fade-in` 200ms, `scale-in` 200ms (opacity 0, scale .96), `pop-in` 180ms (6px down, scale .97), `slide-up` 240ms, `slide-left` 260ms — all ease-out. Keep `spin`/`shake`.
- Utility `scrollbar-thin`: 4px thumb `#e2e8f0` → hover `#cbd5e1`, transparent track.

## Component specs

| Component | Spec |
|---|---|
| Button | Pill `rounded-full`. primary `#fed130`→`#fcc717`, text `#11151e` bold, `active:scale-[0.98]`; ghost = alias of secondary (`#f4f5f8`→gray-100, `#333945`); **new** inverse (`#16181e`→black, white) and transient success (`#10b981`, white); danger `#ef4444`→`#dc2626` white. sm `px-4 h-10 text-xs bold`, md `px-5 py-2.5 text-sm bold` |
| SubmitButton | Dialog sizing: `w-full py-3 text-sm font-bold`, same language as Button |
| FormField | Pill wash input: `bg-[#f4f5f8] border-gray-100/80`, focus `border-[#fcc717] ring-[#ffd037]/30`, placeholder `#a0a6b2`, leading icon `#707684`; label `text-[13px] medium #707684`; error red + shake kept |
| SelectField | Trigger same pill; panel popover `rounded-[20px] shadow-lg p-2 animate-pop-in`; rows `rounded-xl px-3.5 py-2.5 text-[13px] semibold #333945 hover:bg-[#f4f5f8]`; selected check `#b58a00` + bold |
| DatePicker | Pill trigger w/ calendar icon; panel `rounded-[20px] p-4`; weekday header `text-[11px] extrabold uppercase #9ca3af`; round day cells; selected day circle `#fed130` + text `#11151e`; clear = red link under hairline |
| Modal | White panel `rounded-[26px] border-gray-100/70 shadow-xl max-h-[90vh]`; backdrop `black/40 blur-sm`; enter scale-in; title `text-lg extrabold tracking-tight #11151e`; close = circle hover wash; body `p-5 sm:p-6`; additive `size?: "sm"\|"md"\|"lg"` (420/560/720), default md |
| Badge | Chip pill `px-2 py-0.5 text-[10px] extrabold`, semantic tints amber/emerald/red, default neutral wash |
| Pagination | Hairline `border-t border-gray-100`; arrows Button secondary sm; meta `text-[13px] #707684` with bold near-black numbers |
| Skeleton | Default `rounded-xl`, soft gray fill |
| AlertMessage | `rounded-xl` hairline tints `#10b981`/`#ef4444`/`#2563eb`; icons via Icon wrapper |
| Toast | White card `rounded-[20px] shadow-xl p-4`; title `13px bold #11151e`; body `text-xs #707684`; slide-up; `useToast` untouched |

## Verification
`npm run typecheck`, `npm run build`, dev-server visual pass (login, register, wallet, queue).

## Out of scope (next phases)
Page-level structure (rail/canvas/shell), lucide replacement in pages, per-page redesigns.
