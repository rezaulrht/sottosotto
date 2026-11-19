# Pages

Route names are a proposal. Copy for every section is in `CONTENT.md`; business details come from `data/site.json`.

| Page | Route | In nav |
|---|---|---|
| Home | `/` | Yes |
| Menu | `/menu` (`#menu`, `#dessert`, `#wine`) | Yes |
| Venue | `/venue` | Yes |
| Find Us | `/find-us` | Yes |
| Privacy | `/privacy` | Footer only |
| Booking | Modal, no route | "Book a Table" button |

## Global

| Element | Spec |
|---|---|
| Background | Concrete texture across the site: one optimised texture image plus faint grain. Not a heavy effect. |
| Header | Logo centred, nav left, "Book a Table" right. Transparent over the hero; turns solid and shrinks on scroll. |
| Mobile nav | Full-screen overlay menu. "Book a Table" stays visible. |
| Booking modal | Opens from every "Book a Table" button. |
| Motion | Smooth scrolling, line-by-line text reveals, images that unmask on entry, gentle parallax. Slow and deliberate, never bouncy. |
| Reduced motion | `prefers-reduced-motion` respected everywhere. Every effect has a static fallback. |
| Footer | Short philosophy line, hours, address, phone, info@ email, privacy policy link, social links. No careers link. |
| Cookie banner | New banner. GA4 stays off until the visitor consents. |

## Home

| # | Section | Spec | Content source |
|---|---|---|---|
| 1 | Hero | Full-screen muted looping video, dark overlay (about 50–60% opacity), faint grain on top. Short headline with the name and "Italian Restaurant in Bath". Slowly rotating circular "Book a table" badge with the logo's grapes at its centre, opening the modal. Today's hours beside the Book button as a typographic block (D82). Poster image loads first and replaces the video on slow connections or reduced motion. | `site.json` name, tagline, hours. Video and poster: placeholder. |
| 2 | Philosophy | Editorial spread (D68): the heading and a dish photo on one side; the first paragraph set as a statement with an amber rule, the other two as reading text, with 'Sapori' set in italic amber. "Booking is strongly recommended" leads into a booking button. | `site.json` `copy.philosophyFull`, `copy.bookingNote` |
| 3 | Venue teaser | Pinned section. Venue photos slide past step by step as you scroll, getting darker and warmer, like descending the stairs. Ends with a "Step inside" link to Venue. Phones (D68): heading and link first, then the photos as a sideways swipe row. | `venue.json` `descent` (client photos, D76) |
| 4 | Press | The client's newspaper film (D73): each of the 9 pages flies in, zooms, and an amber square rings its Sotto Sotto part under a big headline; "Read this page" opens the reader. One screen tall; reduced motion: still pages. | `press.json` (toConfirm), `site.json` `copy.press` |
| 4b | Menu | A strip of four course panels with photos, each opening its part of the Menu page; the open panel lists its first dishes and dish count; "See the full menu" (D74). Phones: a swipe row. | `menu.json`, `desserts.json`, image manifest |
| 5 | Wine list | A rack of upright wine labels on a shelf, by group, in front of the barrel-wall photo. Pointing at, tapping or arrowing to a label pulls it out; the card above shows name, producer, region, vintage and note. No prices; "See the full wine list" opens the wine tab (D77). | `wine.json`; photo `venue.json` `home.wine` |
| 6 | Booking band | Full-bleed photo of candlelit set tables; "Reserve your table", the note, the open days and the button in a double-ruled card. Runs straight into the footer (D76). | `copy.bookingNote`, `site.json` hours; photo `venue.json` `home.booking` |
| 7 | ~~Find us teaser~~ | Removed from Home (D68). Find Us stays in the main navigation and the footer. | — |
| 8 | Footer | Global footer. | `site.json` |

**Hours chip states** (computed from `site.json` in the Europe/London time zone):

| State | Example text |
|---|---|
| Open day | "Open today · 12–2 & 5–10" |
| Closed day | "Closed today, we reopen Tuesday" |
| Seasonal closure | Wording to be agreed (depends on `OPEN_QUESTIONS.md` Q14) |

**Featured dishes:** replaced by the menu at a glance (D68); no dish choice is needed from the client.

**Unplaced copy.** The current home page quote ("Situated just a few steps away from the Roman Baths…") has no slot in this spec. Proposal: a sub-line under the hero headline or the lead-in to the Find us teaser.

## Venue

The page reads like a slow walk through the space.

| # | Section | Spec |
|---|---|---|
| 1 | Opening | Full-screen photo (the vault through the lattice screens), slow zoom on scroll. |
| 2 | Street level | "On North Parade": the river photo wide, the street fact as a pull quote (needs verification before launch, Q33). |
| 3 | The stairs | "Leave the street, take the stairs, and step inside." The stage is held while scrolling: the street closes to a strip of daylight overhead, step edges rise past, the stone takes over and the line arrives a step at a time. CSS only; static line on the stone where unsupported or with reduced motion (D77). |
| 4a | Our story | In the vault: the relief in an arched niche beside the text. **(MOCK)** text until the client sends it (Q34). |
| 4b | The rooms | The client's photos set into the stone wall in arched, round and plaque niches, three columns at different heights (two-up on phones); each lights up as it comes into view. |
| 5 | Booking prompt | "See it for yourself" + Book a Table, still on the stone. |

- Content: `data/venue.json`. Copy and its status: `CONTENT.md` section 4.
- Venue photos: the client's own (2026-11-19, D76).
- No accessibility details or private hire section (D12).
- The current site's venue text is mostly award claims and old press quotes. It is not carried over as is; see `CONTENT.md` section 4 and Q16.

## Menu

| Behaviour | Spec |
|---|---|
| Page tone | Dimmed, not black: about 25–35% brightness, so everything stays readable. |
| Candle cursor (desktop) | The pointer becomes a small candle flame with a warm glow. Hovering a dish plays a small spark animation, the dish brightens to full, and a soft pool of light spreads around it. Everything else stays dim. |
| Touch devices | The dish in the middle of the screen lights up as you scroll. |
| Keyboard | Dishes light up on focus. |
| Reduced motion | Dishes at full brightness, no flicker. |
| Sections | Three, with a sticky tab bar: Menu · Dessert · Wine. Tabs scroll to sections and update the URL (e.g. `/menu#dessert`) so links can be shared. |
| Wine tab label | Read from `wine.json` `tab.label` (currently "Wine"). Renaming it to "Drinks" changes only that label; the id and the `#wine` hash stay the same (D19). |

| Section | Layout | Data |
|---|---|---|
| Menu | Each item: photo, Italian name, English description, price, markers (v) vegetarian and (n) contains nuts, allergens. Grouped by the menu's own sections: A per cominciare, I farinacei, Le specialità, I contorni. Side dishes are text-only for now. | `menu.json` |
| Dessert | Same item layout. Groups: Peccati di gola, Formaggi. | `desserts.json` |
| Wine: wine list | Text only, typographic. Grouped by type (White & Rosé, Red, Prosecco & Champagne). Producer, region, vintage where given, tasting note, glass and bottle prices in aligned columns; "bottle only" where there is no glass price. Rows light up under the candle too. Optional filter by type. | `wine.json` `groups` |
| Wine: bar menu | Follows the wine list on the same tab, same typographic treatment, text only. Sections in order: Martinis, Longs, Shorts, Sparkling cocktails, Beer & cider, Mineral water & juices, Spirits, Coffee & tea, Special coffees, Liqueurs. Prosecco & Champagne is not repeated. | `wine.json` `drinks` |

**Bar menu layout**

| Section shape | Display |
|---|---|
| `uniformPrice` (cocktails, special coffees) | Price once in the section heading ("all £12.50"); each row shows name and ingredients |
| `price` per item (beer, water, coffee) | Name, details (size, ABV), price in the right column |
| `priceColumns` (spirits, liqueurs) | Two aligned price columns, 25 ml and 50 ml. Spirits are sub-grouped (Gin, Vodka, Rum…) with ABV after the name |
| Section `note` | Small line under the section ("Vodka and Gin Martini are available.", "More cocktails are available upon request.", "Choice of standard mixer add 50p") |

If the optional type filter is built, it covers the bar sections too (e.g. Wine · Cocktails · Beer & soft drinks · Spirits & liqueurs · Coffee). Grouping is a proposal.

**Allergens (D20, D21)**

| Rule | Spec |
|---|---|
| Categories and key | Read from `allergens.json`. Use the client's 14 categories exactly, in their order. Never add, rename or infer. |
| Item display | Quiet, not competing with the candle effect: a small "Allergens" toggle under the description that expands to small labels. Labels stay readable when the item is dim (secondary text colour, never dimmed below AA). |
| Two kinds of label | "Contains" (client's x) and "Can be made without" (client's x\*). Shown with a mark or a separate line, not by colour alone. |
| Key | Shown once per section, next to the (v)/(n) legend. |
| `allergens: []` from the client | Proposal: "None of our listed allergens". Wording to be agreed (Q35). |
| No data (`allergens: null`) | Show nothing. Never show "none" or "allergen-free". |
| Variants | Gelato / Sorbetto shows two sets inside the one item: "Gelato: Lactose" and "Sorbetto: none of our listed allergens". |
| Estimated (`allergenSource: "estimated"`) | Bellini, Hugo Spritz, Aperol Spritz. Proposal: do not publish until the client confirms; until then, show nothing (Q29). |
| General note | "Guests are asked to tell staff about any allergies or intolerances in advance." Shown once at the top of the Menu, Dessert and Wine sections, and near every allergen key. Exact wording pending (Q12). |
| Touch and keyboard | The toggle is a real button, at least 44 px tall, reachable by keyboard, and opening it lights the item. |

- Legend for (v) and (n) is shown once per section.
- Wine notes (glass sizes, VAT) are shown with the wine list.

## Find Us

| # | Section | Spec | Data |
|---|---|---|---|
| 0–1 | Landing stage | One full-screen stage (D75): the client's drone clip (D71) with "Find Us" and a pause button; scrolling through it, the clip zooms, softens and dissolves into the self-hosted dark map (D42), which settles on North Parade with the pin; then a card with the address and "Get directions". No JS or reduced motion: one screen with the map and the card at once. | `site.json` `media.findUsVideo`, geo (MOCK), address (MOCK) |
| 2 | Contact | Address, phone and info@ email in large type. | `site.json` address (MOCK), contact |
| 3 | Parking | A ruled list: measured walking time first, then name, address, note, and a credited Commons photo of the place (D78, D80). A place with no address (Bath Cricket Club) shows name, walk and photo. Photos wipe in as they are reached. | `site.json` parking |
| 4 | Getting here | The walks on the map (D81): a cropped dark map with three amber routes (station, bus station, Abbey → Sotto Sotto) that draw on first sight; beside it (below on phones) the three ways, each with its measured minutes and one line of directions; pointing at or tapping a way lights its route. | `site.json` gettingHere, `src/content/routes.json` |
| 5 | Careers | Current site's careers text, "Send your CV" button using careers@. | `CONTENT.md` section 6 |

## Booking (D59)

| | Spec |
|---|---|
| Where | Dialog opened by every "Book a Table" button; the same flow on `/book/` (direct links, no JS) |
| Desktop | Centred panel over a blurred, dimmed page |
| Phone | Full-screen sheet sliding up |
| Steps | Date (Monday-first calendar; Sundays, Mondays, closures and past days greyed out) → guests (1–5; "call us" for more) → available times by session → name, phone, email, optional notes (with the allergy note) → confirmation |
| Now | Preview only: availability is made up, nothing is booked, and a notice says so (Q8) |
| Unknown | Slot rules, deposits or card capture, amend and cancel (Q50); the backend (Q8) |

## Privacy

Plain, readable legal page with the existing policy text, unchanged (D25; `CONTENT.md` section 7). No effects. Linked from the footer and the cookie banner.
