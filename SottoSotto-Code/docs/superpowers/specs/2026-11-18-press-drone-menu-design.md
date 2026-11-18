# Press on Home, drone clip on Find Us, lighter Menu on Home

Design, 2026-11-18. Inputs from the client (sent 2026-11-18): `Sotto_Sotto_Newspaper_Film_Reimagined.html` (a self-playing "newspaper film"), `magazine pic.zip` (9 press pages, PNG, about 1150–1540 px wide) and `intro drone.mov` (18.7 s, 4K HEVC 10-bit, silent audio track).

## Intent

The client wants their press coverage on the site, "something like" their newspaper film: similar style, not a copy. They also sent a drone clip. The user decided where each goes and that Home must stay light on the menu: a pointer to the Menu page is the priority, not a showcase.

## Goals

1. **Home: a press section** that feels like papers landing on a dark table, with each headline picked out in amber, and lets visitors read the pages.
2. **Find Us: the drone clip opens the page.** It flies from Duke Street (the Sotto Sotto sign) over the Roman Baths and the Abbey and ends looking down on North Parade, right above our map of the same spot.
3. **Home: the Menu section shrinks** to one line of course tags linking to the Menu page (replaces the "menu at a glance" rows from D68).

## Non-goals

- Copying the client's film: no full-screen takeover, no auto-advancing slideshow, no printing-press animation, no letterbox bars, no "SPACE TO PAUSE" UI.
- A separate Press page or a new nav item (option B was declined).
- Transcribing the articles into text.
- Using the drone clip on Home.

## Anti-goals (a failure even if it works)

- **White flashes or strobes** (the client's film has both): a photosensitivity risk. None.
- Press that looks fake: the garbled small text on the FOUR Bath page must never be shown enlarged.
- Award claims in our own copy (badges, "award-winning" lines we write). The pages may show what the papers printed; we add no claims of our own.
- Home getting long or menu-heavy again.

## What we took from the client's HTML (style, not code)

| Their film | Ours |
|---|---|
| Warm dark radial "table" background (#4b3927 → #070606), fine grain | Same feel from our tokens (ink, concrete); the existing grain |
| Pages fly in from off-frame, blurred, rotated, then settle with a small overshoot and a deep drop shadow | Pages drop in one after another as the section enters view: blur → sharp, small overshoot, rest at a slight angle, drop shadow |
| Callout: amber small-caps source over a large serif headline | Same pairing for each page's headline (amber label face + display serif) |
| An amber ring zooms to the headline on the page (`spot` coordinates) | In the reader, the page opens with an amber ring on the headline, using the client's own `spot` values |
| Copy: "A story told by the press", "Sotto Sotto in the news", "The critics have spoken" | Section eyebrow and heading reuse the client's words (it is their copy, so no new copy is invented) |
| Flashes, strobe, printing press, full-screen autoplay, keyboard-only controls | Dropped (anti-goals, accessibility) |

## The pages (9; the film shows 10 because the Bath Chronicle page opens and closes it)

| # | File | Publication | Date (as printed) | Headline (client's, from the film) | Notes |
|---|---|---|---|---|---|
| 1 | Bath Chronicle Italian Restaurant Feature.png | The Bath Chronicle | Thursday 26 January 2012 | New restaurant eyes Italy | Opening story, founders named |
| 2 | Western Daily Press Restaurant Review.png | Western Daily Press | Saturday 10 March 2012 | A true Italian | Review |
| 3 | Sotto Sotto Restaurant Feature Spread.png | Bath Life | not printed on the page | Sotto Sotto | Review, pages 38–39 |
| 4 | Weekend Food Feature_ Sotto Sotto, Bath.png | The Daily Telegraph | Saturday 28 March 2015 | I come from a land down under | Review, 8/10 |
| 5 | Magazine Spread Highlighting Best Italian.png | FOUR Bath | Issue 1, November/December 2012 | Best Italian · Winner | **Award.** Small text is garbled (AI-restored): not openable in the reader |
| 6 | InBath Festival and Dining Guide.png | InBath | May/June, issue 27 (year not printed) | Award-winning restaurants | **Award** (Bath Good Food Awards) |
| 7 | Bath Life_ Romance and Spa Escapes.png | Bath Life (cover) with a Fabulous magazine page | 25 January – 8 February 2013 (cover) | The food of love | Two publications on one image |
| 8 | Beautiful Bath Travel Guide.png | Beautiful Bath | not printed | Beautiful Bath | Guide listing |
| 9 | Elegant Restaurant Guide_ Bath Dining Gems.png | Bath dining guide (name not printed) | not printed | Authentic Italian flavours | Guide listing |

## Decisions (the user's)

- **Placement:** press on Home (option A); drone clip on Find Us (option A).
- **Press approach:** option 2, "scattered table + reader".
- **Awards:** the client sent the award pages and asked for the magazines to be added, so the user takes it that the client has changed their mind about the awards (reverses rule 5 / D15 for press pages only). Kept safe: every press item is `toConfirm`, and award items carry `award: true`; a new open question asks the client to confirm in writing that the awards are genuine and to send original scans. Production stays blocked until answered.
- **Menu on Home:** a line of tags to the Menu page, nothing heavier.

## Design

### Data

`data/press.json`, validated by Zod like the other data files:

```json
{
  "_about": "...",
  "items": [
    {
      "id": "bath-chronicle-2012",
      "publication": "The Bath Chronicle",
      "date": "Thursday 26 January 2012",
      "headline": "New restaurant eyes Italy",
      "file": "press/Bath Chronicle Italian Restaurant Feature.png",
      "spot": [0.39, 0.29],
      "award": false,
      "readable": true,
      "toConfirm": true
    }
  ]
}
```

`date` is the printed text or `null`, never guessed. `spot` comes from the client's film. `readable: false` keeps a page out of the reader (FOUR Bath). Originals live outside git in `sotto sotto assets/press/`; the image pipeline gains a `press` folder (AVIF/WebP at 480, 800, 1200 and the source width, no upscaling).

### Home order

Hero → Philosophy → Venue → **Press** → **Menu tags** → Wine list → Booking band. (My call: the press follows the venue story and leads into the menu.)

### Press section (Home)

- Eyebrow "A story told by the press", heading "Sotto Sotto in the news" (client's words; `site.json` `copy.press`, `toConfirm`).
- **Desktop:** two columns. Left: the heading and a list of the 9 headlines (amber source + date line, serif headline), each a button. Right: the "table", the pages scattered and overlapping at fixed hand-set positions and angles (one set, stored in the component, not random). Hovering or focusing a headline lifts its page to the top; clicking either opens the reader.
- **Entrance:** `press-drop`, a new effect in the motion registry: when the section enters the viewport, pages drop in one after another (about 0.12 s apart): from slightly above, blurred and turned, to their rest angle with a small overshoot. Runs once. No pinning, so the section is about 1.5 screens tall.
- **Phones:** the table becomes a neat stack: pages at small alternating angles, each with its headline under it; tapping opens the reader. Same drop-in as they arrive.
- **Reduced motion and no JS:** pages already at rest; the headlines are links to the full-size image (no-JS fallback for the reader).

### Reader

- A native `<dialog>` (same pattern as the booking dialog: focus moves in and back, Escape and backdrop close, page inert behind).
- Shows the page as large as the screen allows, the amber ring at its `spot`, and the source, date and headline as text. Previous / next buttons and arrow keys move through the readable pages.
- Alt text: "Publication, date: headline". The articles are not transcribed.
- FOUR Bath (`readable: false`) is on the table and in the list but not openable; its list entry reads as plain text.

### Menu tags (Home)

Replaces `MenuIndex`: heading "Menu", one line of links built from the data (course English names, "Desserts & cheese", the wine tab label), each to its menu tab, then "See the menu". No photos, no dish names.

### Drone clip (Find Us)

- `npm run video` gains a second clip: `findus` from `intro drone.mov` → 1080p and 720p H.264 MP4 plus WebM, audio removed, a poster frame (the Abbey, around 6 s), all committed; source kept outside git in `sotto sotto assets/video/`.
- Find Us opens with the clip full width (about 70% of the screen height), the "Find Us" heading over a dark gradient at the bottom, and the map directly below.
- Reuses `VideoBackground`: muted loop, plays after load, pause button (WCAG 2.2.2), poster only under reduced motion or Save-Data.
- `site.json` `media.findUsVideo`: real client footage, not mock.

### Docs and rules

- `CLAUDE.md` rule 5 and D15 amended: award pages from the press may be shown as printed (D70); we still write no award claims of our own.
- `DECISIONS.md` D70 (press, awards, reader), D71 (drone clip on Find Us), D72 (Menu tags replace the menu index; amends D68).
- `OPEN_QUESTIONS.md`: confirm the awards are genuine; send original scans (the pages are AI-restored, FOUR Bath is garbled); dates and publication names for pages 3, 6, 8, 9. The 2012 articles answer parts of Q1 (10 North Parade, 01225 330236) and Q34 (opened January 2012 by Antonio Abategiovanni, Carlo Battaglia and chef Giuseppe D'Elisa): noted there, still for the client to confirm.

## Approaches considered (press)

| Approach | Trade-off | Outcome |
|---|---|---|
| 1. Pinned press table, one page at a time with a headline zoom | Closest to the film; 5–6 screens of pinned scrolling on Home | Declined: Home too long |
| **2. Scattered table + reader** | Newspaper feel and readable pages in about 1.5 screens; less of a "film" | **Chosen** |
| 3. Sideways reel | Lightest; looks like any gallery | Declined: loses the client's style |

Placement alternatives also considered: a separate Press page with a Home strip (declined by the user), press inside the Venue story (declined). Drone: Home hero (bright daylight clashes with the candlelit Home; declined), both pages (duplicate; declined).

## Checks (done when)

- No request leaves the site for the press images or the video.
- Press: 9 pages render; pages drop in once; reduced motion shows them at rest; the reader opens from a page and from a headline, traps focus, closes with Escape, returns focus, moves with arrow keys, shows the ring; FOUR Bath does not open; every press item is flagged `toConfirm`; axe clean in both states.
- Menu tags link to `/menu/#menu`, `#dessert`, `#wine`; no dish photos on Home.
- Find Us: video with poster and pause button; poster only under reduced motion; map still below; no third-party requests.
- JS budgets still pass (reader and effect are small); Home stays within its budget.
- The content report counts the new flags; the client review list is regenerated.

## Left to the builder

- Exact page positions and angles on the table, and stagger timing, within the design above.
- Poster frame choice within the Abbey shot.
- Responsive breakpoints for table versus stack (follow the existing 48em / 64em).
