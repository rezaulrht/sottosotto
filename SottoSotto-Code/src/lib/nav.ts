/** Main navigation (D1). Privacy is footer-only; booking is the Book a Table button. */
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu/', label: 'Menu' },
  { href: '/venue/', label: 'Venue' },
  { href: '/find-us/', label: 'Find Us' },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

/** The guest booking page (D59). Book a Table buttons link here; with JS they open the booking dialog. */
export const BOOK_PATH = '/book/';

/** Every route, for the sitemap and smoke tests. */
export const ROUTES = ['/', '/menu/', '/venue/', '/find-us/', '/book/', '/privacy/'] as const;

/**
 * The old one-page site's deep links, `/?p=<view>` (investigations ledger: `switchView`
 * names). Static hosts cannot all match query strings, so a tiny inline script on `/`
 * sends them on (ARCHITECTURE §10.1).
 */
export const LEGACY_PAGES: Readonly<Record<string, string>> = {
  index: '/',
  menu: '/menu/',
  venue: '/venue/',
  contactus: '/find-us/',
  privacy: '/privacy/',
};

/** The inline script for `/`: replaces `?p=<view>` with the new route before first paint. */
export function legacyRedirectScript(): string {
  const map = JSON.stringify(LEGACY_PAGES);
  return `(function(){var p=new URLSearchParams(location.search).get('p');var m=${map};if(p&&Object.prototype.hasOwnProperty.call(m,p)&&m[p]!=='/'){location.replace(m[p]+location.hash)}else if(p!==null){history.replaceState(null,'','/'+location.hash)}})();`;
}

/** True when `pathname` is the link's page (trailing slashes ignored). */
export function isCurrent(href: string, pathname: string): boolean {
  const strip = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
  return strip(href) === strip(pathname);
}
