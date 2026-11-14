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
| D11 | Booking | Phase 1: existing Hospres widget inside our own redesigned modal. Phase 2: custom booking UI on the Hospres API once the client provides access. | 2026-11-12 |
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
| D28 | Booking | Phase 1 only (Hospres widget in our modal). No API work until the client gives access. Confirms D11. | 2026-11-14 |
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

## Not decided yet

| Topic | Where it is tracked |
|---|---|
| Tech stack and hosting | `OPEN_QUESTIONS.md` Q20 (to be proposed in the next task) |
| Design tokens (colours, fonts, motion values) | `DESIGN_SYSTEM.md` is a proposal; the developer handling design confirms |
| Everything else unknown | `OPEN_QUESTIONS.md` |
