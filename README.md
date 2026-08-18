# 2KH Connect — App

React + Vite + TypeScript, Tailwind v4, shadcn-style components on **Base UI**
(`@base-ui/react`).

**The page is intentionally blank.** What this repo holds right now is the design
system in code — theme tokens, style primitives and brand assets. Content comes later.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm typecheck
pnpm lint
```

## Design system

Ported from kh-online.de. Every value below was read off the live pages via computed
styles, not eyeballed:

- <https://www.kh-online.de/ausbildungsmanagement/>
- <https://www.kh-online.de/ausbildungsmanagement/ausbildungsoffensive/>

| Token | Value | Where it comes from |
| --- | --- | --- |
| `--color-kh-orange` | `#FF9F2A` | H1, buttons, links, footer, hamburger |
| `--color-kh-grey` | `#585858` | body copy and most headings |
| `--color-kh-band` | `#E3E3E3` | alternating section band |
| `--color-kh-band-soft` | `#F1F1F1` | image placeholder ground |
| `--color-kh-rule` | `rgba(0,0,0,.1)` | 1px horizontal rules |
| `--color-kh-page` | `#FFFFFF` | page ground, sticky header, hero slab |
| `--color-kh-surface` | `#FFFFFF` | raised surfaces — dialog, menu popup |
| `--color-kh-ink` | `#000000` | band headings, `Button variant="dark"` |
| `--color-kh-footer` | `#FF9F2A` | the closing footer slab |
| type | Barlow — **200** body / **700** headings | the 200/700 split is the site's signature |
| H1 | 35.2px · 700 · uppercase · centred · orange | |
| H2 | 30px · 700 · grey, or black+centred in a band | |
| H3 | 22.4px · 700 · grey | |
| body | 16 / 24 · weight 200 | |
| button | orange bg · white · 16px · weight 200 · **radius 4px** · padding 16/32 · 165×50 | |
| container | max-width **1600px**, 15px gutters | |
| grid | 3 × 377px, 30px gap at 1280 | |
| teaser image | ratio **3.84 : 1**, square corners | |
| footer | orange bg, black text, padding 30/0/60 | |

### Teen-facing modifications (deliberately slight)

The system is left intact; these are the only departures:

- H1 scales up (`clamp(34px → 56px)`) — the site sets it at a timid 35px
- body 16 → 17px, for arm's-length reading on the iPad
- buttons 50 → 54px tall with a 1px hover lift
- teaser photos zoom ~4% on hover
- two devices the campaign already uses are promoted to UI components: the rotated
  orange **sticker** and the **#hashtag** pill

Everything lives in `src/index.css`. Re-theme by editing the `@theme` block — and
the `.dark` block below it, which mirrors the same token names.

## Dark mode (optional)

Off by default in the sense that nothing is forced: the preference starts at
**`system`**, and an explicit choice is remembered in `localStorage['kh-theme']`.
The light design above stays canonical — dark mode is a second set of values for
the same tokens, never a second set of components.

**How it works.** `src/index.css` declares a class-driven variant and a `.dark`
block that re-points the colour tokens:

```css
@custom-variant dark (&:where(.dark, .dark *));

.dark {
  --color-kh-page: #141311;
  --color-kh-band: #1f1d1a;
  --color-kh-grey: #cac5be;
  /* … */
}
```

Because every utility Tailwind generates from `@theme` compiles to
`var(--color-kh-…)`, `bg-kh-band`, `text-kh-grey`, `kh-h2-band` and `kh-rule`
follow the theme with no `dark:` prefix anywhere in a component. **Writing a
literal `bg-white` or `text-black` in markup is what breaks this** — reach for
`bg-kh-page` / `bg-kh-surface` / `text-kh-ink` instead.

The near-blacks are warm (`#141311`, not `#111111`) so the brand orange reads as
part of the palette rather than a foreign accent. Two tokens deliberately differ
in kind rather than degree:

- `--color-kh-orange-hover` **brightens** on dark (`#ffb659`) instead of darkening
- `--color-kh-footer` dims to `#d1811b` — the closing slab stays orange and
  on-brand, but a full-bleed `#FF9F2A` glares against a dark page

**Switching.** `src/lib/theme.ts` owns the state:

```tsx
const { theme, resolved, setTheme } = useTheme()
```

`theme` is the preference (`system | light | dark`), `resolved` is what is actually
on screen. It toggles `.dark` on `<html>`, keeps `<meta name="theme-color">` in
step for mobile browser chrome, follows the OS while the preference is `system`,
and syncs across tabs. `<ThemeToggle />` is the ready-made 35px header control.

An inline script in `index.html` applies the class **before first paint**, so a
dark-mode visitor never gets a white flash. Its storage key and colours mirror
`theme.ts` — change one, change the other.

### Brand assets on a dark ground

`kh-paderborn-lippe2.png` is near-black artwork on transparency, so it disappears on
dark. Use `<Logo />`, which swaps in a re-inked copy of the file:

```tsx
import { Logo } from '@/components/ui/logo'

<Logo />
```

**Why an asset and not a filter.** The obvious `invert()` turns the orange octagon
blue; rotating the hue back drags it to red at 180°, olive by 200° — CSS `hue-rotate`
is a linear approximation and cannot round-trip an inverted colour. All five variants
were rendered and compared against `#FF9F2A`; none held it.

The file itself is unusually clean — exactly two ink values, `#1D1D1B` for the
wordmark and `#F59C00` for the mark — so `kh-paderborn-lippe2-dark.png` was generated
by recolouring **only** the wordmark pixels to `--color-kh-ink`. Alpha and every
orange pixel are byte-identical to the original, so antialiased edges survive intact.
Regenerate it if the logo is ever replaced.

The skyline (`kh-pb-lippe.png`) is already orange on transparency and needs nothing.
`Handygrafik.png` has an **opaque white background** — on a dark band it reads as a
stray white rectangle, so give it a light plate: `dark:rounded-kh dark:bg-white dark:p-3`.

## What's in here

```
src/index.css              tokens + .dark overrides + kh-container / kh-h1 / kh-h2 /
                           kh-h3 utilities
src/lib/theme.ts           theme preference store (system | light | dark)
src/components/
  theme-toggle.tsx         header control: Hell / Dunkel / Wie im System
src/components/ui/
  button.tsx               the site's "mehr erfahren" button (Base UI useRender)
  teaser.tsx               photo + heading + copy + button unit
  sticker.tsx              rotated orange circle
  hashtag.tsx              campaign hashtag pill
  accordion.tsx            Base UI accordion, site styling
  dialog.tsx               Base UI dialog, site styling
  menu.tsx                 Base UI menu + radio items, site styling
  logo.tsx                 wordmark, light/dark asset swap
public/brand/              logo (light + dark), skyline, Handygrafik
                           from kh-online.de
```

`Button` uses Base UI's `useRender`, so composition is via a `render` prop rather than
the Radix-era `asChild`: `<DialogTrigger render={<Button variant="outline" />}>`.
