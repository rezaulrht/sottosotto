# Launch checklist

Steps from `ARCHITECTURE.md` §13, in order. Launch starts only when `npm run build:production` passes, i.e. when every item in `CLIENT_REVIEW.md` is answered.

## Before staging (needs Q41)

- [ ] Hosting account created under the owner agreed in Q41 (recommended: Cloudflare Pages).
- [ ] Cloudflare Pages project created (direct upload). Repository settings → Variables: `STAGING_DEPLOY=on`, `CF_PAGES_PROJECT=<project name>`. Secrets: `CLOUDFLARE_API_TOKEN` (Pages: Edit only), `CLOUDFLARE_ACCOUNT_ID`.
- [ ] Push to the `staging` branch: `.github/workflows/deploy-staging.yml` builds with `SITE_ENV=staging` (noindex, robots disallow, CSP report-only, mock badge) and deploys.
- [ ] Cloudflare Access policy on the staging hostname, allowing the reviewers' emails only.
- [ ] Send the client the staging URL and `CLIENT_REVIEW.md`.

## Before launch

- [ ] `CLIENT_REVIEW.md` sections 1 and 2 are empty; `npm run build:production` passes.
- [ ] Section 3 checks done on staging (Lighthouse, Rich Results, screen readers, zoom, browsers, real devices).
- [ ] DNS (Q42): full record list copied from the current provider, **MX, SPF, DKIM and DMARC for info@ and careers@** first; TTLs lowered a day ahead.
- [ ] Main address chosen (`www` or bare domain, Q42); the other redirects to it.
- [ ] GA4 property access confirmed (Q11).
- [ ] Production branch `main` builds with `SITE_ENV=production`; CSP enforced.

## Cut-over

- [ ] Custom domains added; HTTPS issued.
- [ ] Check: security headers present; `/pdf/menu.pdf`, `/pdf/Dessert.pdf`, `/pdf/winelist.pdf` and `/?p=…` links land on the right pages; booking; no request to Google before consent; GA4 after Accept.
- [ ] Mail to info@ and careers@ still arrives (send a test before and after).

## After launch

- [ ] Sitemap submitted in Search Console.
- [ ] Google Business Profile: hours, address, website and booking link updated (Q11).
- [ ] After a stable week: add `includeSubDomains` to HSTS if every subdomain serves HTTPS.
