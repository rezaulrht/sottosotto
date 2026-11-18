/**
 * Motion registry (ARCHITECTURE §7.1–7.3). Markup declares effects with `data-effect`
 * (space-separated names). `runEffects(root)` loads only the effect modules the page uses,
 * then runs each element's function for the current mode inside one `gsap.matchMedia()`.
 * When a query flips (resize, OS setting), GSAP reverts the old mode and runs the new one.
 * The returned function reverts everything (ScrollTriggers, inline styles, splits).
 *
 * Content is never hidden in the HTML: effects set their own start states, so without JS,
 * before JS, or if an effect fails, everything is visible.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION_QUERIES, type MotionMode } from './conditions';

gsap.registerPlugin(ScrollTrigger);
// Avoid jumps when the iOS address bar shows or hides (§7.4).
ScrollTrigger.config({ ignoreMobileResize: true });

export type EffectFn = (el: HTMLElement) => void | (() => void);
export type Effect = Partial<Record<MotionMode, EffectFn>>;

const LOADERS: Record<string, () => Promise<{ default: Effect }>> = {
  'reveal-lines': () => import('./effects/reveal-lines'),
  'word-reveal': () => import('./effects/word-reveal'),
  'stair-descent': () => import('./effects/stair-descent'),
  'image-unmask': () => import('./effects/image-unmask'),
  'slow-zoom': () => import('./effects/slow-zoom'),
  'rooms-gallery': () => import('./effects/rooms-gallery'),
  'press-drop': () => import('./effects/press-drop'),
};

const namesOf = (el: HTMLElement) => (el.dataset.effect ?? '').split(/\s+/).filter(Boolean);

export async function runEffects(root: HTMLElement): Promise<() => void> {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-effect]'));
  const names = [...new Set(elements.flatMap(namesOf))].filter((n) => n in LOADERS);
  if (!names.length) return () => {};

  const modules = Object.fromEntries(
    await Promise.all(names.map(async (n) => [n, (await LOADERS[n]!()).default] as const)),
  );

  const mm = gsap.matchMedia(root);
  mm.add(MOTION_QUERIES, (ctx) => {
    const c = ctx.conditions ?? {};
    const mode: MotionMode = c.reduced ? 'reduced' : c.desktop ? 'desktop' : 'mobile';
    root.dataset.motionMode = mode;
    const cleanups: Array<() => void> = [];
    for (const el of elements) {
      for (const name of namesOf(el)) {
        try {
          const cleanup = modules[name]?.[mode]?.(el);
          if (cleanup) cleanups.push(cleanup);
        } catch (error) {
          // One broken effect must not hide content or stop the others.
          console.warn(`Motion effect "${name}" failed`, error);
        }
      }
    }
    // Pinned sections change the page height: measure again once fonts and layout settle.
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cleanups.forEach((fn) => fn());
  });
  return () => mm.revert();
}
