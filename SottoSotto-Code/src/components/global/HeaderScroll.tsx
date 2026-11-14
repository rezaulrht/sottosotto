'use client';

import { useEffect, useRef } from 'react';

/**
 * Sets `data-scrolled` on the site header once the top of the page has scrolled away,
 * which makes it solid and compact (PAGES.md, Global). One IntersectionObserver on a
 * sentinel; no scroll listener.
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
    return () => observer.disconnect();
  }, [headerId]);

  return <div ref={sentinel} className={className} aria-hidden="true" />;
}
