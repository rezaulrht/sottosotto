# Getting here: the walks, drawn on the map (short design)

Approved by the user 2026-11-19. Recorded as D81.

## Intent

Find Us "Getting here" looked dull: three lines of text. Make it something to look at that
also helps a visitor find the place.

## Approaches considered

| Approach | Trade-off | Outcome |
|---|---|---|
| A. The walks drawn on the map | Most visual; shows the walk instead of describing it | **Chosen** |
| B. A photo of each starting point | Consistent with parking rows, but stays a list | Dropped |
| C. A journey line with stops and times | Light, typographic, but little to look at | Dropped |

## Design

- One dark map (the Find Us map's own SVG and labels, cropped tighter) with three amber routes:
  Bath Spa station, Bath bus station and Bath Abbey to the Sotto Sotto pin.
- Routes are real OpenStreetMap foot routes (routing.openstreetmap.de), fetched once by
  `npm run routes` into `src/content/routes.json`; the site makes no third-party request.
- Desktop: map left, the three rows right. Phones: map first, rows below.
- Motion: the lines draw themselves one after another the first time the section is seen
  (stroke-dashoffset). Reduced motion: drawn.
- Interaction: pointing at, tapping or focusing a row lights its route (thicker, full amber)
  and dims the others.
- The rows keep the `site.json` text (screen readers read the rows; the map is labelled as an
  illustration of the three walks).

## Non-goals

- No live directions or tiles. "Get directions" still opens Google Maps.

## Data

The address and pin are no longer placeholders: 10 North Parade, Bath BA2 4AL, at
51.38069, −2.35657, from the Food Standards Agency register (FHRSID 359645) and the
OpenStreetMap restaurant node (2 m apart).
