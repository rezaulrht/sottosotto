# Sotto Sotto — website rebuild

Rebuild of sottosotto.co.uk for Sotto Sotto, a small Italian restaurant on North Parade in Bath, UK (Somerset, not London). The current site is a single static page from around 2010. The new site is a modern, cinematic, flagship-level restaurant site.

**Status:** architecture approved (Next.js static export, `docs/ARCHITECTURE.md`, D30–D50). Building milestone 1 of `docs/BUILD_PLAN.md`.

## Where things are

| Path | What |
|---|---|
| `docs/PROJECT_BRIEF.md` | Client, goal, scope, what to keep and remove |
| `docs/DECISIONS.md` | Decisions already made. Do not reopen without the user. |
| `docs/PAGES.md` | Page-by-page spec |
| `docs/DESIGN_SYSTEM.md` | Colour, type, spacing, motion (proposal, awaiting review) |
| `docs/CONTENT.md` | All site copy, including the full privacy policy |
| `docs/ASSETS.md` | Photo list, dish-to-photo map, missing assets |
| `docs/OPEN_QUESTIONS.md` | Everything not yet known |
| `docs/ARCHITECTURE.md` | Stack, folders, components, data flow, motion, assets, booking, consent, hosting (proposal) |
| `docs/BUILD_PLAN.md` | Milestones M1–M9 with "done when" checks (proposal) |
| `data/site.json` | Business details, hours, contact, address, parking |
| `data/menu.json`, `desserts.json` | Food menu, desserts and cheese, with allergens |
| `data/wine.json` | Wine tab: wine list (`groups`) and bar menu (`drinks`) |
| `data/allergens.json` | The client's allergen categories, key and general note |
| `data/venue.json` | Venue page content and photo placeholders |
| `../sotto sotto assets/` | 35 original dish photos (PNG) |
| `../../targets/sottosotto-site/` | Downloaded copy of the current site (read-only reference) |

## Rules

1. **Never invent facts.** If something is not in the docs, the data files or the current site, add it to `docs/OPEN_QUESTIONS.md`. Do not guess.
2. **Mock data** is allowed only where `docs/DECISIONS.md` says so. Mark it `"mock": true` in JSON and **(MOCK)** in markdown. No mock value may reach production.
3. **Menu content is final.** Do not change dish names, descriptions, prices or the (v)/(n) tags. Never infer a dietary tag.
4. **Data files are the single source.** Hours, address, phone, emails and menu items are read from `data/`. Do not hardcode them in pages or components.
4a. **Allergens are the client's, exactly.** Use only the 14 categories in `data/allergens.json`, in that order. Never add, infer or rename an allergen. `allergens: null` means no data and must never be shown as "none". Items with `allergenSource: "estimated"` are not the client's data.
5. **No award badges or award claims** (Bath Good Food Awards). The client says they are not genuine.
6. **No analytics before consent.** GA4 loads only after the visitor agrees. The old Universal Analytics tag is not carried over.
7. **Motion always has a static fallback.** Respect `prefers-reduced-motion` on every effect.
8. **Reference site is inspiration only** (fidalgo.qodeinteractive.com). Do not copy its code, layout or assets.
9. **Record decisions.** New decisions go in `docs/DECISIONS.md`; answered questions are moved out of `docs/OPEN_QUESTIONS.md`.
10. Keep docs short and scannable: tables for comparisons, no filler.
