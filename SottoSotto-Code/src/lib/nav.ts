/** Main navigation (D1). Privacy is footer-only; booking is the Book a Table button. */
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu/', label: 'Menu' },
  { href: '/venue/', label: 'Venue' },
  { href: '/find-us/', label: 'Find Us' },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

/** Every route, for the sitemap and smoke tests. */
export const ROUTES = ['/', '/menu/', '/venue/', '/find-us/', '/privacy/'] as const;

/** True when `pathname` is the link's page (trailing slashes ignored). */
export function isCurrent(href: string, pathname: string): boolean {
  const strip = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
  return strip(href) === strip(pathname);
}
