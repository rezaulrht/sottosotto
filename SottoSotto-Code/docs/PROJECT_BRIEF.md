# Project brief

## Client

| | |
|---|---|
| Business | Sotto Sotto, a small Italian restaurant |
| Location | North Parade, Bath, UK (Bath is in Somerset, not London) |
| Website | sottosotto.co.uk |
| The place | Historic building, reached by stairs. People come for the venue as much as the food. |

## Goal

A modern, luxury, flagship-level restaurant website with cinematic motion, video and refined animation, at the level of sites featured on Awwwards.

Motion and feel reference (inspiration only, do not copy): https://fidalgo.qodeinteractive.com/

## Current site

| Area | Finding |
|---|---|
| Build | One static HTML page made in Dreamweaver around 2010. Hidden `<div>`s act as pages (`?p=menu` etc.). |
| Libraries | jQuery 3.5.1, a 2010 fade slideshow plugin, cookieconsent 3.1.0 (notice only) |
| Menus | Three PDF links (menu, dessert, wine list) |
| Booking | Third-party Hospres widget in an iframe (`app.hospres.com/YO7Z73/reserve`), opened from a "Book Online" modal |
| Venue page | Broken |
| Layout | Not responsive (fixed pixel widths) |

Full findings: `~/byteSpate/investigations/sottosotto/ledger.md`.

## Issues to fix in the rebuild

| Issue | Fix |
|---|---|
| Universal Analytics `UA-46473274-1` and GA4 `G-2TMCMCTHRD` fire before consent | Remove UA (retired). Keep GA4, load it only after consent. |
| Contradictory hours (meta says "open daily", footer says 5 days) | One source: `data/site.json` (decision D6) |
| Contradictory address ("10 N Parade" vs "12a North Parade") | One source: `data/site.json`; mock until the client confirms |
| Broken Facebook link, old Twitter link format | Corrected in `data/site.json`; client to confirm |
| Mixed `http://` links | HTTPS everywhere |
| No security headers | Add HSTS, CSP and frame rules (details in the architecture task) |
| `robots.txt` and `sitemap.xml` return 404 | Add both |

## Scope

| Keep | Remove | Not in this build |
|---|---|---|
| Almost all existing text (see `CONTENT.md`) | Award badges and award claims (Bath Good Food Awards 2012/2014; the client says they are not genuine) | Admin panel or CMS |
| Own booking screens (D59; backend later) | PDF menus | Events, testimonials, shop, Instagram feed |
| Bar menu and allergens (added 2026-11-14) | | |
| GA4 (behind consent) | Universal Analytics tag | Accessibility details and private hire on the Venue page |
| | Careers as a page or footer link | Booking backend (Q8) |

## Client material received

| Date | Material | Used in |
|---|---|---|
| 2026-11-14 | Food Menu November 26 | `data/menu.json` (replaces the website PDF for savoury dishes) |
| 2026-11-14 | Wine Menu October 26 | `data/wine.json` `groups` (fuller tasting notes) |
| 2026-11-14 | Bar menu | `data/wine.json` `drinks` |
| 2026-11-14 | Allergy Form April 2026, Bar Allergy Form | `data/allergens.json` and each item's `allergens` |
| 2026-11-14 | Car park list | `data/site.json` `parking` |
| 2026-11-14 | North Parade summary (from Google) | `data/venue.json` `setting` (needs verification) |

Only transcriptions in the project brief are available; the original files are not in this repo (OPEN_QUESTIONS Q37).

## Pages

Home, Menu, Venue, Find Us, Privacy, plus a booking modal available everywhere. Spec: `PAGES.md`.

## What is not here yet

Tech stack, architecture and code. Those are the next task. Everything unknown is listed in `OPEN_QUESTIONS.md`.
