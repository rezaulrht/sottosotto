'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Runs the `data-effect`s inside this page's content (loaded when the browser is idle) and
 * reverts them when the page unmounts (ARCHITECTURE §7.3: the root layout stays mounted between routes).
 */
export function MotionScope({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let revert: (() => void) | null = null;
    let cancelled = false;
    // Motion code (GSAP, ScrollTrigger, the effects) is not first-load JS: it is fetched when
    // the browser is idle after hydration. Everything is visible until then.
    const start = () =>
      import('./registry')
        .then(({ runEffects }) => (cancelled ? null : runEffects(root)))
        .then((fn) => {
          if (!fn) return;
          if (cancelled) fn();
          else revert = fn;
        })
        .catch((error: unknown) => console.warn('Motion failed to start', error));
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 200);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      revert?.();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
