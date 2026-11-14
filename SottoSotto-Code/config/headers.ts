/**
 * Security headers and redirects: one source for every host (D44, ARCHITECTURE §10.2).
 * scripts/emit-headers.ts writes them as Cloudflare/Netlify `_headers` + `_redirects`,
 * a vercel.json block and an Nginx include after `next build`.
 */
import type { SiteEnv } from '../src/lib/env';

export type Header = readonly [name: string, value: string];

/**
 * Next.js static export inlines bootstrap scripts that change every build, so scripts need
 * 'unsafe-inline' (accepted cost of D30). Everything else stays strict.
 */
export const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://*.googletagmanager.com'],
  'connect-src': [
    "'self'",
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'https://*.google-analytics.com',
    'https://*.googletagmanager.com',
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'font-src': ["'self'"],
  'frame-src': ['https://app.hospres.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
};

export function contentSecurityPolicy(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([name, values]) => [name, ...values].join(' '))
    .join('; ');
}

/** Headers for every path. Staging: CSP report-only and noindex (ARCHITECTURE §10.2, §11.1). */
export function securityHeaders(env: SiteEnv): Header[] {
  const enforce = env === 'production';
  const headers: Header[] = [
    [
      enforce ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
      contentSecurityPolicy(),
    ],
    // Start without includeSubDomains; add it after checking every subdomain serves HTTPS (§13 step 7).
    ['Strict-Transport-Security', 'max-age=31536000'],
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    // `payment` to be tested with the Hospres iframe in M2/M7 (deposits may be taken there).
    ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
    ['X-Frame-Options', 'DENY'],
  ];
  if (!enforce) headers.push(['X-Robots-Tag', 'noindex, nofollow']);
  return headers;
}

/** Long-lived caching for content-hashed build assets only. */
export const CACHE_RULES: ReadonlyArray<{ path: string; headers: Header[] }> = [
  { path: '/_next/static/*', headers: [['Cache-Control', 'public, max-age=31536000, immutable']] },
];

/** Old PDF menu links (ARCHITECTURE §10.1). `?p=` links are handled by a script on `/` (M3). */
export const REDIRECTS: ReadonlyArray<{ from: string; to: string; status: 301 }> = [
  { from: '/pdf/menu.pdf', to: '/menu/#menu', status: 301 },
  { from: '/pdf/Dessert.pdf', to: '/menu/#dessert', status: 301 },
  { from: '/pdf/winelist.pdf', to: '/menu/#wine', status: 301 },
];
