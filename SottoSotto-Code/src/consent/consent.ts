/**
 * Consent and GA4 (D16, D40, ARCHITECTURE §9.2). Consent Mode v2 in basic mode:
 * gtag.js is not requested at all until the visitor accepts analytics. Ads signals are
 * always denied. Pure helpers take their storage/document so unit tests run in Node.
 */

export const CONSENT_KEY = 'consent.v1';
/** Bump to ask everyone again (e.g. when the privacy policy changes). */
export const CONSENT_VERSION = 1;
/** Fired by the footer's "Cookie settings" button to reopen the banner. */
export const OPEN_EVENT = 'consent:open';

export interface ConsentRecord {
  analytics: boolean;
  version: number;
  /** ISO date, YYYY-MM-DD. */
  date: string;
}

type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

/** The stored choice, or null when there is none, it is unreadable, or it is from an older version. */
export function readConsent(store: KeyValueStore | null): ConsentRecord | null {
  try {
    const raw = store?.getItem(CONSENT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ConsentRecord>;
    if (typeof value.analytics !== 'boolean' || value.version !== CONSENT_VERSION) return null;
    return { analytics: value.analytics, version: value.version, date: String(value.date ?? '') };
  } catch {
    return null;
  }
}

export function writeConsent(
  store: KeyValueStore | null,
  analytics: boolean,
  now = new Date(),
): ConsentRecord {
  const record = { analytics, version: CONSENT_VERSION, date: now.toISOString().slice(0, 10) };
  try {
    store?.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked (private mode): the choice holds for this page view only.
  }
  return record;
}

/** Every domain a `_ga` cookie may have been set on: the host and each parent (not the TLD). */
export function cookieDomains(hostname: string): string[] {
  const parts = hostname.split('.');
  const out: string[] = [];
  for (let i = 0; i < parts.length - 1; i++) out.push(parts.slice(i).join('.'));
  return out;
}

/** The names of the GA cookies in a `document.cookie` string. */
export function gaCookieNames(cookieString: string): string[] {
  return cookieString
    .split(';')
    .map((c) => c.split('=')[0]!.trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid');
}

/** Expires every GA cookie on every domain it may live on. */
export function deleteGaCookies(doc: Pick<Document, 'cookie'>, hostname: string): void {
  const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  for (const name of gaCookieNames(doc.cookie)) {
    doc.cookie = `${name}=; ${expired}`;
    for (const domain of cookieDomains(hostname))
      doc.cookie = `${name}=; ${expired}; domain=.${domain}`;
  }
}

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const SCRIPT_ID = 'ga4-gtag';

/** Loads GA4 once, after consent. Signals and ad personalisation stay off. */
export function loadAnalytics(measurementId: string): void {
  window[`ga-disable-${measurementId}` as keyof Window & string] = false as never;
  if (document.getElementById(SCRIPT_ID)) {
    window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js expects the Arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
}

/** Withdrawal: deny storage, stop GA4 sending, and remove its cookies. */
export function stopAnalytics(measurementId: string): void {
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  window[`ga-disable-${measurementId}` as keyof Window & string] = true as never;
  deleteGaCookies(document, location.hostname);
}
