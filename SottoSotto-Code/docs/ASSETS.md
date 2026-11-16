# Assets

Last updated 2026-11-14 (Update 1: client menus, allergy forms and location info received; see section 5).

## 1. Dish photos (have)

| | |
|---|---|
| Location | `~/byteSpate/sotto-sotto/sotto sotto assets/` |
| Count | 35 PNG files, about 66 MB in total |
| File size | 1.6–2.5 MB each |
| Pixel size | 1535 × 1024 or 1536 × 1024 (landscape, 3:2) |
| Web use | Must be converted to WebP/AVIF at roughly 150–300 KB, with responsive sizes. File names contain spaces and one accent ("Ragù"); rename to lowercase slugs on conversion. |

**Two things to raise with the client (Q5):**

- The files are about 1535 px wide. The spec given to the client asks for at least 3000 px and original files. At 1535 px they are fine for menu cards but soft for full-width or retina use.
- File names such as "Realistic Ice Cream Sundae in Frosted Glass" and "Cinematic…" read like generated-image titles. Whether these are real photographs of Sotto Sotto's dishes is not known.

### Dish → photo map

Match: **Clear** = confident by file name. **Likely** = plausible, to be checked by eye (Q4). 18 clear, 9 likely, 4 none.

| Section | Dish | Photo file | MB | Match |
|---|---|---|---|---|
| Starters | Bruschetta ai gamberoni | Shrimp Toasts on Warm Wood.png | 1.64 | Clear |
| Starters | Portobello alla griglia con caprino | Dramatic Truffle-Stuffed Mushrooms.png | 1.98 | Likely |
| Starters | Calamaretti fritti ai sette sapori | Cheesy Calamari Rings on Wooden Board.png | 2.25 | Clear |
| Starters | Baccalà impanato con salsa Pizzaiola | Golden Crusted Fish with Tomato Ragout.png | 1.81 | Clear |
| Starters | Cicchetti della casa | Moody Charcuterie Board with Grilled Bites.png | 1.99 | Clear |
| Starters | Bruschetta con zucca, caprino e noci | Steaming Pumpkin Crostini with Thyme.png | 2.04 | Clear |
| Pasta & risotto | Linguine con gamberi | Steaming Shrimp Linguine in Rustic Parchment.png | 1.73 | Clear |
| Pasta & risotto | Penne con funghi, noci e Gorgonzola | Dramatic Creamy Mushroom Penne.png | 2.00 | Clear |
| Pasta & risotto | Fettucce alla crema di zucca | Steaming Fettuccine with Thyme and Seared Garnishes.png | 1.99 | Likely |
| Pasta & risotto | Fettucce al ragù di manzo con fonduta di Pecorino | Cinematic Pasta Ragù with Creamy Sauce.png | 1.73 | Clear |
| Pasta & risotto | Penne alla vodka | Creamy Penne with Pancetta and Parsley.png | 2.06 | Likely |
| Pasta & risotto | Risotto con zucchine e salmone | Creamy Salmon Risotto with Lemon Zest.png | 1.67 | Clear |
| Specialities | Pollo e salsiccia | Rosemary-Glazed Meat and Mushrooms.png | 1.62 | Likely |
| Specialities | Bistecca di manzo con crema di funghi | Crosshatched Steak with Creamy Sauce.png | 1.91 | Clear |
| Specialities | Filetto di manzo in crosta di pistacchi | Pistachio-Crusted Steak with Root Vegetables.png | 1.70 | Clear |
| Specialities | Pesce spada al salmoriglio | Grilled Herb Fish with Lemon and Vegetables.png | 1.83 | Likely |
| Specialities | Branzino in crosta di noci | Glossy Sauced Seabass with Roasted Vegetables.png | 1.82 | Likely |
| Specialities | Salmone alla mostarda | Cinematic Seared Salmon with Herb Sauce.png | 1.58 | Likely |
| Specialities | Polenta grigliata con zucca e Pecorino | Charred Polenta Wedges with Roasted Vegetables.png | 1.80 | Clear |
| Sides | Patate arrosto al rosmarino | — | — | None |
| Sides | Spinaci al Parmigiano | — | — | None |
| Sides | Insalata mista | — | — | None |
| Sides | Verdure miste | — | — | None |
| Desserts | Mousse al cioccolato e Amaretto Disaronno | Moody Chocolate Mousse on Charcoal Plate.png | 1.90 | Clear |
| Desserts | Semifreddo alla nocciola | Dramatic Chocolate Drizzle Dessert.png | 2.03 | Likely |
| Desserts | Tiramisu | Cocoa-Dusted Tiramisu on a Glowing Plate.png | 2.20 | Clear |
| Desserts | Pannacotta alla vaniglia | Vanilla Panna Cotta with Berries.png | 1.99 | Clear |
| Desserts | Tartufi di cioccolato | Pistachio and Cocoa Truffle Plate.png | 2.06 | Clear |
| Desserts | Biscotti | Powdered Sugar Biscotti Starflower.png | 1.86 | Clear |
| Desserts | Gelato / Sorbetto | Realistic Ice Cream Sundae in Frosted Glass.png | 2.46 | Likely |
| Cheese | Formaggi con marmellata di cipolle | Rustic Cheese Board with Caramelized Onions.png | 2.07 | Clear |

### Spare photos (no dish assigned; possible alternates)

| Photo file | MB | Note |
|---|---|---|
| Bruschetta on a Dark Plate.png | 2.00 | |
| Cinematic Golden Herb Pasta Tower.png | 1.88 | |
| Glossy Shrimp Pasta Nest.png | 1.96 | |
| Steaming Seafood Pasta in Warm Light.png | 1.98 | |
| Moody Steak Plate with Softened Reflection.png | 1.73 | |
| Creamy Herb Fish with Roasted Peppers.png | 1.63 | |
| Cinematic Stew on a Black Plate.png | 1.78 | |
| Golden Arancini with Tomato Sauce.png | 1.83 | Arancini are not on the menu |

Total: 27 assigned + 8 spare = 35.

## 2. Missing

| Asset | Needed for | Until it arrives |
|---|---|---|
| 4 side-dish photos | Menu: I contorni | Text-only (D14) |
| Venue photos (entrance, stairs, North Parade, rooms, details, restaurant) | Venue page, Home venue teaser | Placeholders **(MOCK)**, one slot each in `data/venue.json` |
| Hero video | Home hero | Placeholder clip and poster **(MOCK)** (D9; `site.json` `media.heroVideo`) |
| Booking-section video (optional) | Home booking band | Placeholder clip and poster **(MOCK)** (`site.json` `media.bookingVideo`) |
| Logo in vector format (SVG/AI/EPS) | Header, footer, favicon, social image | Placeholder **(MOCK)**. The current site has only a 300 × 115 PNG |
| Brand colours and fonts | Whole site | Placeholders **(MOCK)** from `DESIGN_SYSTEM.md` |
| Bar menu images | — | Not needed: the Wine tab, bar menu included, is text only |
| Street photo (Venue 3a) | Venue "The street" | `commons/Bath, Somerset - 01.jpg` from Wikimedia Commons, Benjamin Smith, CC BY-SA 4.0; credit line required (D63) |
| Find Us map | Find Us, Home teaser | Drawn by `npm run map` from an OpenStreetMap extract (Overpass API, 2026-11-16, ODbL, "© OpenStreetMap contributors"). The raw extract is in `.cache/map/osm.json` (not in git); to refresh it, re-run the Overpass query in `scripts/map.ts`'s box (D64) |
| Concrete texture | Site background | From the current site: `sottosottobackground2.jpg` (2879 × 1391), kept in `sotto sotto assets/old-site/`; web copy `public/textures/concrete-1440.*` (D55) |
| Social share image | Link previews | To be made once photos and logo arrive |

The current site's slideshow images (`images/new/1.jpg` … `18.jpg` and five others) were not downloaded. Their content and quality are unknown.

## 3. Specs given to the client

| Asset | Spec |
|---|---|
| Photos | At least 3000 px wide, original files |
| Hero video | 15–30 s, seamless loop, horizontal, 1080p or 4K, atmospheric, no talking or music |

## 4. Web output targets

Budgets are in `DESIGN_SYSTEM.md` section 5: hero video about 3–4 MB (1080p, MP4 + WebM, with poster); images WebP/AVIF at roughly 150–300 KB.

## 5. Client documents received (2026-11-14)

| Document | Format received | Stored in repo |
|---|---|---|
| Food Menu November 26 | Transcribed in the project brief | No (Q37) |
| Wine Menu October 26 | Transcribed in the project brief | No (Q37) |
| Bar menu | Transcribed in the project brief | No (Q37) |
| Allergy Form April 2026 | Transcribed in the project brief | No (Q37) |
| Bar Allergy Form | Transcribed in the project brief | No (Q37) |
| Car park list, North Parade summary | Transcribed in the project brief | No |

No new photos or video came with this update. The dish-to-photo map in section 1 is unchanged: the November menu has the same dishes as before.
