/**
 * Rooms gallery (ARCHITECTURE §7.4). Markup: a section holding a `[data-track]` row of
 * photos that is a native horizontal scroller with scroll-snap (the default: phones,
 * reduced motion, no JS).
 *
 * desktop  the section pins and the row slides sideways as you scroll down, then releases
 * mobile   nothing runs: native swipe with scroll-snap
 * reduced  nothing runs: native horizontal scroll
 */
import { gsap } from 'gsap';
import type { Effect } from '../registry';

const effect: Effect = {
  desktop(el) {
    const track = el.querySelector<HTMLElement>('[data-track]');
    if (!track) return;
    el.setAttribute('data-pinned', '');
    const distance = () => Math.max(0, track.scrollWidth - el.clientWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    return () => el.removeAttribute('data-pinned');
  },
};

export default effect;
