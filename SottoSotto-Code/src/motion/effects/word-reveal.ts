/**
 * Philosophy word reveal (DESIGN_SYSTEM §4, ARCHITECTURE §7.4): each word's opacity follows
 * scroll progress from 20% to 100%. Scrubbed opacity is cheap, so phones get it too.
 * Reduced motion: full text, no effect.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Effect } from '../registry';

gsap.registerPlugin(SplitText);

function reveal(el: HTMLElement) {
  const split = SplitText.create(el, {
    type: 'words',
    aria: 'auto',
    autoSplit: true,
    onSplit: (self) =>
      gsap.fromTo(
        self.words,
        { opacity: 0.2 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      ),
  });
  return () => split.revert();
}

const effect: Effect = { desktop: reveal, mobile: reveal };
export default effect;
