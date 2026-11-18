/**
 * Press drop (design 2026-11-18): the pages fall onto the table one after another, from
 * slightly above, blurred and turned, settling at their resting angle with a small
 * overshoot, like the client's newspaper film but with no flashes. Runs once.
 *
 * desktop / mobile  drop in once 15% of the table is on screen, however it got there
 * reduced           nothing runs: pages are already at rest (CSS)
 */
import { gsap } from 'gsap';
import type { Effect } from '../registry';

function drop(el: HTMLElement) {
  const pages = gsap.utils.toArray<HTMLElement>('[data-press-page]', el);
  if (!pages.length) return;
  const tween = gsap.from(pages, {
    y: -60,
    rotation: '-=9',
    opacity: 0,
    filter: 'blur(6px)',
    duration: 1.1,
    ease: 'back.out(1.4)',
    stagger: 0.12,
    // Hand back to CSS once landed, so the hover lift and the place variables still work.
    clearProps: 'transform,opacity,filter',
    paused: true,
  });
  // An IntersectionObserver, not a ScrollTrigger: it also fires when the section is reached
  // by a jump (a link, a restored scroll position), so the pages can never stay hidden.
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        tween.play();
        io.disconnect();
      }
    },
    { threshold: 0.15 },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    tween.kill();
    gsap.set(pages, { clearProps: 'transform,opacity,filter' });
  };
}

const effect: Effect = { desktop: drop, mobile: drop };

export default effect;
