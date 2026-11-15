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
| 1 | Hero | Full-screen muted looping video, dark overlay (about 50–60% opacity), faint grain on top. Short headline with the name and "Italian Restaurant in Bath". Slowly rotating circular "Book a table" badge that opens the modal. Live hours chip. Poster image loads first and replaces the video on slow connections or reduced motion. | `site.json` name, tagline, hours. Video and poster: placeholder. |
| 2 | Philosophy statement | Existing text set large on the concrete, revealing word by word on scroll. "Booking is strongly recommended" leads into a booking button. | `site.json` `copy.philosophyFull`, `copy.bookingNote` |
| 3 | Venue teaser | Pinned section. Venue photos slide past step by step as you scroll, getting darker and warmer, like descending the stairs. Ends with a "Step inside" link to Venue. | Venue photos: placeholder |
| 4 | Featured menu | 4–6 signature dishes as image cards, slightly dimmed, brightening on hover (a small preview of the menu candle effect). Links to the Menu, Dessert and Wine sections. | `menu.json`, `desserts.json`. Dish choice: see below. |
| 5 | Wine strip ("From the cellar") | A slow scrolling line of wine names. Text only. | `wine.json` names |
| 6 | Booking band | Full-width image or second video with "Reserve your table" and a note that the restaurant is small. | `copy.bookingNote`. Media: placeholder. |
| 7 | Find us teaser | Address, a dark-styled map snippet, a "Parking nearby" link to Find Us. | `site.json` address **(MOCK)** |
| 8 | Footer | Global footer. | `site.json` |

**Hours chip states** (computed from `site.json` in the Europe/London time zone):

| State | Example text |
|---|---|
| Open day | "Open today · 12–2 & 5–10" |
| Closed day | "Closed today, we reopen Tuesday" |
| Seasonal closure | Wording to be agreed (depends on `OPEN_QUESTIONS.md` Q14) |

**Featured dishes (proposal, client to choose — Q19).** Candidates taken only from dishes with a "clear" photo match: Cicchetti della casa, Linguine con gamberi, Fettucce al ragù di manzo, Filetto di manzo in crosta di pistacchi, Polenta grigliata, Tiramisu.

**Unplaced copy.** The current home page quote ("Situated just a few steps away from the Roman Baths…") has no slot in this spec. Proposal: a sub-line under the hero headline or the lead-in to the Find us teaser.

## Venue

The page reads like a slow walk through the space.

| # | Section | Spec |
|---|---|---|
| 1 | Opening | Full-screen photo of the entrance or stairs, slow zoom on scroll. |
| 2 | The descent | Pinned scroll section. Photos change step by step; the light gets warmer and dimmer. |
| 3a | The street | North Parade text (from `venue.json` `setting`) with a photo that unmasks. The history sentence needs verification before launch (Q33). |
| 3b | Our story | The restaurant's own story. **(MOCK)** placeholder until the client sends it (Q34). |
| 4 | The rooms | Horizontal-scroll gallery with small captions. |
| 5 | Details | Close-up collage (stone, table setting, wine shelves, candle). |
| 6 | Booking prompt | "See it for yourself" + Book a Table. |

- Content: `data/venue.json`. Copy and its status: `CONTENT.md` section 4.
- Venue photos are still to come from the client. Use placeholders **(MOCK)**.
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
| 1 | Map | Google Map styled dark to match the site, custom pin, "Get directions" button. | `site.json` geo (MOCK) |
| 2 | Contact | Address, phone and info@ email in large type. | `site.json` address (MOCK), contact |
| 3 | Parking | Three cards: car park name, address, walking time, note. Not shown on the map. A card with no address (Bath Cricket Club) shows name and walking time only. | `site.json` parking: names and addresses real; walking times **(MOCK)** |
| 4 | Getting here | Optional: one line each for train and on foot. | `site.json` gettingHere (MOCK, optional) |
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
