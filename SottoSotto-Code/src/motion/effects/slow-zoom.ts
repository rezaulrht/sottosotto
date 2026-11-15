/**
 * Slow zoom on scroll (PAGES.md Venue §1): the photo eases from 1 to 1.12 as its section
 * scrolls out of view. Transform only. Reduced motion: off (DESIGN_SYSTEM §4).
 */
import { gsap } from 'gsap';
import type { Effect } from '../registry';

function zoom(el: HTMLElement) {
  const target = el.querySelector<HTMLElement>('img, [role="img"]') ?? el;
  gsap.fromTo(
    target,
    { scale: 1 },
    {
      scale: 1.12,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
    },
  );
}

const effect: Effect = { desktop: zoom, mobile: zoom };
export default effect;
