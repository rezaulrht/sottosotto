/**
 * Philosophy word reveal (DESIGN_SYSTEM §4, ARCHITECTURE §7.4): each word's opacity follows
 * scroll progress. Scrubbed opacity is cheap, so phones get it too. Reduced motion: full
 * text, no effect.
 *
 * Accessibility (D61):
 * - Screen readers get the sentence once, from a visually hidden copy; the split copy is
 *   aria-hidden (an aria-label on a <p> is not allowed).
 * - Words start at 40% opacity, not 20%: still at least 3:1 against the dark base, so text
 *   not yet "revealed" stays readable (WCAG 1.4.3, large text).
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Effect } from '../registry';

gsap.registerPlugin(SplitText);

const START_OPACITY = 0.4;

function reveal(el: HTMLElement) {
  const text = el.textContent ?? '';
  const spoken = document.createElement('span');
  spoken.className = 'sr-only';
  spoken.textContent = text;
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  visual.textContent = text;
  el.replaceChildren(spoken, visual);

  const split = SplitText.create(visual, {
    type: 'words',
    aria: 'none',
    autoSplit: true,
    onSplit: (self) =>
      gsap.fromTo(
        self.words,
        { opacity: START_OPACITY },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      ),
  });
  return () => {
    split.revert();
    el.textContent = text;
  };
}

const effect: Effect = { desktop: reveal, mobile: reveal };
export default effect;
