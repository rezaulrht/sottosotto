'use client';

import { useEffect, useRef } from 'react';

/**
 * Sets `data-scrolled` on the site header once the top of the page has scrolled away,
 * which makes it solid and compact (PAGES.md, Global), with one IntersectionObserver on a
 * sentinel. And (D79) `data-tucked` while the visitor reads down the page, so the photos get
 * the whole screen; the header comes back on the first scroll up. It never tucks near the
 * top, while its menu is open, while it holds keyboard focus, or with reduced motion.
 */
export function HeaderScroll({ headerId, className }: { headerId: string; className?: string }) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = document.getElementById(headerId);
    const el = sentinel.current;
    if (!header || !el) return;
    const observer = new IntersectionObserver(([entry]) => {
      header.toggleAttribute('data-scrolled', !entry?.isIntersecting);
    });
    observer.observe(el);

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      lastY = y;
      const keep =
        still.matches ||
        y < window.innerHeight * 0.5 ||
        header.contains(document.activeElement) ||
        header.querySelector('dialog[open]') !== null;
      header.toggleAttribute('data-tucked', !keep && delta > 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onFocus = () => header.removeAttribute('data-tucked');
    window.addEventListener('scroll', onScroll, { passive: true });
    header.addEventListener('focusin', onFocus);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      header.removeEventListener('focusin', onFocus);
      cancelAnimationFrame(frame);
    };
  }, [headerId]);

  return <div ref={sentinel} className={className} aria-hidden="true" />;
}
