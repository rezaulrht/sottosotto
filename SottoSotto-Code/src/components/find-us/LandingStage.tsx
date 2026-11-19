'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Find Us opening (D75): one stage that the visitor scrolls through. This writes how far
 * they are as `--p` (0..1) and marks the stage `data-scrolly`; Landing.module.css turns that
 * into the drone clip dissolving into the map, then the address card. Without JS, and under
 * reduced motion, the attribute is never set: the stage is one screen showing the map, the
 * address and Get directions straight away.
 */
export function LandingStage({
  className,
  labelledBy,
  children,
}: {
  className?: string;
  labelledBy: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1;
      el.style.setProperty('--p', p.toFixed(4));
      el.toggleAttribute('data-landed', p >= 0.8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const apply = () => {
      const on = !reduce.matches;
      el.toggleAttribute('data-scrolly', on);
      if (on) update();
      else {
        el.style.removeProperty('--p');
        el.removeAttribute('data-landed');
      }
    };
    apply();
    reduce.addEventListener('change', apply);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      reduce.removeEventListener('change', apply);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section ref={ref} className={className} aria-labelledby={labelledBy} data-find-stage="">
      {children}
    </section>
  );
}
