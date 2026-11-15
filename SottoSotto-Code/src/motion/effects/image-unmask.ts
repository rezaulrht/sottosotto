/**
 * Image unmask (DESIGN_SYSTEM §4): the frame opens from the bottom with clip-path while
 * the image settles from 1.15 to 1, dur-slow, once on entry. Reduced motion: nothing runs.
 */
import { gsap } from 'gsap';
import type { Effect } from '../registry';

function unmask(el: HTMLElement) {
  const img = el.querySelector('img');
  const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  tl.fromTo(
    el,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out' },
  );
  if (img) tl.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0);
}

const effect: Effect = { desktop: unmask, mobile: unmask };
export default effect;
