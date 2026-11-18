# Open questions

Nothing here may be guessed. When a question is answered, update the data or docs, record it in `DECISIONS.md` if it is a decision, and remove the row. Numbers are stable; gaps are questions already answered.

**Blocks launch** = cannot go live without it. **Blocks build** = that part cannot be finished without it.

Last updated 2026-11-14 (Update 1). Answered and removed: Q19 (signature dishes: Home shows the menu's courses instead, D68), Q25 (Hospres in a sheet: no longer needed, D59), Q2 (parking list: replaced by Q30), Q17 (privacy policy: used as is, D25), Q20 (architecture approved), Q26 (placeholder video, D50), Q43 (static map, D42), Q44 (Next.js, D30), Q46 (tools approved), Q49 (branching, D49).

## Client: facts

| # | Question | Why it matters | Blocks |
|---|---|---|---|
| Q1 | What are the exact street address and map pin, phone number, info@ and careers@ emails? The address is a mock ("10 North Parade"); the current site shows both "10 N Parade" and "12a North Parade". Phone and emails are placeholders from the current site. The press pages you sent (2012–2015) give 10 North Parade, Bath BA2 4AL and 01225 330236. | Footer, Find Us, map, careers, search listings | Launch |
| Q13 | Are 14:00 and 22:00 last orders or closing times? The old meta text said "last orders 2pm and 10pm" with closing at 2.30 and 10.30. | Wording of hours and the "Open today" chip | Launch |
| Q14 | Holiday closures. The Christmas Day and 1–14 January closures are mock placeholders from the old footer. What are the real ones (bank holidays too)? | Hours chip must not say "Open today" on a closed day | Launch |
| Q10 | Which social accounts are current? Facebook and Twitter links are mock (from the old site, not checked). Is there an Instagram account to link (link only, no feed)? | Footer links | Launch |
| Q12 | Exact wording of the allergy note and the sourcing note on the printed menu. We hold paraphrases only. | Menu, Dessert and Wine sections | Launch |
| Q15 | What is the 125 ml price for still wines by the glass? The list says 125 ml is available but gives no price. | Wine list | No (can show the note only) |
| Q27 | Are the dessert and cheese prices still right? They come from the old website PDF; they are not on the November 2026 menu. | Prices shown on the Dessert section | Launch |
| Q30 | Real walking times from the restaurant to the three car parks (current values are mock estimates), and the address of the Bath Cricket Club Public Car Park. Also: do you want the optional "Getting here" lines (train, on foot), and what should they say? Both are mock. | Find Us parking cards | Launch |
| Q34 | The restaurant's own story: who founded it and when it opened. A MOCK placeholder is in `data/venue.json`. The Bath Chronicle page the client sent (26 January 2012) says Sotto Sotto opened then, founded by Antonio Abategiovanni, chef Giuseppe D'Elisa and Carlo Battaglia: is that right, and can we use it? | Venue page "Our story" | Launch |

## Client: menu and allergens

| # | Question | Why it matters | Blocks |
|---|---|---|---|
| Q28 | Allergens for Formaggi con marmellata di cipolle (cheese board). It is not on the April 2026 allergy form, so it shows no allergens. | A cheese board with no labels can be read as "nothing to declare" | Launch |
| Q29 | Please confirm or correct our estimated allergens for the three sparkling cocktails, which are not on the bar form: Bellini none · Hugo Spritz Citrus (can be made without) · Aperol Spritz Citrus. Team proposal: do not show these until confirmed. | These are our guesses, not the client's data | Launch |
| Q36 | Please confirm our spelling corrections to the bar menu: Carla Blanca → Carta Blanca, Capirinha → Caipirinha, greenage → greengage, crips → crisp, standard mix → standard mixer. | Published names | No |
| Q38 | The allergen list differs from the UK's 14 regulated allergens: it has no Sulphites (present in wine and Prosecco), Lupin or Peanuts, uses "Nuts" for all nuts, and "Lactose" rather than "Milk". D20 stands; we ask the client to confirm they are happy with that wording on the public site, ideally with their food-safety adviser. | Guests with a milk-protein, peanut or sulphite allergy may read the labels as complete | Launch |
| Q39 | A few allergy-form entries to double-check: Linguine con gamberi lists Crustaceans as "can be made without" in a prawn dish; Risotto con zucchine e salmone lists Crustaceans and Molluscs (not in the description). Is there a "may contain" / cross-contamination note to add? | Accuracy of safety information | Launch |
| Q35 | Wording for an item the form lists with no allergens (e.g. Patate arrosto, Sorbetto, White Garden). Proposal: "None of our listed allergens". | Must not read as "allergen-free" | Build |
| Q40 | Bar menu gaps: price of the Vodka and Gin Martini; which juices are offered; ABV of Jack Daniel's (not given). Spellings kept as supplied: "Kahlua" (cocktails) and "Kahlúa" (liqueurs), "Jose Cuervo" and "José Cuervo", "Ciroc". Should these be made consistent? | Bar menu completeness | No |
| Q32 | Should the Wine tab be renamed "Drinks" now that it holds the bar menu? Client's choice, later. Only the label changes. | Menu tab bar | No |

## Client: content and assets

| # | Question | Why it matters | Blocks |
|---|---|---|---|
| Q3 | Photos for the 4 side dishes. | Sides are text-only until then | No |
| Q4 | Check the 9 "likely" photo matches by eye (list in `ASSETS.md`). | A wrong photo next to a dish misleads guests | Launch |
| Q5 | Are the 35 dish images real photographs of Sotto Sotto's dishes? Are larger originals available (they are about 1535 px wide; the spec asks for 3000 px)? | Image quality on large screens; images must show the dishes actually served | Launch |
| Q6 | Venue photos. We now use 13 photos from your current website (corridor, candles, vault, bar, dining room, details; D69), but they are only 500 × 350 px and look soft at full screen. Are they still current, and can you send the originals or new photos? | The whole Venue page and the Home venue teaser | Launch |
| Q7 | Hero video, and the optional second video for the booking band. Both are MOCK placeholders. | Home hero | Launch |
| Q9 | Logo in vector format (SVG, AI or EPS). Placeholder until then. | Only a small PNG exists | Build |
| Q31 | Brand colours and fonts, if the client has any. The `DESIGN_SYSTEM.md` palette and type are placeholders. | Visual design | Build |
| Q16 | Venue copy: may we use the TripAdvisor Certificate of Excellence sentence and the two press quotes (The Times 2012, The Sun 2013)? The TripAdvisor claim is undated, and the Sun quote names dishes no longer on the menu. | Extra venue copy beyond the North Parade text | No |
| Q33 | Verify the North Parade text against a reliable source (e.g. Historic England) before launch: "designed by John Wood the Elder in 1741", "honey-coloured Bath stone", "views over the River Avon and Parade Gardens". It came from a Google summary. | Published historical claims | Launch |
| Q37 | Please send the original files (menus, allergy forms, bar menu) so they can be kept with the project. We hold only transcriptions. | Lets us recheck prices and allergens against the source | No |
| Q18 | The careers text asks applicants to send a photograph. Does the client want to keep that request? | Client's call; worth a check with their HR or legal adviser | No |

## Client: access

| # | Question | Why it matters | Blocks |
|---|---|---|---|
| Q50 | Booking rules for the new booking screens: time between slots (now 15 min), last seating before each session ends (now 60 min; see Q13), how far ahead guests can book (now 60 days), minimum notice (now 2 hours), deposits or card details, and how guests amend or cancel. All MOCK in `site.json` `booking.rules`. The limit of 5 guests comes from the current Hospres widget. | Booking flow | Launch |
| Q51 | The restaurant uses Hospres for its bookings today. Does the client agree to stop using it on the website (D59)? Existing bookings and the staff's workflow are in Hospres. | Booking, staff workflow | Launch |
| Q52 | Cookie banner wording (new, in `site.json` `copy.cookieBanner`, flagged to confirm): heading "Cookies", the sentence explaining Google Analytics, and the labels "Accept analytics", "Reject" and "Cookie settings". Please approve or edit. | The banner is shown to every new visitor | Launch |
| Q53 | Two of the press pages you sent show awards (FOUR Bath: "Best Italian, Winner", Great Food Awards 2012; InBath: Best Italian Restaurant at the Bath Good Food Awards). Earlier you told us those awards were not genuine. Please confirm in writing that we may show these pages. | Home press section | Launch |
| Q54 | The press pages look digitally restored, and the FOUR Bath page's small text is garbled. Can you send the original scans or photos of the cuttings? | Home press section | Launch |
| Q55 | Dates and publication names missing on four press pages: the Bath Life review (pages 38–39), InBath (May/June, which year?), Beautiful Bath, and the restaurant guide listing (which publication?). | Home press section | No |
| Q8 | Booking backend (D59): Hospres is no longer used, so where are bookings stored and how does staff see, change and cancel them (our own backend, or another booking provider with an API)? Until this is decided the guest screens are a preview and nothing is booked; the production build stays blocked. | Taking real bookings | Launch |
| Q11 | Access to the GA4 property `G-2TMCMCTHRD` (who owns it, admin access for us) and to Google Business Profile. | Analytics, consistent address and hours on Google | Launch |
| Q41 | Hosting account: who owns and pays for it (client or agency)? Recommendation is Cloudflare Pages (free tier allows commercial use). | Deploys, staging, ownership at hand-over | Build (staging, M9) |
| Q42 | Domain: who is the registrar, who controls DNS, and which provider runs the info@ and careers@ mailboxes? We need the full current DNS record list (MX, SPF, DKIM, DMARC) before any change. Also: `www.sottosotto.co.uk` or the bare domain as the main address? | Launch without breaking email | Launch |
| Q45 | Who reviews staging? Email addresses for the access-protected preview. | Client review (M9) | No |
| Q48 | Are there other old URLs we must keep working, e.g. menu PDF links posted on Google, TripAdvisor or social pages? | Redirect list (M8) | Launch |

## Team

| # | Question | Why it matters | Blocks |
|---|---|---|---|
| Q47 | Where are the original photos and videos kept and backed up, since they stay out of git (D36)? | Originals must not exist only on one laptop | No |
| Q21 | Page titles and meta descriptions for each page. The old ones contradict the agreed hours and carry award claims. | Search results and link previews | Launch |
| Q22 | Consent scope. Should a Google Map (if added later) wait for consent or a click (a third-party embed that can set cookies)? The privacy policy text is used as is (D25) and does not mention analytics or how booking details are handled (Q8). | Cookie banner design | Build |
| Q23 | Design system sign-off (`DESIGN_SYSTEM.md` is a proposal), including whether to keep Spectral SC. | Visual build | Build |
| Q24 | Menu dimming and contrast. Dimming text to 25–35% fails WCAG AA. Is the proposed fix accepted (dim photos only; unlit text uses a dimmer colour that still passes)? Allergen labels follow the same rule. | Menu page | Build |
