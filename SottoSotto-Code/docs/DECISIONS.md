# Decisions

Decisions already made with the client and team. Do not reopen without the user. Add new rows at the bottom with a date.

| # | Decision | Detail | Date |
|---|---|---|---|
| D1 | Navigation | Home, Menu, Venue, Find Us, plus an always-visible "Book a Table" button. No Careers page. | 2026-11-12 |
| D2 | Careers | A section at the bottom of Find Us only. Not linked from the footer. Uses the current site's careers text and the careers@ email. | 2026-11-12 |
| D3 | Contact page | Renamed to "Find Us". | 2026-11-12 |
| D4 | Menu data | Hardcoded data files (`data/*.json`). No admin panel or CMS for now. | 2026-11-12 |
| D5 | Menu source | The PDF menus are final. Content is in `data/menu.json`, `desserts.json`, `wine.json`. | 2026-11-12 |
| D6 | Opening hours | 5 days: Tuesday–Saturday, 12:00–14:00 and 17:00–22:00. Closed Sunday and Monday. | 2026-11-12 |
| D7 | Address | Mock data for now. The current site shows both "10 N Parade" and "12a North Parade"; the real address will come from the client. | 2026-11-12 |
| D8 | Parking | Mock data for now (car park name, walking time, a note). Real list will come from the client. Shown as text/cards, not on the map. | 2026-11-12 |
| D9 | Videos | Supplied by the client. Use a placeholder clip and poster until then. | 2026-11-12 |
| D10 | Footer (every page) | Short philosophy line, hours, address, phone, info@ email, privacy policy link, social links. No careers link. | 2026-11-12 |
| D11 | Booking | Phase 1: existing Hospres widget inside our own redesigned modal. Phase 2: custom booking UI on the Hospres API once the client provides access. | 2026-11-12 · replaced by D59 |
| D12 | Venue extras | No accessibility details or private hire section for now. | 2026-11-12 |
| D13 | Technical access | Domain, DNS, Analytics and Google Business Profile access come later, before launch. | 2026-11-12 |
| D14 | Side dishes | No photos yet. Shown text-only for now; photos will be requested later. | 2026-11-12 |
| D15 | Removed content | Award badges (Bath Good Food Awards 2012/2014), PDF menus, and any events, testimonials, shop or Instagram feed sections. | 2026-11-12 |
| D16 | Analytics | Universal Analytics `UA-46473274-1` removed. GA4 `G-2TMCMCTHRD` kept and loaded only after cookie consent. | 2026-11-12 |
| D17 | Food menu source | The client's "Food Menu November 26" replaces the website PDF for savoury dishes. Client's own descriptions used. Prices changed: Bruschetta ai gamberoni £12.75 → £12.95, Baccalà impanato £12.50 → £12.75. No dishes added or removed. Supersedes D5 for `menu.json`. | 2026-11-14 |
| D18 | Desserts and cheese | Not on the November menu but still served. `desserts.json` kept as it was, prices included; only allergens added. | 2026-11-14 |
| D19 | Bar menu | Whole bar menu goes on the Wine tab, after the wines, in `wine.json` `drinks`. Tab keeps the name "Wine"; it may become "Drinks" later, and that change is only `wine.json` `tab.label`. Prosecco & Champagne is not duplicated. Text only. | 2026-11-14 |
| D20 | Allergen list | Allergens shown exactly as the client's forms list them: Celery, Gluten, Crustaceans, Eggs, Fish, Garlic/Onion, Lactose, Molluscs, Mustard, Nuts, Sesame seeds, Fennel seeds, Soya, Citrus. No categories added, removed or renamed; no outside standard followed. Key: x = contains, x\* = can be done without. Stored in `data/allergens.json`. | 2026-11-14 |
| D21 | Allergen display | Small and quiet on the Menu page (toggle or small labels), key once per section, general note kept. Items with no data show none. Gelato / Sorbetto keeps one item with two allergen sets. | 2026-11-14 |
| D22 | Estimated allergens | Bellini, Hugo Spritz and Aperol Spritz are not on the bar allergy form. The team estimated them from ingredients and standard serves (`allergenSource: "estimated"`). Client to confirm. | 2026-11-14 |
| D23 | Address (mock) | Mock street address is now "10 North Parade, Bath" with a mock pin on North Parade. Supersedes the mock value under D7. | 2026-11-14 |
| D24 | Contact details | Phone, info@ and careers@ from the current site are placeholders, flagged "to confirm". | 2026-11-14 |
| D25 | Privacy policy | Current site's policy text used as is, with no changes. | 2026-11-14 |
| D26 | Parking | Real car parks from the client replace the mock list: Sports and Leisure Centre car park, Manvers Street Car Park, Bath Cricket Club Public Car Park. Walking times are mock; the Cricket Club address is missing. Updates D8. | 2026-11-14 |
| D27 | Venue story | The client's North Parade text is the setting for the Venue page's story section, not the restaurant's own story. Kept exactly as supplied, marked `needsVerification`. The restaurant's own story is a MOCK placeholder. | 2026-11-14 |
| D28 | Booking | Phase 1 only (Hospres widget in our modal). No API work until the client gives access. Confirms D11. | 2026-11-14 · replaced by D59 |
| D29 | Bar menu spelling | Corrected from the client's files (client to confirm): "Carla Blanca" → Carta Blanca, "Capirinha" → Caipirinha, "greenage" → greengage, "crips" → crisp, "standard mix" → standard mixer. The original spelling is kept as `_clientSpelling` on the affected items in `wine.json`, except for "crisp", where the source does not say which note had it. | 2026-11-14 |

## 2026-11-14 — Update 1: client menus, allergy forms and location info

The client sent the Food Menu November 26, the Wine Menu October 26, the bar menu, two allergy forms (food, April 2026; bar), a car park list and a North Parade summary.

| Area | What changed | Files |
|---|---|---|
| Food | Client wording for all 23 dishes; two price rises; allergens on every dish | `data/menu.json` |
| Desserts | Allergens added (Gelato / Sorbetto as two sets; cheese has none on the form). Names, descriptions and prices unchanged | `data/desserts.json` |
| Wine | Full tasting notes; wines, vintages and prices unchanged | `data/wine.json` `groups` |
| Bar | 10 new sections, 89 items; tab label in data | `data/wine.json` `drinks`, `tab` |
| Allergens | Client's 14 categories, key and general note in one place | `data/allergens.json` (new) |
| Find Us | Real car park names and addresses; mock walking times | `data/site.json` `parking` |
| Venue | North Parade setting (needs verification), MOCK restaurant story, photo placeholders | `data/venue.json` (new) |
| Mocks | Address changed to "10 North Parade"; contact "to confirm"; social, closures, logo, brand and videos flagged | `data/site.json` |
| Docs | Pages, content, assets, brief, design system note, agent rules, open questions | `docs/*`, `CLAUDE.md` |

## Architecture decisions (2026-11-14)

Approved by the user on 2026-11-14, with D30 changed to Next.js. D47 hosting is a recommendation only; the host and account owners are deferred (Q41, Q42). Detail and reasons: `ARCHITECTURE.md` (section in brackets).

| # | Decision | Detail | Status |
|---|---|---|---|
| D30 | Framework | Next.js App Router + React, TypeScript strict, static export (`output: "export"`). Astro was proposed and declined by the user (§2.1, §12) | Approved |
| D31 | Navigation | `next/link` client navigation; `MotionProvider` + per-page `gsap.context()` revert effects on every route change (§7.3) | Approved |
| D32 | Styling | CSS Modules + CSS custom properties generated from DESIGN_SYSTEM.md; no Tailwind (§2.2) | Approved |
| D33 | Motion | GSAP + ScrollTrigger (+ SplitText), Lenis on desktop only; one `gsap.matchMedia()` registry with desktop / mobile / reduced modes; effects loaded only where used; content visible without JS (§2.3, §7) | Approved |
| D34 | Candle effect | DOM + CSS layers animating only `opacity` and `transform`; canvas and WebGL rejected (§7.5) | Approved |
| D35 | Content validation | All `data/*.json` parsed with strict Zod schemas at build, with cross-file checks; build fails on invalid data; `_` keys stripped (§5.1) | Approved |
| D36 | Images | Own `sharp` script → AVIF + WebP at 480/800/1200/source width, named by dish id, with a manifest. Generated files committed; originals kept out of git (§6.1) | Approved |
| D37 | Video | `ffmpeg` script → 1080p/720p MP4 (H.264) + WebM, no audio, ≤ 4 MB; poster is the LCP; plays only without reduced motion, Save-Data or slow connection; pause button (§6.2) | Approved |
| D38 | Fonts | `next/font/google`, self-hosted at build, latin + latin-ext, `swap`, 2 preloads, ≤ 4 files (§6.3) | Approved |
| D39 | Booking modal | Native `<dialog>` shell; Book buttons are real links to Hospres (no-JS fallback); iframe created on first open; `BookingProvider` interface so Phase 2 replaces only `src/booking/providers` (§8) | Approved · replaced by D59 |
| D40 | Consent | Own banner (Accept / Reject, equal weight); Consent Mode v2 in basic mode: GA4 not requested before consent; ads signals always denied (§9.2) | Approved |
| D41 | Third-party load order | Nothing third-party before first paint; GA4 only after consent; Hospres only when the modal opens (§9.1) | Approved · replaced by D59 |
| D42 | Map | Self-hosted static dark map (from OpenStreetMap data) + "Get directions" Google Maps link; no API key. **Changes PAGES.md "Google Map styled dark"**; interactive Google map only as a later click-to-load option (§9.3) | Approved |
| D43 | SEO | `data/seo.json` for titles and descriptions; JSON-LD `Restaurant` from `site.json` with every mock / to-confirm field left out; 301s for old PDF links; script redirect for `?p=` links (§10.1) | Approved |
| D44 | Security headers | One source (`config/headers.ts`) emitted for Cloudflare/Netlify, Vercel and Nginx; hashed CSP; Report-Only on staging first (§10.2) | Approved |
| D45 | Environments and mock guard | `SITE_ENV` development / staging / production; content report on every build; production build fails while flagged values remain (override only for emergencies); estimated allergens never rendered (§11) | Approved |
| D46 | Quality gates | Types, lint, Zod, Vitest, Playwright + axe on every push; Lighthouse CI budgets and header check before every deploy (§11.3) | Approved |
| D47 | Hosting | Cloudflare Pages recommended; output is plain static files, portable to Nginx, Netlify or Vercel (§13) | Recommendation; deferred |
| D48 | Phase 2 backend | If the Hospres API needs a secret key, Phase 2 adds one serverless proxy function; nothing else server-side (§8.2) | Approved (depends on Q8) · replaced by D59 |
| D49 | Branching | Pull request per change with a preview deploy; `main` is production | Approved |
| D50 | Placeholder hero video | Abstract dark loop generated with ffmpeg (no download) until the client's video arrives | Replaced by D51 |
| D51 | Placeholder hero video (M2) | A 22.5 s seamless loop made from 5 dish photos with slow push-ins, pans and crossfades (`npm run video`), replacing D50's abstract loop. Still mock until the client's video arrives (D9); `HERO_SRC=clip npm run video` swaps it in | Approved (user, 2026-11-14) |
| D52 | Video quality | x264 CRF 31 (`-tune film`) and VP9 CRF 38 instead of the CRF 26 / 34 starting points, to keep the 1080p MP4 under 4 MB; also a 720p WebM for phones. No visible difference under the hero overlay | Proposed in M2, for review |
| D53 | M2 review pages | `/lab/` (index, `/lab/candle/`, `/lab/hospres/` (removed, D59)): noindex, not in the sitemap, 404 in production builds. The hero prototype is the real Home hero | Proposed in M2 |
| D55 | Concrete background | The current site's wall tile (`sottosottobackground2.jpg`, downloaded with the user's OK; original in `sotto sotto assets/old-site/`) replaces the generated placeholder on every page. Highlights are soft-capped at `concrete-500` by `npm run images` (the contrast check enforces it); tiled down the page, at least 1440 px wide. The Menu page keeps a dimmed tone over it. The old site's rust top band is not used | Approved (user, 2026-11-14) |
| D56 | Candle on the real menu (M2) | `/menu` uses the candle for every dish, side, wine and bar row; dishes and sides get the allergen toggle; drink allergens wait for M4 (Q29) | Approved (user, 2026-11-14) |
| D57 | Motion loading (M3) | GSAP, ScrollTrigger, SplitText and the effects load when the browser is idle after hydration (not first-load JS); Lenis loads only on desktop. Effects set their own start states in JS, so no CSS hides content (§7.2 simplified: no `motion-ready` class needed). Home first-load JS: 140 KB gzip (the 39 KB `noModule` polyfill chunk is not loaded by modern browsers) | Proposed in M3 |
| D58 | Home copy and media (M3) | Section headings reuse existing labels only ("Venue", "Menu", "Find Us"); no new headings written. The booking band uses the Cicchetti della casa photo until the client's band media arrives (`media.bookingVideo`); venue descent uses marked placeholders (`venue.json` mock) | Proposed in M3 |
| D59 | Booking without Hospres | Hospres is removed (user, 2026-11-15). We build the guest booking screens ourselves: date (Monday-first calendar, closed days greyed) → guests (1–5) → time → details → confirmation, in a native `<dialog>` opened by every Book a Table link (centred panel; full-height sheet on phones) and on `/book/`, which is also the no-JS link. The screens talk to a `BookingProvider`; today a mock provider generates availability and books nothing, with a visible preview notice. The backend comes later (Q8). Replaces the Hospres iframe in D39/§8.1 and the Hospres-API plan in D48; booking rules are MOCK (Q50) | Approved (user, 2026-11-15) |
| D60 | Menu keyboard lighting (M4) | Rows without a focusable control (wines, most bar items) are not made tab stops (about 100 extra stops). Instead, when the keyboard scrolls the menu on desktop, the candle lights the item crossing the middle of the screen (as on phones); a real mouse movement hands it back to the pointer. Items with an allergen toggle light on focus in every mode | Proposed in M4 |
| D61 | Accessibility fixes from axe (M4) | Philosophy word reveal: the sentence is read once from a visually hidden copy and the split copy is aria-hidden; words start at 40% opacity (not 20%), so unrevealed text stays at least 3:1. axe (WCAG 2.2 AA) now runs on every route in the smoke tests | Proposed in M4 |
| D62 | Venue photos (M5) | Venue photos go through the same image pipeline as dishes, keyed `venue-<file name>` (`src/content/image-jobs.ts`); the content check fails with "run npm run images" if a `src` has no processed photo. Until then `VenuePhoto` shows a marked placeholder of the same size. The stair descent is one shared component (Home and Venue). Section names without agreed copy ("The descent", "The rooms", "Details") are screen-reader headings only | Proposed in M5 |
| D63 | Street photo from Wikimedia Commons (M5) | The Venue "The street" section uses an openly licensed photo of the River Avon from North Parade Bridge ("Bath, Somerset - 01.jpg", Benjamin Smith, CC BY-SA 4.0), downloaded with the user's OK. A credit line with links to the source and licence sits under it (`credit` in venue.json). Photos of the restaurant itself must come from the client: online photos of it are not ours to use | Approved (user, 2026-11-15) |
| D64 | Find Us map (M6) | `npm run map` draws `public/map/north-parade.svg` (about 1 km around North Parade, 73 KB gzip) from an OpenStreetMap extract fetched once from the Overpass API with the user's OK (ODbL, credited "© OpenStreetMap contributors"). Street and place labels are HTML text over the image; the pin is placed from `site.json` `geo`, so confirming the real pin (Q1) needs no redraw while it stays inside the box. Shown on Find Us and in the Home teaser. "Get directions" opens Google Maps; nothing third-party loads on the page | Approved (user, 2026-11-16) |
| D65 | Cookie banner and GA4 (M7) | `src/consent/`: own banner, Accept analytics / Reject as identical buttons, checked on idle; choice in `localStorage` `consent.v1` (`{ analytics, version, date }`), asked again when `CONSENT_VERSION` changes. Accept: Consent Mode v2 basic, `consent default` with analytics granted and the three ad signals denied, Google signals and ad personalisation off, then `gtag.js` for `G-2TMCMCTHRD`. Reject or withdrawal: `consent update` denied, GA disabled, `_ga*`/`_gid` cookies expired on the host and each parent domain. Footer "Cookie settings" button reopens the banner and takes focus. Banner wording is new and flagged `toConfirm` (Q52). Playwright stores a "Reject" for every spec except the consent spec. | 2026-11-16 |
| D66 | Hardening (M8) | JSON-LD `Restaurant` on Home from `site.json` via `src/lib/jsonld.ts`: a field is added only when its source object has no flag inside it (today: name, url, cuisine, menu, booking page and weekly hours; address, geo, telephone and social links are left out), unit-tested against every flagged value. Old `/?p=` links (`index`, `menu`, `venue`, `contactus`, `privacy`) are sent on by an inline script on `/`. One shared OG image (`npm run og`, 1200 × 630, Cicchetti della casa photo) on every page with `summary_large_image`. A Playwright test serves pages with the production CSP enforced and checks for no violations, GA4 after consent included. The booking flow is lazy-loaded on first open. First-load JS budgets (`npm run budget`, in CI) are the measured size plus about 5 KB: React DOM and the Next.js runtime alone are about 127 KB gzip, so §11.3's 110 KB for Privacy cannot be met. | 2026-11-16 |
| D67 | Staging and review (M9) | Staging deploys from a `staging` branch to Cloudflare Pages by direct upload from GitHub Actions (`deploy-staging.yml`), so CI's checks and the JS budget run before every deploy; switched on by the repository variable `STAGING_DEPLOY=on` once the account exists (Q41). The client review list is generated from the content report and the launch-blocking questions (`npm run review-list`) and checked for staleness in CI. | 2026-11-16 |
| D68 | Home rework (user, 2026-11-16) | Philosophy becomes an editorial spread (heading and Linguine con gamberi photo; first paragraph as a statement; no word-by-word dimming). The six featured dish cards are replaced by a "menu at a glance": one row per course from the data, linking to the menu tabs (the client no longer has to pick signature dishes; Q19 closed). The wine strip heading "From the cellar" (new copy from PAGES.md) becomes "Wine list" from the wine tab label. The Find Us teaser and map are removed from Home. On phones the venue teaser shows its heading and link first and the photos as a swipe row, instead of four full-height frames before any text. New link label: "See the full menu". | 2026-11-16 |
| D69 | Venue photos from the current website (user, 2026-11-16) | The client has not sent venue photos, so the 13 venue slots use photos from sottosotto.co.uk's own slideshows (`images/new/*.jpg`, `images/sotto_sotto-10.jpg`), downloaded into `sotto sotto assets/old-site/photos/`: corridor (opening); candelabra, candlelit vault, candle on stone, bar (descent); chef (story); dining vault, guests, bar shelf (rooms); cards, table, flaming cocktail, panna cotta (details). Alt text describes only what is visible. Each is `mock: false`, `toConfirm: true`, so the production guard still asks the client to confirm them (Q6). They are 500 × 350 px: soft at full screen; the pipeline does not upscale. Old dish photos are not used (they are not today's menu). | 2026-11-16 |
| D54 | Allergen toggle | Native `<details>`/`<summary>`: works without JS, keyboard and screen-reader ready; an open toggle lights its dish | Proposed in M2 |

## Not decided yet

| Topic | Where it is tracked |
|---|---|
| Hosting provider and account owners | D47 recommends Cloudflare Pages; deferred (Q41, Q42) |
| Design tokens (colours, fonts, motion values) | `DESIGN_SYSTEM.md` is a proposal; the developer handling design confirms |
| Everything else unknown | `OPEN_QUESTIONS.md` |
