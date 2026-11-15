'use client';

import type Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { MOTION_QUERIES } from './conditions';

/** Jump to the URL hash target, honouring its scroll-margin-top (Lenis ignores it). */
function scrollToHash(lenis: Lenis | null) {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  if (lenis) {
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    lenis.scrollTo(target, { immediate: true, force: true, offset: -margin });
  } else {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}

const refreshScrollTriggers = () =>
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.refresh());

/**
 * Smooth scrolling and route housekeeping (ARCHITECTURE §7.3, D33). Rendered once in the
 * root layout. Lenis runs on desktop only (fine pointer, no reduced motion) and is loaded
 * on demand, so phones and reduced-motion visitors never download it. Lenis is driven by
 * the GSAP ticker and keeps ScrollTrigger in sync. After a route change or a restore from
 * the back/forward cache, ScrollTriggers are measured again.
 */
export function MotionProvider() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const firstRouteRef = useRef(true);

  useEffect(() => {
    const desktop = window.matchMedia(MOTION_QUERIES.desktop);
    let cancelled = false;
    let detach: (() => void) | null = null;

    const start = async () => {
      if (!desktop.matches || lenisRef.current) return;
      const [{ default: LenisClass }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || !desktop.matches || lenisRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new LenisClass({ autoRaf: false, lerp: 0.1 });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
      detach = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
      };
    };
    const stop = () => {
      detach?.();
      detach = null;
    };
    const onChange = () => (desktop.matches ? void start() : stop());
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void refreshScrollTriggers();
    };

    void start();
    desktop.addEventListener('change', onChange);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      cancelled = true;
      desktop.removeEventListener('change', onChange);
      window.removeEventListener('pageshow', onPageShow);
      stop();
    };
  }, []);

  useEffect(() => {
    // Next.js scrolls to the top (or the hash) on navigation; keep Lenis' own position in step.
    const lenis = lenisRef.current;
    if (lenis && !window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
    // Re-measuring ScrollTriggers can restore the previous page's scroll position, which
    // undoes Next.js' jump to a hash (e.g. a featured dish → /menu/#tiramisu). Jump again.
    // Only after in-app navigation: on a fresh load the browser's own hash jump is right.
    const navigated = !firstRouteRef.current;
    firstRouteRef.current = false;
    const id = requestAnimationFrame(() => {
      void refreshScrollTriggers().then(() => {
        if (navigated) scrollToHash(lenisRef.current);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
