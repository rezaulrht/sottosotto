'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './CandleLight.module.css';

/*
 * Menu candle (ARCHITECTURE §7.5, D34). DOM + CSS only: the flame and glow move with
 * transform in a rAF loop that stops when they settle; dishes switch `data-lit`, and CSS
 * fades opacity. Three inputs, one state:
 *   pointer  — desktop with a fine pointer: a candle follows the mouse and lights the dish
 *              under it, with a spark once per enter; over a dish the flame burns brighter
 *   centre   — touch / small screens: the dish crossing the middle of the screen is lit
 *   held     — keyboard focus or an open allergen toggle (data-focus / data-open), every mode
 * Reduced motion: nothing runs and every dish stays lit. Without JS: every dish is lit.
 */

const ITEM = '[data-candle-item]';
const INTERACTIVE = 'a, button, summary, input, select, textarea, [role="tab"]';
const FINE = '(min-width: 1024px) and (pointer: fine)';
const REDUCE = '(prefers-reduced-motion: reduce)';
const EASE = 0.3;
const SPARKS = 6;

type Mode = 'pointer' | 'centre';

function pointerMode(root: HTMLElement, flame: HTMLElement, spark: HTMLElement): () => void {
  let lit: HTMLElement | null = null;
  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  let inside = false;
  let scrollQueued = false;
  const dots = Array.from(spark.children) as HTMLElement[];

  const sparkle = () => {
    dots.forEach((dot, i) => {
      const angle = (i / dots.length) * Math.PI * 2 - Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      const dist = 14 + Math.random() * 12;
      dot.animate(
        [
          { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
          {
            transform: `translate3d(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px, 0) scale(0.3)`,
            opacity: 0,
          },
        ],
        { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
    });
  };

  const light = (el: HTMLElement | null) => {
    if (el === lit) return;
    lit?.removeAttribute('data-lit');
    lit = el;
    flame.toggleAttribute('data-over', !!el); // the candle burns brighter over a dish
    if (el) {
      el.setAttribute('data-lit', '');
      sparkle();
    }
  };

  const tick = () => {
    x += (tx - x) * EASE;
    y += (ty - y) * EASE;
    flame.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(tick) : 0;
  };

  const update = (target: Element | null) => {
    const overInteractive = !!target?.closest(INTERACTIVE);
    flame.toggleAttribute('data-hidden', !inside || overInteractive);
    light(inside ? (target?.closest<HTMLElement>(ITEM) ?? null) : null);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    tx = e.clientX;
    ty = e.clientY;
    if (!inside) {
      inside = true;
      x = tx;
      y = ty;
    }
    update(e.target as Element);
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const onLeave = () => {
    inside = false;
    update(null);
  };

  // The flame is fixed; when the page scrolls under a still pointer, relight what is now under it.
  const onScroll = () => {
    if (!inside || scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      update(document.elementFromPoint(tx, ty));
    });
  };

  root.addEventListener('pointermove', onMove, { passive: true });
  root.addEventListener('pointerleave', onLeave);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    cancelAnimationFrame(raf);
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('scroll', onScroll);
    flame.setAttribute('data-hidden', '');
    lit?.removeAttribute('data-lit');
  };
}

function centreMode(root: HTMLElement): () => void {
  const items = Array.from(root.querySelectorAll<HTMLElement>(ITEM));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        (entry.target as HTMLElement).toggleAttribute('data-lit', entry.isIntersecting);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  items.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    items.forEach((el) => el.removeAttribute('data-lit'));
  };
}

/**
 * Keyboard focus and an open allergen toggle keep a dish lit, in every mode. Set as
 * attributes (data-focus, data-open) rather than :focus-within / :has() in CSS, which
 * made every lighting change re-match the whole menu (long tasks in the M2 trace).
 */
function heldLights(root: HTMLElement): () => void {
  const itemOf = (t: EventTarget | null) =>
    t instanceof Element ? t.closest<HTMLElement>(ITEM) : null;
  const syncOpen = (item: HTMLElement) =>
    item.toggleAttribute('data-open', !!item.querySelector('details[open]'));
  const onFocusIn = (e: FocusEvent) => itemOf(e.target)?.setAttribute('data-focus', '');
  const onFocusOut = (e: FocusEvent) => itemOf(e.target)?.removeAttribute('data-focus');
  const onToggle = (e: Event) => {
    const item = itemOf(e.target);
    if (item) syncOpen(item);
  };
  root.querySelectorAll<HTMLElement>(ITEM).forEach(syncOpen);
  const active = itemOf(document.activeElement);
  active?.setAttribute('data-focus', '');
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  root.addEventListener('toggle', onToggle, true); // `toggle` does not bubble
  return () => {
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    root.removeEventListener('toggle', onToggle, true);
    root.querySelectorAll<HTMLElement>('[data-focus], [data-open]').forEach((el) => {
      el.removeAttribute('data-focus');
      el.removeAttribute('data-open');
    });
  };
}

export function CandleLight({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const flame = flameRef.current;
    const spark = sparkRef.current;
    if (!root || !flame || !spark) return;
    const reduce = window.matchMedia(REDUCE);
    const fine = window.matchMedia(FINE);
    let stop: (() => void) | null = null;

    const setup = () => {
      stop?.();
      stop = null;
      root.removeAttribute('data-candle-ready');
      root.removeAttribute('data-candle-mode');
      if (reduce.matches) return;
      const mode: Mode = fine.matches ? 'pointer' : 'centre';
      root.setAttribute('data-candle-ready', '');
      root.setAttribute('data-candle-mode', mode);
      const stopMode = mode === 'pointer' ? pointerMode(root, flame, spark) : centreMode(root);
      const stopHeld = heldLights(root);
      stop = () => {
        stopMode();
        stopHeld();
      };
    };

    setup();
    reduce.addEventListener('change', setup);
    fine.addEventListener('change', setup);
    return () => {
      reduce.removeEventListener('change', setup);
      fine.removeEventListener('change', setup);
      stop?.();
      root.removeAttribute('data-candle-ready');
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      {children}
      <div ref={flameRef} className={styles.cursor} aria-hidden="true" data-hidden="">
        <div className={styles.glow} />
        <div className={styles.glowHot} />
        <svg className={styles.candle} viewBox="0 0 16 46">
          <defs>
            <linearGradient id="candle-wax" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#b9b3a8" />
              <stop offset="0.35" stopColor="#ede8df" />
              <stop offset="0.7" stopColor="#d9d2c4" />
              <stop offset="1" stopColor="#8c877e" />
            </linearGradient>
            <linearGradient id="candle-warm" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#f2c985" stopOpacity="0.55" />
              <stop offset="0.45" stopColor="#f2c985" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Wax pillar with a soft top, warmed by the flame, and one drip. */}
          <path d="M2 8.5Q2 6 8 6Q14 6 14 8.5V44Q14 46 8 46Q2 46 2 44Z" fill="url(#candle-wax)" />
          <path d="M2 8.5Q2 6 8 6Q14 6 14 8.5V44Q14 46 8 46Q2 46 2 44Z" fill="url(#candle-warm)" />
          <path
            d="M11.2 7.2Q12.4 7.6 12.3 10.5Q12.2 14 11.3 14.2Q10.4 14 10.5 11Z"
            fill="#ede8df"
          />
          <ellipse cx="8" cy="8.2" rx="5.2" ry="1.6" fill="#f5efe4" />
          {/* Wick */}
          <path d="M8 8.2V3.5" stroke="#262422" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
        <div className={styles.flameWrap}>
          <svg className={styles.flame} viewBox="0 0 20 32">
            <defs>
              <radialGradient id="candle-flame" cx="50%" cy="68%" r="60%">
                <stop offset="0" stopColor="#fff6e0" />
                <stop offset="0.35" stopColor="#f2c985" />
                <stop offset="0.75" stopColor="#e3a54b" />
                <stop offset="1" stopColor="#e3a54b" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path
              d="M10 1C10 1 3 11 3 19.5C3 25.3 6.1 30 10 30C13.9 30 17 25.3 17 19.5C17 11 10 1 10 1Z"
              fill="url(#candle-flame)"
            />
            <ellipse cx="10" cy="24" rx="2.2" ry="3.4" fill="#5a7bb5" opacity="0.35" />
          </svg>
        </div>
        <div ref={sparkRef} className={styles.spark}>
          {Array.from({ length: SPARKS }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
