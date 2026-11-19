/**
 * Arrivals (D79): how a page and its groups come in. Plain DOM and the Web Animations API,
 * no library, so it can live in the layout's MotionProvider without weighing on first load.
 *
 * - `enterPage`: after an in-app navigation the new page settles in (rise, fade, a breath of
 *   blur). Never on a fresh load: the first paint is the page, as it is.
 * - `watchRises`: groups marked `data-rise` rise in, child by child, the first time they
 *   scroll into view. Groups already on screen are left alone. Without JS, or with reduced
 *   motion, nothing is ever hidden.
 */

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function enterPage(main: HTMLElement): void {
  if (reduced()) {
    main.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    return;
  }
  main.animate(
    [
      { opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'none', filter: 'none' },
    ],
    { duration: 450, easing: EASE_OUT },
  );
}

/** Long enough for the last child's delay plus its transition (see globals.css). */
const RISE_SETTLE_MS = 1600;

export function watchRises(): () => void {
  if (reduced() || !('IntersectionObserver' in window)) return () => {};
  const timers: number[] = [];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        el.removeAttribute('data-rise-wait');
        el.setAttribute('data-rising', '');
        timers.push(window.setTimeout(() => el.removeAttribute('data-rising'), RISE_SETTLE_MS));
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
  );
  for (const el of document.querySelectorAll<HTMLElement>('[data-rise]')) {
    // Already in view (or above it): show as is, no entrance.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) continue;
    // Several children: they come up in order. A single child keeps the group's own --rise-i
    // (set in the markup, e.g. a card's place in its row) by inheriting it.
    if (el.children.length > 1) {
      Array.from(el.children).forEach((child, i) =>
        (child as HTMLElement).style.setProperty('--rise-i', String(Math.min(i, 8))),
      );
    }
    el.setAttribute('data-rise-wait', '');
    observer.observe(el);
  }
  return () => {
    observer.disconnect();
    timers.forEach((t) => window.clearTimeout(t));
    for (const el of document.querySelectorAll('[data-rise-wait]')) {
      el.removeAttribute('data-rise-wait');
    }
  };
}
