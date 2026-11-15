/**
 * Stair descent (DESIGN_SYSTEM §4, ARCHITECTURE §7.4). Markup: a section with
 * `[data-stage]` holding `[data-step]` frames, each already darker and warmer than the last
 * (CSS `--dark`).
 *
 * desktop  the stage pins for about one viewport per step; each step slides up over the
 *          previous one, scrubbed to the scroll
 * mobile   no pinning: the frames stay stacked and fade up as they arrive
 * reduced  stacked, no animation (the default layout, nothing runs)
 */
import { gsap } from 'gsap';
import type { Effect } from '../registry';

const effect: Effect = {
  desktop(el) {
    const stage = el.querySelector<HTMLElement>('[data-stage]');
    const steps = gsap.utils.toArray<HTMLElement>('[data-step]', el);
    if (!stage || steps.length < 2) return;
    el.setAttribute('data-pinned', '');
    gsap.set(steps.slice(1), { yPercent: 100 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => `+=${window.innerHeight * (steps.length - 1)}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    steps.slice(1).forEach((step, i) => tl.to(step, { yPercent: 0, ease: 'none', duration: 1 }, i));
    return () => el.removeAttribute('data-pinned');
  },

  mobile(el) {
    for (const step of gsap.utils.toArray<HTMLElement>('[data-step]', el)) {
      gsap.from(step, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: { trigger: step, start: 'top 85%', once: true },
      });
    }
  },
};

export default effect;
