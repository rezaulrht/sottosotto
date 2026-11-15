/**
 * Line reveal (DESIGN_SYSTEM §4): each line slides up 100% inside a clipped wrapper,
 * dur-base, ease-out, 70 ms stagger, once at about 20% into the viewport. SplitText keeps
 * the real sentence for screen readers (aria: auto) and re-splits on resize and when the
 * web fonts arrive. Reduced motion: nothing runs; the text is simply there.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Effect } from '../registry';

gsap.registerPlugin(SplitText);

function reveal(el: HTMLElement) {
  const split = SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    aria: 'auto',
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 100,
        duration: 0.6,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      }),
  });
  return () => split.revert();
}

const effect: Effect = { desktop: reveal, mobile: reveal };
export default effect;
