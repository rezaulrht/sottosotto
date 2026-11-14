# Content

All copy for the new site. Source for existing copy: `~/byteSpate/targets/sottosotto-site/index.html` (line numbers in brackets). Existing copy is quoted exactly unless a change is listed. Menu content lives in `data/` and is not repeated here.

| Status | Meaning |
|---|---|
| Keep | Moves to the new site as is |
| Fix | Kept with the small correction listed |
| Hold | Needs a client answer first |
| Remove | Not carried over |
| New | Needed by the new design; wording to be agreed |

## 1. Global

| Item | Text | Status |
|---|---|---|
| Name | Sotto Sotto | Keep |
| Tagline / page title [97] | Italian Restaurant in Bath | Keep |
| Logo alt text [115] | sotto sotto - italian restaurant in bath | Keep |
| Book button [118] | "Book Online" → "Book a Table" (D1) | Fix |
| Modal heading [108] | Book a Table | Keep |

## 2. Footer (every page)

| Item | Text | Status |
|---|---|---|
| Philosophy line [760] | The main characteristic of our cuisine is simplicity. We rely on the quality of our ingredients rather than on elaborate preparation. | Keep |
| Booking note [762] | Sotto Sotto is a very small restaurant and booking is strongly recommended. | Keep |
| Hours [764] | We are open 5 days a week 12 pm to 2 pm & 5 pm to 10 pm. We are closed on Mondays and Sundays. | Keep (generated from `site.json`) |
| Seasonal closures [766] | We are closed on Mondays and Sundays, Christmas Day & from 1st - 14th January | Hold (Q14) |
| Address | Sotto Sotto, 10 North Parade, Bath, BA2 4AL **(MOCK)**. The current site shows both "12a North Parade" [769] and "10 N Parade" [392]. | Hold (Q1, D23) |
| Phone [769] | Reservations & Enquiries: 01225 330236 (placeholder, to confirm) | Hold (Q1, D24) |
| Email [769] | Enquiries only: info@sottosotto.co.uk (placeholder, to confirm) | Hold (Q1, D24) |
| Privacy link | Privacy Policy | Keep |
| Social | Facebook, Twitter **(MOCK)** | Hold (Q10) |

## 3. Home

| Item | Text | Status |
|---|---|---|
| Intro quote [219] | "Situated just a few steps away from the Roman Baths, the casual warmth of Sotto Sotto invites you to have a fun dining experience." | Keep (placement proposed in `PAGES.md`) |
| Philosophy heading [359] | Our Food Is Our Culture | Keep |
| Philosophy para 1 [360] | The main characteristic of our cuisine is simplicity. We rely on the quality of our ingredients rather than on elaborate preparation. | Fix: source reads "is it's simplicity"; footer wording used |
| Philosophy para 2 [362] | We also like to offer traditional Italian dishes with a contemporary twist because we strongly believe in those 'Sapori' (flavours). | Keep |
| Philosophy para 3 [364] | With our finest ingredients coming from Italy, and all of our fresh vegetables, seafood and meats sourced locally, we are able to ensure that you get the best quality dining that will exceed your expectations. | Keep |
| Hero badge | Book a table | New |
| Venue teaser link | Step inside | New |
| Wine strip title | From the cellar | New |
| Booking band | Reserve your table | New |
| Find us teaser link | Parking nearby | New |

## 4. Venue

The current venue section is built around award claims, so little of it can move across.

| Item | Text | Status |
|---|---|---|
| Heading [282] | Voted Best Italian in Bath | Remove (award claim, D15) |
| Award sentence [284] | We have been awarded Best Italian Restaurant in Bath at the Bath Good Food Awards. | Remove (D15) |
| TripAdvisor sentence [284] | We were also recently awarded a Certificate of Excellence by Trip Advisor - only the top 10% of businesses worldwide receive this prestigious award. | Hold (Q16) |
| City sentence [284] | We are proud to be part of the beautiful city of Bath and to host it's locals and worldwide visitors. | Fix: "it's" → "its" |
| Press quote 1 [288] | "Ok, it may not be modern Rome, but many an ancient Roman would have loved it at the Thermae Bath Spa. Lounge in the natural thermal waters, imagining you are emperor in his pomp, then head for an Italian meal at Sotto Sotto." - The Times, Monday 27th August 2012 | Hold (Q16) |
| Press quote 2 [291] | "We don't know if it's the Roman influence in Bath, but you won't find finer Italian food than at Sotto Sotto. Try the prawns with Tuscan bean salad, and butternut squash cannelloni, but leave room for the sweet limoncello profiteroles." - Fabulous, The Sun, Sunday 14th July 2013 | Hold (Q16). Names dishes that are not on the current menu. |
| Award badge caption [139] | Awarded "Best Italian Restaurant in Bath" at the Bath Good Food Awards | Remove (D15) |
| Room and detail captions | Not written yet. Depend on the venue photos. | Hold (Q6) |
| Booking prompt | See it for yourself | New |

### The street (section 3a) — `data/venue.json` `setting`

From the client, 2026-11-14 (a Google summary). The fact sentence is kept exactly as supplied and **needs verification** against a reliable source such as Historic England before launch (Q33). The lines around it add no new facts.

| Item | Text | Status |
|---|---|---|
| Eyebrow | The street | New |
| Heading | On North Parade | New |
| Lead | Sotto Sotto is on North Parade. | New |
| Fact | North Parade is a historic Georgian street and promenade in central Bath, designed by John Wood the Elder in 1741, built in honey-coloured Bath stone, with views over the River Avon and Parade Gardens. | Hold (Q33: needs verification) |
| Close | Leave the street, take the stairs, and step inside. | New |

This text describes the street, not the restaurant. It must not be reworded to imply that Sotto Sotto's own building was designed by John Wood or has river views; neither is known.

### Our story (section 3b)

| Item | Text | Status |
|---|---|---|
| Heading | Our story | New |
| Body | **(MOCK)** Placeholder: who founded Sotto Sotto and when it opened. To come from the client. | Hold (Q34) |

## 5. Menu page

| Item | Text | Status |
|---|---|---|
| Tabs | Menu · Dessert · Wine | New |
| Dishes | `data/menu.json`: client's Food Menu November 26 wording and prices (D17) | Keep |
| Desserts, cheese | `data/desserts.json`: unchanged from the website PDF (D18) | Keep (prices to confirm, Q27) |
| Wines | `data/wine.json` `groups`: Wine Menu October 26, full tasting notes | Keep |
| Bar menu | `data/wine.json` `drinks`: cocktails, beer, soft drinks, spirits, coffee, liqueurs (D19) | Keep (typo fixes to confirm, Q36) |
| Allergy note | Guests are asked to tell staff about any allergies or intolerances in advance. *(paraphrase, held in `data/allergens.json`)* | Hold (Q12: exact wording) |
| Sourcing note | Fresh local ingredients; Italian products imported from Italy. *(paraphrase)* | Hold (Q12: exact wording) |
| Legend | (v) vegetarian · (n) contains nuts or traces of nuts | Keep |
| Allergen key | Contains · Can be made without *(proposed labels for the client's x and x\*)* | New |
| Allergen: none listed | None of our listed allergens *(proposed)* | New (Q35) |
| Wine notes | Glass prices are for 175 ml (wine) or 125 ml (sparkling). Wines by the glass are also available in 125 ml. All prices include VAT. | Keep |
| Bar notes | Vodka and Gin Martini are available. · More cocktails are available upon request. · Choice of standard mixer add 50p | Keep |
| PDF links [367–369] | Menu, Dessert, Wine List | Remove (D15) |

## 6. Find Us

| Item | Text | Status |
|---|---|---|
| Heading [376] | Enquiries | Keep |
| Phone [377] | 01225 330236 (placeholder, to confirm) | Hold (Q1) |
| Email [379] | info@sottosotto.co.uk (placeholder, to confirm) | Hold (Q1) |
| Response note [381] | We will respond to your email within 24 hours. | Keep |
| Map button | Get directions | New |
| Parking | Sports and Leisure Centre car park · Manvers Street Car Park (Open 24/7) · Bath Cricket Club Public Car Park. Names and addresses from the client; walking times **(MOCK)**; Cricket Club address missing. | Hold (Q30) |
| Getting here | Train and on-foot lines **(MOCK, optional)** | Hold (Q30) |
| Careers heading [383] | Careers at Sotto Sotto | Keep |
| Careers text [384] | We are always looking for dedicated professionals to join our team. | Keep |
| Careers text [386] | If you are interested in working at Sotto Sotto please apply by sending a brief covering letter, CV and photograph to careers@sottosotto.co.uk | Keep (see Q18 about the photograph) |
| Careers button | Send your CV | New |

## 7. Privacy policy

Existing text, exact, with no changes (D25). Shown as a plain page.

---

### Sotto Sotto Privacy Policy

**About this policy**

Sotto Sotto is committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible way. This policy outlines how we aim to achieve this and includes the information collected when:

- you use our website (www.sottosotto.co.uk)
- you contact us by telephone
- someone is interested in working with us.

**Definition of Personal Data**

Personal Data means any data that relates to an identifiable person who can be directly/indirectly identified from that data. In this case, it means personal data that you give to us via our site or when speaking to us on the telephone.

By providing your personal data, you agree that we can use your personal data in accordance with this policy.

Please ensure you understand this policy in its entirety and take your time to read it.

**Who are we?**

Sotto Sotto is an Italian restaurant based in Bath, England.

Our address is: 12a North Parade, Bath, BA2 4AL. Telephone: 01225 330236

**How do we collect information from you?**

We collect information from you when:

- you make a booking
- you visit our restaurant
- you make an enquiry

**What type of information is collected from you?**

You may be asked to submit personal information about yourself when you make a booking. We will collect this information so we can fulfil your booking request and you may dine at our venue.

When you make a booking Sotto Sotto collects information such as:

- title
- name
- e-mail address (used for booking confirmation and post-dining feedback emails)
- home or work address
- billing information taken for deposits, ticketing, or holding credit card information for use in the case of no-shows (where applicable)
- telephone number
- company name (if corporate booking)
- dietary requests

When you dine at Sotto Sotto we may collect:

- preferences/ allergies etc
- current and past restaurant reservation details
- payment information

Careers:

You may submit your CV if you're interested in working for us either in person or via careers@sottosotto.co.uk. This information may include:

- personal details
- photograph
- employment details
- education
- salary history
- other relevant details

We will use this information to assess your application. We may also keep it in our records for future reference in accordance with our retention policy. Please get in contact if you would no longer like us to hold your records at info@sottosotto.co.uk

**How is your information used?**

Our use of your personal data will always have a lawful basis, either because it is necessary to complete a booking or because it is in our legitimate interests.

We require the information outlined in the previous section to understand your needs and provide you with a better service, and in particular for the following reasons:

- Internal record keeping.
- Send you service emails and/or texts (booking confirmation and post-dining feedback).
- Improve our products and services.

**Who has access to your information?**

We will not sell, distribute, or lease your personal information to third parties. Any personal information we request from you will be safeguarded under current legislation.

We will only share your information with companies if necessary to deliver services on our behalf. For example, SilverStream for the provision of bookings, third-party payment processors for payments.

**How and where do we store data?**

We only keep your personal data for as long as we need to in order to use it as described in this privacy policy, and/or for as long as we have your permission to keep it.

Reservations data held in SilverStream software will only be stored in the UK.

**Your choices**

We will not contact you for marketing purposes by email, phone or text message unless you have given your prior consent. We will not pass your details to any third parties for marketing purposes unless you have expressly permitted us to. Furthermore, you can change your marketing preferences at any time by contacting us by email at info@sottosotto.co.uk.

Please be aware that you have the following data protection rights:

- The right to be informed about the personal data the Company processes on you;
- The right of access to the personal data the Company processes on you;
- The right to rectification of your personal data;
- The right to erasure of your personal data in certain circumstances;
- The right to restrict processing of your personal data;
- The right to data portability in certain circumstances;
- The right to object to the processing of your personal data that was based on a public or legitimate interest;
- The right not to be subjected to automated decision making and profiling; and
- The right to withdraw consent at any time.

If you believe that any of your data that the Company processes is incorrect or incomplete, please contact us using the details above and we will take reasonable steps to check its accuracy and correct it where necessary.

You have a right to request a copy of the personal information that Sotto Sotto holds about you and have any inaccuracies corrected. Any such requests should be made to this email address: info@sottosotto.co.uk

**Security**

Data security is very important to us, we take every precaution to protect our users' information through the use of firewalls, browser certification technology, encryption, limited access, use of passwords.

Only employees who need the information to perform a specific job are granted access to your information.

However, you should be aware that the use of email/ the Internet is not entirely secure and for this reason the Company cannot guarantee the security or integrity of any personal information which is transferred from you or to you via email/ the Internet.

**Use of 'cookies'**

Like many other websites, we use cookies. We use them to help you personalise your online experience.

A cookie is a text file that is placed on your hard disk by a web page server which allows the website to recognise you when you visit. Cookies only collect data about browsing actions and patterns, and do not identify you as an individual.

Before Cookies are placed on your computer or device, you will be shown a pop-up requesting your consent to set those Cookies. By giving your consent to the placing of Cookies you are enabling us to provide the best possible experience and service to you. You may, if you wish, deny consent to the placing of Cookies; however certain features of Our Site may not function fully or as intended.

You can choose to enable or disable Cookies in your internet browser. Most internet browsers also enable you to choose whether you wish to disable all Cookies or only third-party Cookies. By default, most internet browsers accept Cookies, but this can be changed. For further details, please consult the help menu in your internet browser or the documentation that came with your device.

You can choose to delete Cookies on your computer or device at any time, however you may lose any information that enables you to access Our Site more quickly and efficiently including, but not limited to, login and personalisation settings.

We may use IP addresses to analyse trends, administer the site, track users' movements, and to gather broad demographic information for aggregate use. IP addresses are not linked to personally identifiable information.

**What happens if our business changes hands?**

If the Company's business is sold or integrated with another business your details may be disclosed to our advisers and any prospective purchasers and their advisers and will be passed on to the new owners of the business.

**Changes to this statement**

Sotto Sotto will occasionally update this Privacy Policy to reflect company and customer feedback. We encourage you to periodically review this statement to be informed of how we are protecting your information. This policy was last updated in October 2018

**Contact Information**

Sotto Sotto welcomes your comments regarding this Privacy Policy. If you believe that we have not adhered to this Privacy Policy, please contact us at info@sottosotto.co.uk. We will aim to use commercially reasonable efforts to promptly determine and remedy the problem.

You also have the right to raise concerns with Information Commissioner's Office on 0303 123 1113 or at https://ico.org.uk/concerns/, or any other relevant supervisory authority should your personal data be processed outside of the UK, if you believe that your data protection rights have not been adhered to.

---

## 8. Not carried over

| Item | Source text | Reason |
|---|---|---|
| Meta description [20, 26] | We are open daily 12pm to 2.30pm & 5pm to 10.30pm (last orders 2pm and 10pm) | Contradicts the agreed hours (D6) |
| Meta keywords [22] | Sotto Sotto, Italian, Restaurant, Bath, Best, Awarded | Obsolete tag; includes an award claim |
| `og:type` [12] | Best Italian Restaurant In Bath | Invalid value; award claim |
| Award badges and caption [139] | Bath Good Food Awards 2012 / 2014 | D15 |
| PDF menu links [367–369] | menu.pdf, Dessert.pdf, winelist.pdf | D15 |

New page titles and meta descriptions have to be written for every page. They are not in the sources (Q21).
