# Build plan

> **Status: approved 2026-11-14.** Stack: Next.js static export (D30). M1 and M2 merged 2026-11-14 (M2 sign-off waits on the real-laptop candle trace; the Hospres test is dropped, D59). M3 merged 2026-11-15. Booking screens merged 2026-11-15 (D59). M4 merged 2026-11-15. M5 merged 2026-11-15. M6 merged 2026-11-16. M7 in progress on `m7-consent`. Each milestone ends with a short review; M2 is a hard gate.

Every milestone keeps CI green (types, lint, Zod, unit tests, Playwright smoke, axe) and updates `DECISIONS.md` / `OPEN_QUESTIONS.md` as answers arrive.

## M1. Foundations

**Deliverable:** an empty but real site: every route renders with the shared layout and real content data.

| Work | Detail |
|---|---|
| Scaffold | Next.js (App Router, `output: "export"`) + TypeScript strict in `SottoSotto-Code/`; ESLint, Prettier, Vitest, Playwright, CI workflow at repo root; `.gitignore` for `sotto sotto assets/`, `dist/`, `node_modules/` |
| Tokens | `tokens.css` and `tokens.ts` from DESIGN_SYSTEM.md; contrast check script |
| Fonts | `next/font/google` Spectral, Spectral SC, Hanken Grotesk; preloads; fallback metrics |
| Data | Zod schemas for all 6 files (+ new `seo.json`, flagged mock); loaders; cross-file checks |
| Mock guard | `content-report.ts`; production build fails while flagged values remain; `MockBadge` |
| Images | `images.ts` (sharp) → AVIF/WebP + manifest for the 27 assigned dish photos; concrete texture and grain placeholders |
| Layout | `BaseLayout`, `Header` (incl. scroll state), `MobileNav`, `Footer`, `BookButton` as plain links (now to `/book/`, D59) |
| Hours | `lib/hours.ts` + `HoursChip`, with the BST and closure unit tests |
| Routes | `/`, `/menu`, `/venue`, `/find-us`, `/privacy`, `/404` with headings and placeholder sections |
| Headers | `config/headers.ts` + `emit-headers.ts` skeleton |

**Done when:**
- `npm run build` succeeds with `SITE_ENV=staging` and **fails** with `SITE_ENV=production`, listing the flagged values.
- Breaking any data file (wrong type, unknown allergen, missing image key) fails the build with a readable message.
- All routes render on a phone and a desktop with the footer showing hours, phone and email from `site.json`, and the badge visible.
- The hours tests pass for every frozen date, including both BST changes.
- Lighthouse on `/` (no media yet): CLS < 0.05, no render-blocking font requests.

## M2. Prototypes: hero and candle (review gate)

**Deliverable:** two working prototype pages to judge the look before anything else is built.

| Prototype | Scope |
|---|---|
| Home hero | Placeholder video through `video.sh` (MP4 + WebM + poster), dark overlay, grain, concrete texture, headline type, rotating badge, hours chip, pause button, poster-only paths (reduced motion, Save-Data, slow connection) |
| Menu candle | The "To start" and "Pasta & risotto" sections with real data and photos: dim state, flame cursor, glow, spark, pool of light; centre-of-screen lighting on touch; focus lighting; reduced-motion state; allergen toggle |
| Hospres spike | The real widget in a bare sheet on iOS Safari and Android Chrome, to learn its size, scroll and payment behaviour (answers Q25) |

**Done when:**
- You (and the client, if wanted) have reviewed both on a laptop and a phone and either approved them or listed changes.
- Performance trace on a mid-range laptop: candle pointer movement holds 60 fps with no long tasks over 50 ms. Mobile Lighthouse on the hero page: LCP < 2.5 s (poster), CLS < 0.1.
- Reduced motion: the hero shows the poster, every dish is lit, nothing flickers.
- Image and video quality settings are agreed (sizes within budget).
- Hospres findings written into `OPEN_QUESTIONS.md` / `ARCHITECTURE.md`.

## M3. Home page

**Deliverable:** the full Home page (PAGES.md sections 1–8) on the motion registry.

**Done when:**
- Every section works in all three motion modes (desktop, mobile, reduced); no pinning on mobile.
- Lenis + ScrollTrigger: no jumps on resize, back/forward cache restores correctly, keyboard scrolling works.
- With JS disabled, all content is visible and Book links go to the booking page (`/book/`, D59).
- Home first-load JS ≤ 160 KB gzip (incl. React/Next runtime); LCP < 2.5 s, CLS < 0.1 on mobile 4G (Lighthouse).
- Featured dishes follow Q19, or the proposal in PAGES.md marked for review.

## M4. Menu page

**Deliverable:** Menu, Dessert and Wine (wine list + 10 bar sections) with tabs, candle lighting and allergens.

**Done when:**
- Every item in `menu.json`, `desserts.json` and `wine.json` renders; a test compares rendered counts with the data (23 dishes, 8 desserts/cheese, 28 wines, 89 bar items).
- Tabs scroll to sections and update the hash; `/menu#dessert` and `/menu#wine` open in the right place.
- Allergen rules hold (unit and e2e): `null` shows nothing; `[]` shows the agreed wording; Gelato / Sorbetto shows two lines; the three estimated cocktails show nothing; the key and the general note appear once per section.
- Price columns align (glass/bottle, 25/50 ml); "bottle only" where glass is null.
- Keyboard: every dish and row lights on focus; axe has no violations; unlit text passes AA.
- Menu first-load JS ≤ 150 KB gzip.

## M5. Venue page

**Deliverable:** sections 1–6 with MOCK placeholders for every photo and for "Our story".

**Done when:**
- Stair descent is pinned on desktop and stacked on mobile; the rooms gallery is pinned horizontal on desktop and scroll-snap on mobile; both are static under reduced motion.
- The North Parade sentence is exactly as in `venue.json`, and the page lists as "needs verification" in the content report.
- Swapping a placeholder for a real photo is only a data + `npm run images` change (tested with one sample image).

## M6. Find Us

**Deliverable:** map (per D42), contact block, parking cards, optional getting-here lines, careers.

**Done when:**
- The map loads no third-party request (static option) and "Get directions" opens Google Maps at the pin.
- Parking cards show the real names and addresses; the Cricket Club card renders without an address; walking times are counted as mock.
- "Send your CV" opens a mail to careers@ (placeholder, counted as to-confirm).

## M7. Booking modal, consent, privacy

**Deliverable:** the cookie banner with GA4 and the Privacy page. The booking dialog and guest flow were built early (D59, 2026-11-15); M7 finishes them once the backend exists (Q8).

**Done when:**
- Booking (done early, D59): opens from every Book button; focus moves in and returns to the opener; Escape and backdrop click close it; scroll is locked; desktop panel and phone sheet work; the flow runs date → guests → time → details → confirmation against the `BookingProvider` seam (mock today).
- Booking (still to do): a real provider once the backend is chosen (Q8) and the rules are confirmed (Q50); the mock flags removed so production can build.
- No request to Google is made before "Accept" (Playwright checks network); "Reject" keeps it that way; "Cookie settings" reopens the banner; withdrawing consent removes `_ga*` cookies.
- Privacy page shows the policy text unchanged (D25) with no effects.

## M8. Hardening

**Deliverable:** production-ready build (apart from the client's mock data).

| Area | Done when |
|---|---|
| SEO | Titles and descriptions per page from `seo.json`; OG images; sitemap; robots per environment; JSON-LD validates in Google's Rich Results Test and contains no mock values (unit test) |
| Redirects | Old PDF links and `?p=` links land on the right pages |
| Security | Headers emitted for the chosen host; CSP enforced with hashes and no console violations (GA4 after consent) |
| Accessibility | WCAG 2.2 AA pass: axe clean, manual keyboard pass, screen reader pass (VoiceOver iOS/macOS, NVDA), 200% zoom, reduced motion |
| Performance | Lighthouse CI budgets pass on all routes (mobile) |
| Browsers | Last 2 versions of Chrome, Safari (macOS and iOS on real devices), Firefox, Edge; one mid-range Android phone |

## M9. Staging and client review

**Deliverable:** a protected staging URL for the client.

**Done when:**
- Staging deploys automatically from a branch; it is `noindex` and behind access control; the badge shows the open mock count.
- The client has a review list: the content report (every mock / to-confirm / needs-verification value) plus OPEN_QUESTIONS items marked "Blocks launch".
- The launch checklist exists: DNS records copied (incl. MX), production build passes the mock guard, GA4 property access, Search Console, Google Business Profile.

Launch itself (DNS cutover, ARCHITECTURE §13 steps 3–7) follows once the production build passes, i.e. once the client has answered every "Blocks launch" question.

## Decisions made before M1 (2026-11-14)

| # | Decision | Answer |
|---|---|---|
| 1 | Framework | Next.js / React, static export (D30) |
| 2 | Map | Self-hosted static map + directions link (D42) |
| 3 | Image storage | Generated files in git, originals outside git (D36) |
| 4 | Tools | `sharp` and `ffmpeg` approved; ffmpeg installed when M2 needs it (`ffmpeg-static`, as there is no system ffmpeg) |
| 5 | Placeholder hero clip | Approved as proposed; an abstract loop generated with ffmpeg, so nothing is downloaded (Q26 can switch to stock later) |
| 6 | Branching | Preview per pull request, `main` = production (D49) |
| 7 | Hosting and domain owners | Deferred (Q41, Q42) |
