# Design system

> **Status: proposal for review.** Every value here is a starting point. The developer handling design confirms or changes it before it is built.
>
> **(MOCK)** The client has not supplied a logo, brand colours or brand fonts (OPEN_QUESTIONS Q9, Q31). Until they do, the palette and type below are placeholders, not the client's brand.

## 1. Palette

Concrete grey and charcoal surfaces, off-white text, one warm candle-amber accent. The same amber drives the menu candle effect.

| Token | Hex | Use |
|---|---|---|
| `ink-950` | `#0C0B0A` | Deepest shade: menu dim base, modal backdrop |
| `ink-900` | `#121110` | Dark page base, hero overlay colour |
| `ink-800` | `#1B1A18` | Dark surface (footer, cards) |
| `ink-700` | `#262422` | Raised surface, solid header |
| `concrete-600` | `#3B3936` | Concrete base tone (texture is tinted to this) |
| `concrete-500` | `#55524D` | Lightest tone allowed in the texture behind body text |
| `concrete-400` | `#6E6A64` | Borders, dividers, large text backgrounds only |
| `concrete-300` | `#A39F97` | Light concrete (rare; dark text only) |
| `bone-100` | `#EDE8DF` | Primary text (off-white) |
| `bone-300` | `#B9B3A8` | Secondary text, captions |
| `bone-500` | `#8C877E` | Dimmed text (unlit menu items) |
| `amber-500` | `#E3A54B` | Accent: links, buttons, candle flame |
| `amber-300` | `#F2C985` | Glow, hover, pool of light |
| `amber-700` | `#8A5A1C` | Amber text on light surfaces |

### Contrast check (WCAG 2.x, computed)

AA needs 4.5:1 for body text and 3:1 for large text (24 px+, or 18.66 px+ bold).

| Text | Background | Ratio | AA body | AA large |
|---|---|---|---|---|
| `bone-100` | `ink-950` | 16.12 | Pass | Pass |
| `bone-100` | `ink-900` | 15.46 | Pass | Pass |
| `bone-100` | `ink-800` | 14.25 | Pass | Pass |
| `bone-100` | `ink-700` | 12.67 | Pass | Pass |
| `bone-100` | `concrete-600` | 9.43 | Pass | Pass |
| `bone-100` | `concrete-500` | 6.37 | Pass | Pass |
| `bone-100` | `concrete-400` | 4.40 | **Fail** | Pass |
| `bone-300` | `ink-900` | 9.05 | Pass | Pass |
| `bone-300` | `ink-800` | 8.34 | Pass | Pass |
| `bone-300` | `ink-700` | 7.42 | Pass | Pass |
| `bone-300` | `concrete-600` | 5.52 | Pass | Pass |
| `bone-500` | `ink-900` | 5.28 | Pass | Pass |
| `bone-500` | `ink-800` | 4.87 | Pass | Pass |
| `amber-500` | `ink-900` | 8.76 | Pass | Pass |
| `amber-500` | `ink-800` | 8.07 | Pass | Pass |
| `amber-500` | `ink-700` | 7.18 | Pass | Pass |
| `amber-500` | `concrete-600` | 5.34 | Pass | Pass |
| `ink-900` | `amber-500` (button) | 8.76 | Pass | Pass |
| `amber-300` | `ink-800` | 11.15 | Pass | Pass |
| `ink-800` | `concrete-300` | 6.59 | Pass | Pass |
| `amber-700` | `bone-100` | 4.83 | Pass | Pass |

Rules that follow from the table:

- Body text never sits on `concrete-400` or lighter. The concrete texture must not have patches lighter than `concrete-500` behind text.
- Text over photos or video always has an overlay. With the hero overlay at 50–60% of `ink-900`, contrast depends on the footage, so it is checked on the real poster and video, not assumed.
- **Menu dimming.** Dimming a whole dish to 25–35% brightness would push its text below AA. Proposal: dim the photo to about 30%, and switch unlit text to `bone-500` (5.28:1 on `ink-900`) instead of dimming it. Lit state uses `bone-100`.

## 2. Typography

| Role | Proposal | Notes |
|---|---|---|
| Headings | **Spectral**, weight 300 | Editorial serif from the same family as the current site's font |
| Labels, nav, eyebrows | **Spectral SC**, weight 300 | The current site's font, kept as a nod to the old brand |
| Body, prices, UI | A clean sans, e.g. **Hanken Grotesk**, 400/500 | Tabular figures for price columns |

**Keep Spectral SC?** Proposal: yes, but only for small labels and navigation. Small caps are hard to read in long text and too quiet for large display headings, so headings use regular Spectral. If design wants a more dramatic display face, the alternative is a high-contrast serif for headings with Spectral SC still used for labels.

Fonts are self-hosted (no request to Google Fonts), with `font-display: swap` and a size-matched fallback to avoid layout shift.

| Step | Size (fluid, min → max) | Line height | Use |
|---|---|---|---|
| `display` | 56 → 128 px | 1.0 | Hero headline |
| `h1` | 40 → 88 px | 1.05 | Page titles, philosophy statement |
| `h2` | 32 → 56 px | 1.1 | Section titles |
| `h3` | 24 → 32 px | 1.2 | Dish group names |
| `lead` | 20 → 24 px | 1.5 | Intro paragraphs |
| `body` | 16 → 18 px | 1.6 | Body, dish descriptions |
| `small` | 14 px | 1.5 | Captions, legal |
| `label` | 12 → 13 px, letter-spacing 0.12em | 1.2 | Spectral SC labels |

Body line length: 60–72 characters.

## 3. Spacing, radius, grid, breakpoints

| Scale | Values |
|---|---|
| Spacing (px) | 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192 |
| Section padding | 96 px mobile → 192 px desktop |
| Radius | 0 (default: images, cards, panels), 2 px (inputs, chips), full (circular badge, pills) |
| Border | 1 px, `concrete-400` at 40–60% opacity |

| Breakpoint | Min width | Columns | Side margin | Gutter |
|---|---|---|---|---|
| `base` | 0 | 4 | 20 px | 16 px |
| `sm` | 480 px | 4 | 24 px | 16 px |
| `md` | 768 px | 8 | 40 px | 24 px |
| `lg` | 1024 px | 12 | 56 px | 24 px |
| `xl` | 1280 px | 12 | 72 px | 32 px |
| `2xl` | 1536 px | 12 | auto (content max 1440 px) | 32 px |

## 4. Motion

Slow and deliberate. No bounce, no overshoot, no springs.

| Token | Value | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Reveals, things arriving |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Things that move from A to B (modal, header) |
| `ease-in` | `cubic-bezier(0.5, 0, 0.75, 0)` | Things leaving |
| `dur-micro` | 150 ms | Button and link states |
| `dur-hover` | 300 ms | Card brighten, underline |
| `dur-base` | 600 ms | Text line reveal, header change |
| `dur-slow` | 900–1200 ms | Image unmask, modal, hero intro |
| `stagger` | 60–80 ms | Between lines or words |

| Pattern | Proposal |
|---|---|
| Line reveal | Each line slides up 100% inside a clipped wrapper, `dur-base`, `ease-out`, staggered. Triggers once at about 20% into the viewport. |
| Word reveal (philosophy) | Word opacity tied to scroll progress, from 20% to 100%. |
| Image unmask | Clip-path opens from the bottom while the image scales from 1.15 to 1, `dur-slow`. |
| Parallax | Max 10% travel. Transform only. |
| Stair descent (pinned) | Section pins for about 3–4 viewport heights. Each scroll step swaps to the next photo with a vertical slide; a warm dark overlay goes from about 0% to 45% across the steps. On phones: a simple vertical stack with the same darkening, no pinning. |
| Hover lighting | Card goes from dimmed (about 70% on Home, about 30% on Menu) to 100% in `dur-hover`, with a radial `amber-300` glow at 10–15% opacity behind it. |
| Candle cursor | Desktop pointers only (`hover: hover` and `pointer: fine`). Small flame follows the pointer with a slight lag; radial glow about 240 px wide. Spark on entering a dish: 400 ms, once. Flicker: slow, low amplitude (opacity ±5%). The real cursor stays available on links, buttons and the booking iframe. |
| Rotating badge | One turn per 20–30 s, linear. |
| Wine rack | The pointed, tapped or arrowed label rises 1.5rem; the card's name settles in (420 ms). |
| Page arrival (D79) | In-app navigation only: rise 12px, fade, blur 4px → 0, 450 ms ease-out. |
| Press | Buttons, tabs, summaries, Book a Table: scale 0.97, 140 ms. |
| Header tuck | Out 260 ms while reading down, back 380 ms on scroll up. Menu tabs follow. |
| Rise | `data-rise` groups: children up 18px and in, 80 ms apart, once. |
| Booking steps | New step slides 1.25rem in from the direction of travel, 280 ms. |
| Reading line | Privacy: 2px amber line scaled with page scroll. |
| Header | Background and height change over `dur-base` once the hero is scrolled past. |

### Reduced motion (`prefers-reduced-motion: reduce`)

| Effect | Fallback |
|---|---|
| Hero video | Poster image, no autoplay |
| Text and image reveals | Content visible immediately; at most a short opacity fade |
| Parallax, slow zoom | Off |
| Pinned stair descent | Normal stacked photos |
| Horizontal gallery | Normal horizontal scroll with native scrolling |
| Candle cursor, spark, flicker | Off; all dishes at full brightness |
| Rotating badge | Static |
| Smooth scrolling | Native scrolling |

## 5. Performance budgets

| Item | Budget |
|---|---|
| Hero video | About 3–4 MB, 1080p, MP4 + WebM, muted, with poster |
| Poster | Loads first; under 200 KB |
| Images | WebP/AVIF, roughly 150–300 KB each, responsive sizes, lazy-loaded below the fold |
| Concrete texture | One file, under 150 KB; grain as a tiny repeating tile |
| Fonts | Self-hosted, subset, at most 4 files |
| Core Web Vitals (mobile) | LCP under 2.5 s, CLS under 0.1, INP under 200 ms |
| Slow connection / Save-Data | Poster instead of video |

## 6. Accessibility baseline

- WCAG 2.2 AA for contrast, focus and keyboard use.
- Visible focus ring: 2 px `amber-500` with a 2 px offset.
- Touch targets at least 44 × 44 px.
- The menu is real text (not images), so it works with screen readers and search.
- The booking modal traps focus, closes on Escape and returns focus to the button that opened it.
