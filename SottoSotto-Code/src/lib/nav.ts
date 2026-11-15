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

/** True when `pathname` is the link's page (trailing slashes ignored). */
export function isCurrent(href: string, pathname: string): boolean {
  const strip = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
  return strip(href) === strip(pathname);
}
