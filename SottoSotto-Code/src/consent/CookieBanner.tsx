'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { OPEN_EVENT, loadAnalytics, readConsent, stopAnalytics, writeConsent } from './consent';
import styles from './CookieBanner.module.css';

export interface CookieBannerCopy {
  heading: string;
  text: string;
  accept: string;
  reject: string;
  privacyLink: string;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Own consent banner (D40): "Accept analytics" and "Reject" with equal weight. Checks on
 * idle (ARCHITECTURE §9.1 step 4): a stored "yes" loads GA4, no choice shows the banner.
 * Not modal and does not take focus on first show; reopened from "Cookie settings", it
 * takes focus so keyboard users land on it.
 */
export function CookieBanner({
  copy,
  measurementId,
}: {
  copy: CookieBannerCopy;
  measurementId: string;
}) {
  const [open, setOpen] = useState(false);
  const focusOnOpen = useRef(false);
  const ref = useRef<HTMLElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const check = () => {
      const choice = readConsent(storage());
      if (choice?.analytics) loadAnalytics(measurementId);
      else if (!choice) setOpen(true);
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(check);

    const reopen = () => {
      returnTo.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusOnOpen.current = true;
      setOpen(true);
      // Already open: still move focus to it.
      ref.current?.focus();
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => {
      cancel(handle as number);
      window.removeEventListener(OPEN_EVENT, reopen);
    };
  }, [measurementId]);

  useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      ref.current?.focus();
    }
  }, [open]);

  const choose = (analytics: boolean) => {
    writeConsent(storage(), analytics);
    if (analytics) loadAnalytics(measurementId);
    else stopAnalytics(measurementId);
    setOpen(false);
    returnTo.current?.focus();
    returnTo.current = null;
  };

  if (!open) return null;
  return (
    <section
      ref={ref}
      className={styles.banner}
      aria-labelledby="cookie-banner-heading"
      tabIndex={-1}
      data-cookie-banner
    >
      <h2 id="cookie-banner-heading" className={`label ${styles.heading}`}>
        {copy.heading}
      </h2>
      <p className={styles.text}>
        {copy.text}{' '}
        <Link href="/privacy/" className={styles.link}>
          {copy.privacyLink}
        </Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => choose(true)}>
          {copy.accept}
        </button>
        <button type="button" className={styles.button} onClick={() => choose(false)}>
          {copy.reject}
        </button>
      </div>
    </section>
  );
}
