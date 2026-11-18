# Press, drone clip and Menu tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "papers on a table" press section with a reader to Home, open Find Us with the client's drone clip, and shrink Home's Menu section to a line of tags.

**Architecture:** Press items live in a new `data/press.json` (Zod-validated, flagged `toConfirm`, counted by the content report) and go through the existing image pipeline. Home renders them as a Server Component table plus a small client reader (`<dialog>`); a new `press-drop` motion effect drops the pages in. The drone clip is encoded by the existing `scripts/video.sh` and played by the existing `VideoBackground`.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript strict, Zod 4, GSAP 3.15 motion registry, sharp image pipeline, ffmpeg, Vitest, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-11-18-press-drone-menu-design.md`

## Global Constraints

- Branch `press-drone` from `main`. Commit with the byteSpate identity; no co-author lines.
- Never invent facts: press dates are the printed text or `null`; publication names as printed; headlines are the client's (from their film).
- No flashes or strobes; every motion has a static fallback under `prefers-reduced-motion` and without JS.
- No third-party requests; press images and video are self-hosted.
- No award claims in our own copy. Award pages may be shown as printed.
- Every press item is `toConfirm: true`; award items also `award: true`. FOUR Bath is `readable: false`.
- Originals stay outside git: `../sotto sotto assets/press/`, `../sotto sotto assets/video/`. Generated files are committed.
- JS budgets (`npm run budget`) must still pass.

## Review Focus

1. Keyboard user opens the reader from a headline, uses arrows, presses Escape: focus returns to that same headline. Test in Task 2.
2. The reader skips the unreadable FOUR Bath page when moving with next/previous. Test in Task 2.
3. Phone width: the press stack and the reader cause no sideways scroll. Test in Task 2.
4. Reduced motion on Find Us: poster only, no video request. Test in Task 4.
5. The content report counts all 9 press items and the client review list is current. Test in Task 1 and Task 5.

---

### Task 1: Press data, schema and images

**Files:**
- Create: `data/press.json`
- Modify: `src/content/schemas.ts` (add `pressSchema`), `src/content/raw.ts` (register `press.json`), `src/content/validate.ts`, `src/content/index.ts` (export `press`, `pressImage(id)`), `src/content/image-jobs.ts` (add `'press'` folder and jobs), `scripts/images.ts` (output `public/img/press/`)
- Test: `tests/unit/press.test.ts`

**Interfaces:**
- Produces: `press: { items: PressItem[] }` from `@/content`; `type PressItem = { id: string; publication: string; date: string | null; headline: string; file: string; spot: [number, number]; award: boolean; readable: boolean; toConfirm: true }`; `pressImage(id: string): ManifestEntry | undefined` (manifest key `press-<id>`).

- [ ] **Step 1:** Copy the 9 PNGs from `~/Downloads/magazine pic.zip` into `../sotto sotto assets/press/` (keep file names).
- [ ] **Step 2: Write the failing test** `tests/unit/press.test.ts`:
  - `has the 9 pages in the spec's order` — ids `bath-chronicle-2012, western-daily-press-2012, bath-life-review, telegraph-2015, four-bath-2012, inbath-awards, bath-life-food-of-love, beautiful-bath, bath-dining-guide`.
  - `flags every page toConfirm; awards are FOUR Bath and InBath only` — `award` true exactly for `four-bath-2012`, `inbath-awards`.
  - `FOUR Bath is not readable; the rest are`.
  - `spots are inside the page (0..1)`.
  - `dates are printed text or null` — `bath-chronicle-2012` = `"Thursday 26 January 2012"`, `western-daily-press-2012` = `"Saturday 10 March 2012"`, `telegraph-2015` = `"Saturday 28 March 2015"`, `four-bath-2012` = `"November/December 2012"`, `bath-life-food-of-love` = `"25 January – 8 February 2013"`, `inbath-awards` = `"May/June"` (no year printed); the others `null`.
  - `the content report flags all 9` — `flagsInFile('press.json', raw)` has 9 entries with `toConfirm`.
  - `image jobs include one press job per page` — `imageJobs(...)` returns 9 jobs with `folder: 'press'`, keys `press-<id>`.
- [ ] **Step 3:** Run `npx vitest run tests/unit/press.test.ts` — expect FAIL (no data).
- [ ] **Step 4:** Write `data/press.json` from the spec's table (headlines from the client film: "New restaurant eyes Italy", "A true Italian", "Sotto Sotto", "I come from a land down under", "Best Italian · Winner", "Award-winning restaurants", "The food of love", "Beautiful Bath", "Authentic Italian flavours"; spots from the film's `DATA` in the same order), with an `_about` note. Add `pressSchema` (strict), register the file, export `press` and `pressImage`, extend `imageJobs` to take `press.items` (third parameter) and emit `{ key: 'press-' + id, source: file, folder: 'press' }`.
- [ ] **Step 5:** Run `npm run images` — expect 9 press entries built into `public/img/press/`. Then `npx vitest run` — PASS; `npm run content:report` — 53 flagged values.
- [ ] **Step 6:** Commit `feat: press data and images`.

### Task 2: Press section and reader on Home

**Files:**
- Create: `src/components/home/PressTable.tsx` (+ `.module.css`), `src/components/home/PressReader.tsx` (+ `.module.css`), `src/motion/effects/press-drop.ts`
- Modify: `src/motion/registry.ts` (register `press-drop`), `data/site.json` + `schemas.ts` (`copy.press: { toConfirm: true, eyebrow: "A story told by the press", heading: "Sotto Sotto in the news" }`), `src/app/page.tsx` (order: Hero → Philosophy → Venue → Press → Menu → Wine → Booking)
- Test: `tests/e2e/press.spec.ts`; update `tests/e2e/home.spec.ts` SECTIONS

**Interfaces:**
- Consumes: `press`, `pressImage` (Task 1); `Picture`; motion registry `Effect`.
- Produces: `<PressTable />` (Server Component, `aria-labelledby="home-press"`, each page `data-press-page`, each headline a `<button data-press-open={id}>` when readable, a plain `<p>` when not; no-JS: headlines are `<a href>` to the 1200 px image); `<PressReader items={ReaderItem[]} />` client component listening for clicks on `[data-press-open]`; `ReaderItem = { id, publication, date, headline, spot, src: string (largest webp), width, height }`.

- [ ] **Step 1: Write the failing tests** in `tests/e2e/press.spec.ts`:
  - `shows 9 pages and 9 headlines in the client's words` — `[data-press-page]` count 9; headings text as in Task 1.
  - `the reader opens from a page and from a headline, and closes with Escape, returning focus` — click headline "A true Italian" → `dialog` visible with name containing "Western Daily Press"; `.ring` visible; Escape → dialog hidden, that headline focused.
  - `arrow keys move through readable pages and skip FOUR Bath` — open "I come from a land down under", ArrowRight → dialog shows "Award-winning restaurants" (InBath), not "Best Italian · Winner".
  - `FOUR Bath does not open` — its headline is not a button; clicking its page does not open the dialog.
  - `pages drop in once; reduced motion shows them at rest` — with `reducedMotion: 'reduce'`, every page has computed `opacity: 1` and `filter: none` on load.
  - `phone: a stack with no sideways scroll` — on the phone project, `scrollWidth - clientWidth <= 0`; pages' left edges within 40 px of each other.
  - `no flashes` — no element in the section animates `background-color` to white (assert the effect module exports no flash: `press-drop` source contains no `#fff`).
  - axe on Home with the reader open: no violations.
- [ ] **Step 2:** Build staging and run `npx playwright test tests/e2e/press.spec.ts` — expect FAIL.
- [ ] **Step 3:** Implement `PressTable` (desktop: two columns, list + table with 9 hand-set positions/angles in a const array; phone < 48em: stack at alternating ±2–3°), `PressReader` (native `<dialog>` like `BookingDialog`: focus in/out, Escape, backdrop, `inert` page; image fitted to the viewport; amber ring 150 × 76 px centred on `spot`; prev/next buttons and ArrowLeft/ArrowRight over readable items only; heading "Publication · date" and the headline), and `press-drop` (desktop + mobile: `gsap.from` each page `{ y: -60, rotation: rest ± 8, filter: 'blur(6px)', opacity: 0 }` to rest with `ease: 'back.out(1.4)'`, `stagger: 0.12`, ScrollTrigger `start: 'top 75%'`, `once: true`; reduced: nothing). Add `copy.press` to `site.json` and the schema. Update `page.tsx` order.
- [ ] **Step 4:** Rebuild; run the press spec and `tests/e2e/home.spec.ts`, `smoke.spec.ts` — PASS. `npm run budget` — PASS.
- [ ] **Step 5:** Commit `feat: press table and reader on Home`.

### Task 3: Menu tags replace the menu index

**Files:**
- Modify: `src/components/home/HomeSections.tsx` (replace `MenuIndex` with `MenuTags`), `HomeSections.module.css` (drop course styles, add `.tags`), `src/app/page.tsx`
- Test: `tests/e2e/home.spec.ts` (replace the menu-index test)

**Interfaces:**
- Produces: `MenuTags()` with `aria-labelledby="home-menu"`; links in order: each non-`textOnly` menu section's `nameEn` → `/menu/#menu`, `"Desserts & cheese"` (desserts `nameEn` values joined with " & ") → `/menu/#dessert`, `wine.tab.label` → `/menu/#wine`, then "See the menu" → `/menu/`.

- [ ] **Step 1: Write the failing test** `the menu section is a line of tags to the Menu page`: within `[aria-labelledby="home-menu"]`, link texts equal `['To start', 'Pasta & risotto', 'Specialities', 'Desserts & cheese', 'Wine', 'See the menu']` with the hrefs above; no `img` inside the section.
- [ ] **Step 2:** Run it — FAIL.
- [ ] **Step 3:** Implement `MenuTags`; remove `MenuIndex`, its helpers and CSS.
- [ ] **Step 4:** Rebuild; run `home.spec.ts` — PASS.
- [ ] **Step 5:** Commit `feat: Home menu becomes a line of tags`.

### Task 4: Drone clip opens Find Us

**Files:**
- Modify: `scripts/video.sh` (support `CLIP_NAME` + `CLIP_SRC`, defaults keep the hero behaviour; `findus` keeps the source frame rate 24, trims nothing, poster at 6 s), `scripts/video-poster.ts` (take the manifest key as an argument), `src/content/video-manifest.json` (gains `findus`), `data/site.json` + schema (`media.findUsVideo: { mock: false, key: "findus", _note }`), `src/components/home/VideoBackground.tsx` (optional `pauseKey` prop, default the hero key; badge pause only for the hero), `src/app/find-us/page.tsx` (+ `pages.module.css`: `.findHero`)
- Test: `tests/e2e/find-us.spec.ts`

**Interfaces:**
- Consumes: `videoFor('findus')`; `VideoBackground({ video, pauseKey })`.
- Produces: `public/video/findus-{1080,720}.{mp4,webm}`, poster in the manifest under `findus`.

- [ ] **Step 1:** Copy `~/Downloads/intro drone.mov` to `../sotto sotto assets/video/intro-drone.mov`.
- [ ] **Step 2: Write the failing tests** in `find-us.spec.ts`:
  - `the drone clip opens the page with a poster and a pause button` — `[aria-labelledby="find-title"] video` attached, poster `img` visible above the map (its `y` < map `y`), pause button visible after load.
  - `reduced motion: poster only, no video request` — with `reducedMotion: 'reduce'`, no request to `/video/findus-`.
  - Existing `no third-party request` test still passes.
- [ ] **Step 3:** Run — FAIL.
- [ ] **Step 4:** Run `CLIP_NAME=findus CLIP_SRC="../sotto sotto assets/video/intro-drone.mov" FFMPEG=… npm run video`; 1080 MP4 must stay under 6 MB for this clip (set `MAX_MP4_BYTES` per clip). Wire the page: clip full width, about 70svh, "Find Us" `h1` over a bottom gradient, the map below.
- [ ] **Step 5:** Rebuild; run `find-us.spec.ts` and `prototypes.spec.ts` (hero video unchanged) — PASS.
- [ ] **Step 6:** Commit `feat: drone clip opens Find Us`.

### Task 5: Rules, docs and full verification

**Files:**
- Modify: `CLAUDE.md` (rule 5: "No award badges or award claims of our own. Press pages the client supplied may show awards as printed (D70)."), `docs/DECISIONS.md` (D70 press and awards, D71 drone on Find Us, D72 Menu tags amend D68), `docs/OPEN_QUESTIONS.md` (Q53 confirm awards in writing; Q54 original scans, FOUR Bath garbled; Q55 dates/publications for pages 3, 6, 8, 9; note under Q1 and Q34 what the 2012 articles say), `docs/PAGES.md` (Home rows 4 and new Press row; Find Us hero), `docs/ASSETS.md` (press pages, drone clip), `docs/CLIENT_REVIEW.md` (regenerate), `docs/BUILD_PLAN.md` status line

- [ ] **Step 1:** Make the doc edits; `npm run review-list`.
- [ ] **Step 2:** Run `npm run check`, `npm run build:staging`, `npm run budget`, `npx playwright test` — all PASS (re-run the known Lenis keyboard flake alone if it fails once).
- [ ] **Step 3:** Screenshot Home press (desktop and phone), the reader, and Find Us; check by eye.
- [ ] **Step 4:** Commit `docs: press, drone clip and menu tags (D70–D72)`.
