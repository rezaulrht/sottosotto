# Architecture

> **Status: approved 2026-11-14 with one change: Next.js instead of Astro (D30).** Static map approved (D42). Hosting and domain ownership are deferred (Q41, Q42). Decisions D30–D48 are in `DECISIONS.md`. Behaviour comes from `PAGES.md`, content from `data/`, visual tokens from `DESIGN_SYSTEM.md`; this file says how to build them.

## 1. Summary

| Area | Recommendation | Main reason |
|---|---|---|
| Framework | **Next.js (App Router), React, TypeScript strict, static export** (`output: "export"`) (D30, your choice) | React team familiarity; static files for any host |
| Navigation | `next/link` client navigation; one motion provider reverts all effects on every route change | Fast page changes without leaking scroll effects |
| Styling | CSS Modules + CSS custom properties for tokens | Tokens map 1:1 from `DESIGN_SYSTEM.md`; motion-heavy editorial layouts gain little from utility classes |
| Motion | GSAP + ScrollTrigger, Lenis on desktop only, all registered through one `gsap.matchMedia()` registry | One switch for desktop / mobile / reduced motion, with automatic cleanup |
| Candle effect | DOM + CSS: overlays that only change `opacity` and `transform` | Smooth on mid-range hardware, accessible, no canvas or WebGL to maintain |
| Data | `data/*.json` → Zod schemas → typed content at build time | Invalid content fails the build |
| Images | Own `sharp` script → AVIF + WebP at fixed widths + a manifest; plain `<picture>` | Works on any static host; files named by dish id |
| Video | `ffmpeg` script → MP4 (H.264) + WebM, 1080p and 720p, poster first | Under 4 MB, loads only when the connection and settings allow |
| Fonts | `next/font/google` (downloads at build, self-hosts), `display: swap`, 2 preloads | No request to Google Fonts at runtime; at most 4 files |
| Map | **Self-hosted static dark map + "Get directions" link**; optional click-to-load Google map later | No key, no cost, no cookies, full styling. Deviates from PAGES.md; needs approval |
| Consent | Own small banner; GA4 loaded only after "Accept" (Consent Mode v2, basic mode) | One tag, UK consent rules, about 3 KB |
| Hosting | **Cloudflare Pages** recommended; output also runs on Nginx, Netlify, Vercel | Free for commercial use, branch previews, `_headers` file; no lock-in |
| Mock guard | Build-time content report; production build fails while flagged values remain | Mock data cannot ship by accident |

## 2. Stack decisions

### 2.1 Framework: Next.js static export (decided)

**Decision (D30, 2026-11-14): Next.js App Router with `output: "export"`.** Astro was recommended but not chosen. The comparison below is kept so the trade-offs we accepted are on record; §12 lists the Next.js specifics.

| | Astro (static) — not chosen | Next.js App Router, `output: "export"` — chosen |
|---|---|---|
| Framework JS per page | 0 KB by default; scripts only where used | React + Next runtime on every page (tens of KB gzip before any of our code) |
| Static HTML | Native | Supported; rules out middleware, ISR, server actions, dynamic route handlers, `next/image` optimisation, and `headers()` / `redirects()` in config |
| Strict CSP | Inline scripts are few and hashable; Astro can generate CSP hashes (check it is stable in the pinned version) | Inline RSC payload scripts on every page change each build; in practice needs `'unsafe-inline'` |
| Images | Own script (same either way) | Needs `images.unoptimized` or a custom loader |
| Route-change cleanup | Not needed (multi-page) | Layout stays mounted; every ScrollTrigger and Lenis instance must be reverted on navigation |
| Phase 2 booking | Add a server endpoint via an adapter, or a separate serverless function | Must leave static export, or use a separate function |
| Team familiarity | Lower if the developer only knows React. React islands are possible but not needed | Higher for React developers |

**Accepted costs of Next.js:** a larger JS baseline on every page (budgets raised, §11.3), a CSP that needs `'unsafe-inline'` for scripts (§10.2), and explicit cleanup of scroll effects on client-side navigation (§7.3). Most pages are still Server Components rendered to static HTML; only interactive pieces are Client Components.

### 2.2 Styling: scoped CSS + custom properties (Tailwind rejected)

- `src/styles/tokens.css` holds every token from `DESIGN_SYSTEM.md` as CSS custom properties: colours (`--ink-900`…), fluid type steps with `clamp()`, spacing, radius, easing and durations.
- `src/lib/tokens.ts` mirrors the values JS needs (easings, durations, breakpoints) so GSAP and CSS use the same numbers. A unit test checks the two files agree.
- `scripts/check-contrast.ts` recomputes the WCAG table in `DESIGN_SYSTEM.md` from `tokens.css` and fails if a pair used for body text drops below 4.5:1.
- Components use CSS Modules (`Component.module.css`); global styles only for tokens, reset, base and typography.
- Tailwind rejected: the layouts are bespoke and editorial, most styling is motion state, and it would add a second token system to keep in sync. Not clearly better here.

### 2.3 Motion libraries

| Library | Use | Licence |
|---|---|---|
| GSAP 3 core + ScrollTrigger (+ SplitText for line reveals) | Timelines, scrubbed and pinned sections, text reveals | Free for commercial use with all plugins, under GSAP's own "standard no-charge" licence (not MIT). **Read the licence text at install** and pin the version |
| Lenis | Smooth wheel scrolling on desktop | MIT |

Lenis and ScrollTrigger are wired together once, in `src/motion/scroll.ts`:

```ts
// sketch only — not final code
const lenis = new Lenis({ autoRaf: false });   // touch stays native (Lenis default)
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

Lenis is created only when `(prefers-reduced-motion: no-preference) and (pointer: fine)`. It drives the native scroll position (no transformed wrapper), so Page Down, find-in-page, anchor links and screen readers keep working. Lenis is stopped while the booking modal is open.

## 3. Folder structure

The git repo root is `~/byteSpate/sotto-sotto/`. The app lives in `SottoSotto-Code/`. The original photo folder `sotto sotto assets/` sits beside it and is git-ignored (D36).

```
SottoSotto-Code/
  CLAUDE.md
  docs/                 Planning docs (behaviour, decisions, questions)
  data/                 Content JSON: the only content source (D4)
  src/
    app/                Routes: layout.tsx (Header, Footer, BookingModal, CookieBanner, MockBadge),
                        page.tsx, menu/, venue/, find-us/, privacy/, not-found.tsx, sitemap.ts, robots.ts
    components/
      global/           Site-wide components (§4.1)
      home/             One component per Home section
      menu/             Tabs, dish cards, wine and bar lists, allergens
      venue/            Venue sections
      find-us/          Map, contact, parking, careers
      shared/           Picture, VideoBackground, RevealText, Button, Eyebrow
    content/            Zod schemas, loaders, typed exports, image manifest
    lib/                Hours, prices, SEO/JSON-LD, environment, tokens
    motion/             Scroll setup, effect registry, effects, candle
    booking/            Modal controller, provider interface, Hospres iframe provider
    consent/            Consent store, banner logic, GA4 loader
    styles/             tokens.css, reset, base, typography
  public/
    img/                Generated images (committed); never edited by hand
    video/              Generated video and posters
    textures/           Concrete texture and grain tile
    icons/              Favicons, OG images
  scripts/              Images, video, content report, headers emitter, contrast check
  config/               Security headers, redirects, environments (one source for every host)
  tests/
    unit/               Vitest: schemas, hours, allergens, mock guard, JSON-LD
    e2e/                Playwright + axe: routes, modal, keyboard, reduced motion
(repo root) .github/    CI workflow, working directory SottoSotto-Code
```

## 4. Component inventory

### 4.1 Global

| Component | Does | JS |
|---|---|---|
| `app/layout.tsx` | `<head>` (metadata, fonts, JSON-LD), skip link, header, footer, modal, banner, badge | — |
| `Header` | Nav left, logo centre, Book right; transparent over the hero, solid and smaller after scroll | Tiny (IntersectionObserver on a sentinel) |
| `MobileNav` | Full-screen overlay menu, focus trapped, Escape closes | Small |
| `BookButton` | `<a href={site.booking.widgetUrl} data-booking>`: without JS it opens the Hospres page; with JS it opens the modal | Delegated listener |
| `BookingModal` | Native `<dialog>` shell + provider slot (§8) | Loaded on first open |
| `CookieBanner` | Accept / Reject with equal weight; "Cookie settings" link in the footer reopens it | ~3 KB |
| `Footer` | Philosophy line, hours, address, phone, info@, privacy, social (D10) | — |
| `HoursChip` | "Open today · 12–2 & 5–10" / "Closed today, we reopen Tuesday" (§5.2) | ~1 KB |
| `SmoothScroll` | Boots Lenis, ScrollTrigger and the effect registry on pages that have effects | Lazy |
| `CandleCursor` | Menu page only (§7.5) | Menu only |
| `MockBadge` | Small corner badge, e.g. "Mock data · 37 values", in dev and staging; links to the content report | Dev/staging only |
| `Picture` | `<picture>` with AVIF/WebP `srcset`, width/height, `sizes`, LQIP background | — |
| `VideoBackground` | Poster first, decides whether to play, pause button (§6.2) | Small |

### 4.2 Pages → sections (PAGES.md)

| Page | Section (PAGES.md) | Component | Effects |
|---|---|---|---|
| Home | 1 Hero | `HomeHero` (VideoBackground, headline, `RotatingBadge`, HoursChip) | Intro timeline, badge rotation |
| | 2 Philosophy | `Philosophy` | Word reveal tied to scroll |
| | 3 Venue teaser | `StairDescent` (teaser variant) | Pinned stair descent (desktop) |
| | 4 Featured menu | `FeaturedDishes` | Dim → lit on hover, focus or centre of screen |
| | 5 Wine strip | `WineMarquee` | Slow marquee; pauses on hover and focus |
| | 6 Booking band | `BookingBand` | Image unmask / optional video |
| | 7 Find us teaser | `FindUsTeaser` (StaticMap) | Unmask |
| Menu | Tabs | `MenuTabs` (sticky; Wine label from `wine.json` `tab.label`) | Scroll-to + hash update |
| | Menu, Dessert | `MenuSection` → `DishCard` (Picture, tags, `AllergenToggle`), `SideList`, `AllergenKey` | Candle lighting |
| | Wine | `WineList` (groups), `BarSection` (uniformPrice / price / priceColumns shapes), `AllergenKey` | Candle lighting on rows |
| Venue | 1 Opening | `VenueOpening` | Slow zoom on scroll |
| | 2 Descent | `StairDescent` (full variant) | Pinned steps, warmer and darker |
| | 3a Street, 3b Our story | `VenueStory` | Unmask, line reveals |
| | 4 Rooms | `RoomsGallery` | Pinned horizontal scroll (desktop), scroll-snap (mobile) |
| | 5 Details | `DetailsCollage` | Staggered unmask |
| | 6 Booking prompt | `BookingPrompt` | — |
| Find Us | 1 Map | `StaticMap` + `DirectionsLink` (§9.3) | — |
| | 2 Contact | `ContactBlock` | Line reveals |
| | 3 Parking | `ParkingCards` | — |
| | 4 Getting here | `GettingHere` (optional; hidden in production while its entries are mock) | — |
| | 5 Careers | `Careers` (mailto: careers@) | — |
| Privacy | Policy | `LegalText` (CONTENT.md §7, as is) | None |

## 5. Data flow

### 5.1 JSON → Zod → pages

```
data/*.json ──import──▶ src/content/schemas.ts  (Zod, .strict())
                         │  parsed at build; any error aborts the build
                         ▼
                  src/content/index.ts → typed Site, Menu, Desserts, Wine, Allergens, Venue, Seo
                         │  cross-file checks (below)
                         ▼
                  pages and components render static HTML
```

| Schema | Key rules |
|---|---|
| `site` | Hours as `weekday → [{open, close}]` in `HH:MM`, close after open; closures `MM-DD`; parking `walkingMinutes {value, mock}`; `address` and `geo` may carry `mock` |
| `menu`, `desserts` | Ids unique across both files; `price` > 0 with at most 2 decimals; `tags ⊂ {v, n}`; `image` is null or a key in the image manifest; `photoMatch ∈ {clear, likely, none}` |
| Allergens on any item | `allergens: null \| [] \| [{name, canBeOmitted}]`; every `name` is in `allergens.json` categories; `allergenVariants` only when `allergens` is null; `allergenSource ∈ {client, estimated, null}`; `allergenSource: null` requires `allergens: null` |
| `wine` | `tab {id, label}`; wines: `glass` nullable, `bottle` required; drinks sections are a discriminated union of the three shapes (`uniformPrice`, per-item `price`, `priceColumns` with `prices` keyed by column id) |
| `venue` | `fact.needsVerification` boolean; every image is `{mock, src, alt}` |

Keys starting with `_` are notes for humans; the loaders strip them.

**Field name note:** this task's brief says `"source": "estimated"`; the data (Update 1) uses `allergenSource: "estimated"`. The schemas use `allergenSource`.

### 5.2 Hours chip

- Rendered statically with the weekly summary from `site.json` (e.g. "Tue–Sat · 12–2 & 5–10"). That is always true, so no-JS visitors and the first paint are correct, and nothing shifts.
- A 1 KB script then computes today's state in the browser with `Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', … }).formatToParts(new Date())`. That gives London's local weekday, date and time whatever the visitor's own time zone, and handles BST/GMT changes without a date library.
- Order of checks: closure (`MM-DD` range, which may wrap over New Year) → weekly sessions → next open day (looks ahead up to 31 days, skipping closures).
- Re-runs on `visibilitychange`, so a tab left open overnight updates.
- Unit tests freeze the clock at: a Tuesday lunchtime, a Monday, a Saturday at 23:00, inside the 1–14 January closure, and around the clock changes on 25 Oct 2026 and 28 Mar 2027 (UTC moments that fall on different London dates).
- The wording of a "between sessions" state and of closures depends on Q13 and Q14.

## 6. Asset pipeline

### 6.1 Images: `scripts/images.ts` (sharp)

| Step | Detail |
|---|---|
| Inputs | Every `image` in `menu.json` and `desserts.json`, plus `config/images.ts` for textures, venue and OG images. Source folder from `ASSET_SRC` (default `../sotto sotto assets/`) |
| Outputs | `public/img/dishes/<dish-id>-<w>.avif` and `.webp` at widths 480, 800, 1200 and the source width (1535 now; 2400 once 3000 px originals arrive). Named by dish id, not by file name |
| Quality | AVIF about q50, WebP about q72 to start, tuned by eye in M2. Warns when the 1200 px file is over 300 KB |
| Manifest | `src/content/image-manifest.json`: `{ key: { width, height, lqip, sources, sourceHash } }`. Zod cross-checks every `image` against it |
| Cache | Skips any file whose source hash is unchanged |
| Git | Generated files are committed; originals stay out of git (D36) |

**Adding or swapping a dish photo:** put the original in the assets folder → set the dish's `image` (and `photoMatch`) in the JSON → run `npm run images` → commit the JSON and the new files in `public/img/`.

`next/image` is not used for dishes (static export cannot optimise it): the originals live outside `src` and have spaces in their names, and the manifest keeps us host- and framework-neutral.

### 6.2 Video: `scripts/video.sh` (ffmpeg)

| Output | Settings (starting point) |
|---|---|
| `hero-1080.mp4` | H.264, CRF about 26, `-preset slow`, `-an` (no audio track), `-movflags +faststart` |
| `hero-720.mp4` | Same, for phones |
| `hero-1080.webm` | VP9, CRF about 34 |
| `hero-poster.*` | A frame from the loop → image pipeline (AVIF/WebP, under 200 KB) |

The script fails if the 1080p MP4 is over 4 MB. ffmpeg is a system tool; installing it needs your OK (Q46).

**Playback rules (`VideoBackground`):**
1. HTML ships `<video muted playsinline loop preload="none" poster>` with no `src`. The poster `<img>` is the LCP element, preloaded with `fetchpriority="high"`.
2. After `load`, JS adds the sources and plays only if: no reduced motion, `navigator.connection.saveData` is not set, `effectiveType` is not `slow-2g`, `2g` or `3g`, and the page is visible. It picks 720p under 1024 px wide.
3. Pauses when off screen and when the tab is hidden.
4. A visible pause/play button (WCAG 2.2.2, motion over 5 s); the choice is remembered for the session.

### 6.3 Fonts

`next/font/google` for Spectral (300), Spectral SC (300) and Hanken Grotesk (variable). Fonts are downloaded at build time and served from our own domain. Subsets `latin` + `latin-ext` (the menu has à, è, ù, ï, ç, é). `display: swap`. Preload only the two faces above the fold (Spectral and Hanken); Spectral SC is not preloaded. Fallback fonts tuned with `size-adjust` / `ascent-override` to keep CLS near zero. Budget: at most 4 files (DESIGN_SYSTEM §5). Fonts change only if the client supplies brand fonts (Q31).

## 7. Motion architecture

### 7.1 One registry

- Markup declares effects: `<h2 data-effect="reveal-lines">`, `<section data-effect="stair-descent">`.
- `src/motion/registry.ts` holds one `gsap.matchMedia()` with three conditions:

| Condition | Media query | Behaviour |
|---|---|---|
| `desktop` | `(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)` | Lenis, pinned and scrubbed sections, parallax, candle cursor |
| `mobile` | `(max-width: 1023px), (pointer: coarse)`, with no reduced motion | Native scroll, no pinning, simple reveals, centre-of-screen menu lighting |
| `reduced` | `(prefers-reduced-motion: reduce)` | Everything static and visible; dishes fully lit; video shows the poster |

- Each effect file exports `{ desktop?, mobile?, reduced? }`. The registry runs the matching function for every element. When a query flips (window resized, OS setting changed), `matchMedia` reverts the old effects and runs the new set automatically.
- Effects load with dynamic `import()` only when their `data-effect` exists on the page, so the Privacy page loads no motion code.

### 7.2 No hidden content without JS

Reveal start states (hidden lines, masked images) apply only under `html.motion-ready`, a class the motion boot adds. Without JS, before JS, or if an effect fails, content is visible. A failsafe removes the class if boot hasn't finished within 3 s.

### 7.3 Cleanup

With `next/link` the root layout stays mounted between pages, so cleanup is explicit:
- `MotionProvider` (Client Component in the root layout) owns Lenis and the `gsap.matchMedia()` instance.
- Each page's effects are created inside a `gsap.context()` scoped to that page's root element, from a `useMotion(ref)` hook. The hook's cleanup calls `ctx.revert()` on unmount, which kills that page's ScrollTriggers and inline styles.
- On every `usePathname()` change the provider scrolls to the top (or to the hash) with `lenis.scrollTo(…, { immediate: true })` and calls `ScrollTrigger.refresh()` once the new page has painted.
- Lenis itself lives for the whole visit and is destroyed only when the provider unmounts.
- Page transitions: a short GSAP fade on the page container in M3 (off under reduced motion). React's `<ViewTransition>` can replace it once it is stable in Next.js.

### 7.4 Pinned sections

| Section | Desktop | Mobile | Reduced motion |
|---|---|---|---|
| Stair descent (Home teaser, Venue) | Pinned for about 3–4 viewport heights; steps swap with a vertical slide; warm dark overlay 0 → 45% | Not pinned: photos stacked with the same darkening per photo, fading in | Stacked, no animation |
| Rooms gallery | Pinned horizontal scroll | Native horizontal scroll with `scroll-snap` | Native scroll |
| Philosophy word reveal | Scrubbed opacity | Scrubbed opacity (cheap) | Full text visible |

`ScrollTrigger.config({ ignoreMobileResize: true })` avoids jumps when the iOS address bar hides. Text splitting keeps the real sentence for screen readers (split spans are `aria-hidden` with an `sr-only` copy, or SplitText's built-in aria option).

### 7.5 Candle effect (Menu page)

| Option | Cost per frame | Mid-range laptop / phone | Accessibility | Verdict |
|---|---|---|---|---|
| **DOM + CSS (opacity/transform layers)** | Moves 2 small elements with `transform`; toggles `opacity` on one overlay per dish | Smooth, compositor only; on phones only the lit item changes | Real text; focus and screen readers untouched | **Recommended** |
| 2D canvas overlay | Full-viewport redraw each frame at device pixel ratio, kept in sync with DOM positions while scrolling | Risk of jank on 4K screens and phones; battery | Neutral, but text contrast under the overlay is hard to guarantee | Rejected |
| WebGL (shader light) | GPU shader plus a 30–150 KB library | Best-looking falloff; heavier on battery; context loss to handle | Same as canvas; still needs a full fallback | Rejected (could revisit for the hero only) |

How it works:
- **Dim state:** each dish photo has a dark overlay (`::after`, `--ink-950`, opacity about 0.7). Unlit text uses `--bone-500` (5.28:1, passes AA); text is never dimmed with opacity (Q24).
- **Lit state:** class `is-lit` sets the overlay to 0, text to `--bone-100`, and fades in a soft radial pool of light (`::before`, `--amber-300` at 10–15%) behind the card. Only `opacity` transitions.
- **Three inputs, one state:** a dish is lit by pointer enter (fine pointer), by being in the centre band of the screen (IntersectionObserver with `rootMargin: -45% 0 -45% 0`, coarse pointer), or by focus (`:focus-within`, including the allergen toggle). Wine and bar rows use the same logic.
- **Flame cursor:** a small inline SVG moved with `transform: translate3d()` in a `requestAnimationFrame` loop with slight easing, plus a 240 px radial glow element. `cursor: none` only inside the dish grid; the normal cursor returns over links, buttons, tabs, the allergen toggle and the booking modal. Flicker: slow opacity ±5% keyframes.
- **Spark:** 5–6 dots in a CSS keyframe burst, 400 ms, once per enter.
- **Reduced motion:** no flame, glow, spark or flicker; every dish lit.
- **Proved first** in M2 with a performance trace on a mid-range laptop and a real phone.

## 8. Booking modal

### 8.1 Phase 1 (now)

- Every Book button is a real link to `https://app.hospres.com/YO7Z73/reserve` (`target="_blank" rel="noopener"`). That is the no-JS fallback.
- With JS, one delegated listener catches `[data-booking]` clicks and opens the modal instead.
- Shell: native `<dialog>` with `showModal()`, which gives focus trapping, Escape to close and an inert page. We add: focus returns to the opener, `lenis.stop()` and scroll lock, a blurred and dimmed backdrop, a centred panel on desktop and a full-height sheet sliding up on phones, the heading "Book a Table" and the note "Sotto Sotto is a very small restaurant and booking is strongly recommended."
- The iframe is created on first open (no third-party request or cookie before the visitor asks to book) and kept for the rest of the visit. A loading state shows until the iframe's `load` event; if it hasn't loaded in 10 s, show "Open the booking page" (the same link).
- Iframe: `title="Book a table at Sotto Sotto"`, `referrerpolicy="strict-origin-when-cross-origin"`. Height: fixed inside the panel with internal scrolling, because the widget's inner size is unknown (Q25).

### 8.2 Seam for Phase 2

```ts
// src/booking/types.ts — sketch
interface BookingProvider {
  mount(container: HTMLElement, ctx: { close(): void }): Promise<void>;
  unmount?(): void;
}
```

- `providers/hospres-iframe.ts` is Phase 1. `providers/hospres-api.ts` (Phase 2) renders date → party size → times → details → confirmation inside the same container.
- The shell picks the provider from `site.json` `booking.phase`. Nothing outside `src/booking/` changes.
- **Constraint to note now:** if the Hospres API needs a secret key, it cannot be called from a static site. Phase 2 would then need one small serverless function (Cloudflare Pages Functions / Workers, Netlify or Vercel Functions, or a route on the VPS) as a proxy. That is the only backend the plan foresees, and it depends on the API docs (Q8).

## 9. Consent, analytics and map

### 9.1 Load order

| # | What | When |
|---|---|---|
| 1 | HTML, critical CSS, poster image, 2 fonts | First paint |
| 2 | Motion boot and page effects | After first paint (module scripts are deferred) |
| 3 | Hero video sources | After `load`, if allowed (§6.2) |
| 4 | Consent check | On idle: if consent was given, load GA4; otherwise show the banner (small bottom bar, not an LCP candidate, does not cover the Book button) |
| 5 | Static map image | Lazy, when near the viewport |
| 6 | Hospres iframe | Only when the booking modal opens |

### 9.2 Consent and GA4

- Own banner with two choices, "Accept analytics" and "Reject", of equal prominence. Necessary storage needs no consent. The choice is stored in `localStorage` (`consent.v1`: `{ analytics, version, date }`) and asked again when the version changes. A footer link, "Cookie settings", reopens it.
- **Consent Mode v2, basic mode:** `gtag.js` is not requested at all until consent. On "Accept": set `consent default` with `analytics_storage: granted` and `ad_storage`, `ad_user_data`, `ad_personalization` all `denied`, then load GA4 `G-2TMCMCTHRD`. Google Signals and ads features stay off. On withdrawal: `consent update` to denied, delete `_ga*` cookies, stop loading GA4.
- Advanced mode (cookieless pings before consent) is rejected: it sends data to Google before the visitor chooses, which goes against D16.
- A library (e.g. vanilla-cookieconsent, MIT) is the fallback if more categories appear later. A commercial consent platform is not needed for one tag.
- **Privacy policy:** used as is (D25). It mentions neither Google Analytics nor Hospres. The client should know about this mismatch (Q22).

### 9.3 Map options

| Option | Dark style + custom pin | Cost | Key | Privacy / cookies | Verdict |
|---|---|---|---|---|---|
| Maps JavaScript API | Yes (cloud Map ID) | Free monthly quota, then billed per load; needs a billing account | Yes, referrer-restricted | Loads Google scripts; must wait for consent or a click | Optional upgrade |
| Maps Embed API (iframe) | No dark style, no custom pin | Free | Yes | Google iframe sets cookies → consent | Rejected (cannot match the design) |
| Static Maps API image | Yes | Free quota, then billed | Yes | Every view calls Google; the terms forbid self-hosting the image | Rejected |
| **Self-hosted map image/SVG** (drawn from OpenStreetMap data, credited "© OpenStreetMap contributors") + **"Get directions"** link | Yes, fully ours | £0 | No | No third party at all | **Recommended** |

"Get directions" uses the documented Maps URL `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`, which opens Google Maps (app or site) with no key. The map art is made once the real pin is confirmed (Q1); until then it uses the mock pin, and the badge counts it. If the client wants an interactive map, a "Show interactive map" button can load the Maps JS API after a click (Q43).

**This changes PAGES.md** ("Google Map styled dark"). Needs your approval (D42).

## 10. SEO and security

### 10.1 SEO

- Per-page `<title>`, description, canonical, Open Graph and Twitter tags from a new `data/seo.json` (added in M1, flagged mock until Q21 is answered).
- OG images: one 1200 × 630 static image per page, produced by the image pipeline.
- `sitemap.xml` from the route list; `robots.txt` per environment (staging: `Disallow: /` plus `X-Robots-Tag: noindex`).
- JSON-LD `Restaurant` built from `site.json`: `name`, `url`, `telephone`, `address`, `geo`, `openingHoursSpecification` (Tu–Sa 12:00–14:00 and 17:00–22:00), `servesCuisine: "Italian"`, `menu` (/menu), `acceptsReservations` (Hospres URL), `sameAs` (social links). **Any field whose source object is `mock`, `toConfirm` or unconfirmed is left out, in every environment**, and a unit test asserts it.
- Old URLs: `/pdf/menu.pdf` → `/menu#menu`, `/pdf/Dessert.pdf` → `/menu#dessert`, `/pdf/winelist.pdf` → `/menu#wine` (301s in the host's redirect file). Not every static host can match query strings, so links like `/?p=menu` are handled by a tiny inline script on `/` that maps `?p=menu|venue|contactus|privacy` to the new routes.

### 10.2 Security headers

One source, `config/headers.ts`, emitted after the build by `scripts/emit-headers.ts` as `_headers` (Cloudflare Pages / Netlify), a `vercel.json` block and `nginx/security-headers.conf`. Switching host does not mean rewriting the policy.

| Header | Value (starting point) |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src https://app.hospres.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests` (Maps domains added only if D42 changes) |
| `Strict-Transport-Security` | `max-age=31536000` first; add `includeSubDomains` only after checking every subdomain (e.g. webmail) serves HTTPS; `preload` later |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()`; `payment` to be tested with the Hospres iframe (deposits may be taken there) |
| `X-Frame-Options` | `DENY` (legacy, alongside `frame-ancestors`) |

- **Next.js static export puts inline bootstrap scripts in every page**, and they change on every build, so the CSP uses `script-src 'self' 'unsafe-inline' https://*.googletagmanager.com` instead of hashes. Mitigations: no `eval`; no user input is ever rendered as HTML; third-party origins stay on an allow-list; `frame-ancestors 'none'`, `object-src 'none'` and `base-uri 'self'` stay strict. Next.js also inlines some styles, so `style-src 'self' 'unsafe-inline'`.
- JSON-LD is a data block and is not affected by `script-src`. Style changes GSAP makes through JavaScript are not blocked by `style-src`.
- The CSP ships as `Content-Security-Policy-Report-Only` on staging first, then is enforced.

## 11. Environments, mock guard and quality

### 11.1 Environments

| `SITE_ENV` | Mock data | Badge | Indexing | Estimated allergens |
|---|---|---|---|---|
| `development` | Allowed | Shown | n/a | Not rendered |
| `staging` | Allowed | Shown | `noindex` + robots disallow; protected (Cloudflare Access or basic auth) | Not rendered |
| `production` | **Build fails** while any flagged value remains | Never | Indexed | Not rendered until `allergenSource` becomes `client` |

### 11.2 Mock guard

- `scripts/content-report.ts` walks every raw JSON file and lists each JSON path with `mock: true`, `toConfirm: true`, `needsVerification: true`, `allergenSource: "estimated"`, `addressMissing: true` or `confirmed: false`. It writes `content-report.json` and prints a table. The report doubles as the client chase list.
- `npm run build` runs it first. In production it exits non-zero while the list is not empty. The only override is `ALLOW_MOCK_IN_PRODUCTION=yes-i-know`, which prints the list in the build log, keeps the badge visible and adds `noindex`. It is for emergencies, not for launch.
- Rendering rules, enforced in components and unit tests:
  - `allergens: null` → render nothing.
  - `allergens: []` with `allergenSource: "client"` → "None of our listed allergens" (wording Q35).
  - `allergenSource: "estimated"` → render nothing, in every environment.
  - `allergenVariants` → one labelled line per variant.
  - Mock values never appear in JSON-LD (§10.1).

### 11.3 Checks

| Check | Every push (CI) | Before every deploy |
|---|---|---|
| `tsc --noEmit` (strict), ESLint, Prettier | ✓ | ✓ |
| Zod content validation + content report | ✓ | ✓ (production: report must be empty) |
| Vitest: schemas, hours, allergens, mock guard, JSON-LD, tokens/contrast | ✓ | ✓ |
| Playwright smoke: each route loads with no console errors; Book opens and closes the modal by mouse and keyboard; tabs update the hash; `prefers-reduced-motion` shows all content; the no-JS Book link points to Hospres | ✓ | ✓ |
| axe-core scan (through Playwright) on every route | ✓ | ✓ |
| Lighthouse CI (mobile) on Home and Menu with budgets: LCP < 2.5 s, CLS < 0.1, TBT < 200 ms; JS per page (first load, gzip) Home ≤ 160 KB, Menu ≤ 150 KB, Privacy ≤ 110 KB. These include the React + Next.js runtime; exact figures are measured in M1 and tightened | — | ✓ |
| Header check on the deployed preview (CSP present, no CSP violations in the console) | — | ✓ |

## 12. Next.js specifics

| Topic | How |
|---|---|
| Versions | Pinned exact versions, each released at least two weeks before install (Next.js 16.4.x, React 19.x, Zod 4, GSAP 3.15, Lenis 1.3). TypeScript 6 (TypeScript 7 is the new native compiler; its compatibility with Next.js type-checking is not yet relied on) |
| Config | `output: "export"`, `trailingSlash: true` (each route becomes `route/index.html`, which every static host serves without rewrites), `images: { unoptimized: true }` (our `Picture` component does the work) |
| Ruled out by static export | Middleware, ISR, server actions, dynamic route handlers, `next/image` optimisation, `headers()` / `redirects()` / `rewrites()` in `next.config` (all move to host files, as planned) |
| Server vs client | Pages and sections are Server Components (static HTML). Client Components only for: Header scroll state, MobileNav, HoursChip, MotionProvider and effects, Menu tabs and candle, BookingModal, CookieBanner, VideoBackground, MockBadge |
| Data | JSON imported in Server Components only, so content never ships as a JS bundle. Client Components receive only the props they need (e.g. the HoursChip gets the hours object) |
| Metadata | `generateMetadata` / `metadata` per route from `seo.json`; `app/sitemap.ts` and `app/robots.ts` (both work with static export) |
| Hash routes | `/menu#dessert`: tabs use `history.replaceState`; on load the provider scrolls to the hash after layout |
| Phase 2 | Leave static export, or deploy a separate function (D48) |

## 13. Hosting

| Option | Cost (check current terms) | Headers / redirects | Previews | Ops burden | Notes |
|---|---|---|---|---|---|
| **Cloudflare Pages** | Free tier allows commercial use; generous bandwidth | `_headers`, `_redirects` | Per branch; can be protected with Cloudflare Access | None | Apex domain is simplest with DNS on Cloudflare. Cloudflare is moving Pages towards Workers static assets; the same `dist/` works on both |
| Netlify | Free tier with credit-based limits | `_headers`, `_redirects` (can match query strings) | Per branch | None | Similar to Cloudflare; smaller free allowance |
| Vercel | Hobby plan is non-commercial, so a restaurant needs Pro (per seat, monthly) | `vercel.json` | Per branch | None | Made by the Next.js team, but a static export gains nothing from it |
| VPS + Nginx | Fixed monthly VPS fee | Nginx conf (we emit it) | Only if we build it | TLS renewals, OS patching, monitoring, backups | Full control; most work |

**Recommendation: Cloudflare Pages.** Lock-in is low: the output is plain files, and headers and redirects are generated for every host from one source.

**Deploy steps (Cloudflare Pages):**
1. Create the Cloudflare account under the client's or the agency's ownership (Q41). Connect the GitHub repo; root directory `SottoSotto-Code`; build `npm ci && npm run build`; output `dist`; pin the Node version.
2. Set `SITE_ENV=staging` for preview branches and `SITE_ENV=production` for `main`. Protect previews with Cloudflare Access (reviewer emails).
3. Before any DNS change: list every existing DNS record, especially **MX, SPF, DKIM and DMARC for the info@ and careers@ mailboxes**, and recreate them first (Q42). Lower TTLs a day ahead.
4. Add `www.sottosotto.co.uk` and the apex as custom domains; redirect one to the other (Q42).
5. Cut over; check HTTPS, headers, the redirects for old PDF and `?p=` links, booking, and GA4 after consent.
6. Submit the sitemap in Search Console; update Google Business Profile hours and links (Q11).
7. After a stable week, add `includeSubDomains` to HSTS if safe.

## 14. Risks

| Risk | Impact | De-risk |
|---|---|---|
| Candle effect looks cheap or stutters | Flagship feature fails | Prototype first (M2) with a performance trace on a mid-range laptop and a real phone; the CSS approach keeps work on the compositor |
| Client assets late (video, venue photos, logo) | Home and Venue judged on placeholders | Neutral placeholders sized like the real assets; layouts don't depend on specific images; the content report tracks what's missing |
| Dish photos low-res or not real (Q5) | Soft images on large screens; misleading | Cap displayed width at the source width; raised in Q5 |
| Mock data blocks launch | Can't go live | The production guard makes it visible early; the report is the weekly chase list |
| Allergen information incomplete for UK guests (Q38) | Guest safety, reputational and legal exposure | Render only client data; null vs [] tested; estimated never rendered; the "tell staff" note always shown |
| Hospres iframe: mobile size, cookies, payment step | Booking friction | Spike in M2 inside the sheet on iOS and Android; link fallback after 10 s |
| Hospres API needs a secret (Phase 2) | Static-only no longer enough | Provider seam + one serverless proxy when needed |
| CSP breaks GA4 or Hospres | Silent tracking or booking failure | Report-Only on staging; Playwright checks for CSP violations |
| GSAP licence terms change | Legal | Pin the version, keep the licence file, review on upgrade |
| DNS cutover breaks email | info@ and careers@ stop working | Copy all records first; test mail before and after |
| iOS Safari scroll quirks with pinning | Jank, jumps | No pinning on mobile; real-device testing in M8 |
| Smooth scroll hurts usability | Accessibility complaints | Lenis on desktop only, native scroll position, off under reduced motion |
| Next.js JS baseline pushes LCP/INP | Performance targets missed | Server Components by default; motion code loaded per page with dynamic `import()`; Lighthouse CI budgets |
| Scroll effects leak across client navigations | Broken pins, memory growth | `gsap.context()` per page + provider cleanup (§7.3); Playwright test navigates Home → Menu → Venue → Home and checks the ScrollTrigger count |
