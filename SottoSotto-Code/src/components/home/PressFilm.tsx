'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './PressFilm.module.css';

export interface FilmItem {
  id: string;
  publication: string;
  date: string | null;
  headline: string;
  /** The Sotto Sotto part of the page: [x, y, width, height] as fractions of the page. */
  box: [number, number, number, number];
  readable: boolean;
  avif: string;
  webp: string;
  /** Largest WebP: the no-JS link and the reader. */
  src: string;
  /** Smallest WebP: the flying pages. */
  small: string;
  width: number;
  height: number;
}

export interface FilmCopy {
  heading: string;
  intro: { eyebrow: string; sub: string };
  outro: { eyebrow: string };
  tagline: string;
  /** Heads the paper reel. */
  eyebrow: string;
  name: string;
  city: string;
  address: string;
}

/**
 * The client's newspaper film, shot for shot (D70): an opening title card, then for each
 * page a shot (it flies in, lands with an overshoot and a warm flash, zooms to the Sotto
 * Sotto part of the page, which an amber square picks out while the rest dims, under a big
 * headline, then leaves), then a closing card, and round again. Three shots open on the paper
 * reel (ours, in place of the film's printing press). Timings, curves and shots are the film's.
 *
 * Ours on top of the film: the square draws itself round the Sotto Sotto part like a pen
 * circling a name; the headline is set in the site's own Spectral, with the paper as a
 * byline under it; a warm candle bloom instead of a camera flash; nine marks that show
 * the paper, its progress, and jump to any other.
 *
 * It plays only while on screen, and pauses with its button (WCAG 2.2.2). Under reduced
 * motion, and before JS, it is still: one page at a time, already zoomed and ringed, moved
 * with Previous / Next.
 */

interface Shot {
  kind: string;
  start: string;
  exit: string;
  rest: string;
  over: string;
  press?: boolean;
}

/** The film's shots, in its order (kind is the label it shows top right). */
const SHOTS: readonly Shot[] = [
  {
    kind: 'Skyfall',
    start: 'translate(-170%,-210%) rotate(-145deg) rotateY(70deg) scale(.15)',
    exit: 'translate(100%,-180%) rotate(90deg) scale(.2)',
    rest: '-7deg',
    over: '12deg',
  },
  {
    kind: 'Press roll',
    start: 'translate(70%,130%) rotate(160deg) rotateX(75deg) scale(.12)',
    exit: 'translate(-200%,20%) rotate(-90deg) scale(.2)',
    rest: '4deg',
    over: '-10deg',
    press: true,
  },
  {
    kind: 'Spin into frame',
    start: 'translate(120%,-150%) rotate(540deg) rotateY(65deg) scale(.1)',
    exit: 'translate(-160%,-120%) rotate(-130deg) scale(.1)',
    rest: '-5deg',
    over: '14deg',
  },
  {
    kind: 'Front page!',
    start: 'translate(-50%,-50%) rotate(0deg) rotateX(90deg) scale(.08)',
    exit: 'translate(80%,100%) rotate(180deg) scale(.3)',
    rest: '2deg',
    over: '-7deg',
  },
  {
    kind: 'Stop the press',
    start: 'translate(-200%,50%) rotate(-270deg) rotateY(-75deg) scale(.12)',
    exit: 'translate(110%,-160%) rotate(120deg) scale(.15)',
    rest: '-6deg',
    over: '8deg',
    press: true,
  },
  {
    kind: 'Newsreel',
    start: 'translate(150%,100%) rotate(230deg) rotateX(65deg) scale(.1)',
    exit: 'translate(-160%,80%) rotate(-230deg) scale(.12)',
    rest: '7deg',
    over: '-11deg',
  },
  {
    kind: 'The food of love',
    start: 'translate(-50%,-230%) rotate(-80deg) rotateY(70deg) scale(.2)',
    exit: 'translate(120%,70%) rotate(140deg) scale(.1)',
    rest: '-4deg',
    over: '8deg',
  },
  {
    kind: 'Breaking news',
    start: 'translate(-160%,-100%) rotate(-490deg) rotateX(70deg) scale(.15)',
    exit: 'translate(130%,-120%) rotate(210deg) scale(.1)',
    rest: '6deg',
    over: '-10deg',
  },
  {
    kind: 'The press room',
    start: 'translate(70%,-190%) rotate(190deg) rotateY(-85deg) scale(.15)',
    exit: 'translate(-160%,100%) rotate(-170deg) scale(.1)',
    rest: '-6deg',
    over: '9deg',
    press: true,
  },
  {
    kind: 'The first edition',
    start: 'translate(-200%,100%) rotate(380deg) rotateY(90deg) scale(.1)',
    exit: 'translate(130%,-130%) rotate(90deg) scale(.1)',
    rest: '4deg',
    over: '-9deg',
  },
];
const shotFor = (i: number) => SHOTS[i % SHOTS.length]!;

/** The flying pages: four per shot, each with its own path (the film's values). */
const FLIGHTS = [
  ['-900px', '-600px', '800px', '600px', '-120deg', '160deg'],
  ['950px', '-700px', '-900px', '700px', '120deg', '-170deg'],
  ['-700px', '700px', '1000px', '-700px', '180deg', '-110deg'],
  ['1000px', '600px', '-950px', '-800px', '-160deg', '200deg'],
] as const;

// The film's clock, in ms.
const INTRO = 2600;
const OUTRO = 4100;
const SHOT = 8200;
const REEL = 1450;
const ZOOM = 2800;
const ZOOM_AFTER_REEL = 3550;
const RING_DELAY = 850;
const LEAVE = 6800;
const FLASH_AT = 1300;
const FLASH = 500;
const FLUTTER = 2600;

type Phase = 'intro' | 'page' | 'outro';
interface Frame {
  phase: Phase;
  index: number;
  /** 0 landing, 1 zoomed in, 2 leaving. */
  step: 0 | 1 | 2;
  landed: boolean;
  reel: boolean;
  flash: boolean;
  flutter: boolean;
  ring: boolean;
}

const still = (index: number): Frame => ({
  phase: 'page',
  index,
  step: 1,
  landed: true,
  reel: false,
  flash: false,
  flutter: false,
  ring: true,
});

/** Where the film is at `t` ms into a phase. */
function frameAt(phase: Phase, index: number, t: number): Frame {
  if (phase !== 'page')
    return {
      phase,
      index,
      step: 0,
      landed: false,
      reel: false,
      flash: false,
      flutter: false,
      ring: false,
    };
  const press = !!shotFor(index).press;
  const zoomAt = press ? ZOOM_AFTER_REEL : ZOOM;
  const flashAt = press ? REEL : FLASH_AT;
  const step = t < zoomAt ? 0 : t < LEAVE ? 1 : 2;
  return {
    phase,
    index,
    step,
    landed: t >= (press ? REEL : 0),
    reel: press && t < REEL,
    flash: t >= flashAt && t < flashAt + FLASH,
    flutter: t < FLUTTER,
    ring: step === 1 && t >= zoomAt + RING_DELAY,
  };
}

const same = (a: Frame, b: Frame) =>
  (Object.keys(a) as (keyof Frame)[]).every((k) => a[k] === b[k]);

/** How far the zoom goes: enough to make the boxed part big, never so far it leaves the frame. */
function zoomScale([, , w, h]: FilmItem['box']) {
  return Math.min(1.9, Math.max(1.15, Math.min(0.62 / w, 0.42 / h)));
}

export function PressFilm({ items, copy }: { items: FilmItem[]; copy: FilmCopy }) {
  const last = items.length - 1;
  // Still until JS knows motion is welcome (and the no-JS fallback).
  const [moving, setMoving] = useState(false);
  const [frame, setFrame] = useState<Frame>(() => still(0));
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const clock = useRef({ phase: 'page' as Phase, index: 0, t: 0 });
  const running = useRef({ paused: false, inView: false, pageVisible: true });

  const show = useCallback((next: Frame) => {
    setFrame((prev) => (same(prev, next) ? prev : next));
  }, []);

  const go = useCallback(
    (phase: Phase, index: number) => {
      clock.current = { phase, index, t: 0 };
      show(frameAt(phase, index, 0));
    },
    [show],
  );

  // Motion allowed: start from the opening card; under reduced motion stay still.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      if (query.matches) {
        setMoving(false);
        const i = clock.current.phase === 'page' ? clock.current.index : 0;
        clock.current = { phase: 'page', index: i, t: 0 };
        show(still(i));
      } else {
        setMoving(true);
        go('intro', 0);
      }
    };
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, [go, show]);

  // Runs only while at least 40% on screen and the tab is visible.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        running.current.inView = !!entry && entry.intersectionRatio >= 0.4;
      },
      { threshold: [0, 0.4, 1] },
    );
    io.observe(el);
    const onVisibility = () => {
      running.current.pageVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // The film's clock.
  useEffect(() => {
    if (!moving) return;
    let raf = 0;
    let before = performance.now();
    const tick = (now: number) => {
      // Real time, like the CSS animations it drives (a slow frame must not slow the film);
      // capped only so a stalled tab cannot skip a whole shot.
      const dt = Math.min(now - before, 1000);
      before = now;
      const r = running.current;
      const c = clock.current;
      const holding = r.paused || !r.inView || !r.pageVisible;
      rootRef.current?.toggleAttribute('data-held', holding);
      if (!holding) {
        c.t += dt;
        if (c.phase === 'intro' && c.t > INTRO) go('page', 0);
        else if (c.phase === 'outro' && c.t > OUTRO) go('intro', 0);
        else if (c.phase === 'page' && c.t > SHOT) {
          if (c.index >= last) go('outro', c.index);
          else go('page', c.index + 1);
        } else show(frameAt(c.phase, c.index, c.t));
      }
      const now_ = clock.current;
      const length = now_.phase === 'intro' ? INTRO : now_.phase === 'outro' ? OUTRO : SHOT;
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${now_.phase === 'page' ? Math.min(1, now_.t / length) : 0})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [moving, last, go, show]);

  const pause = (value: boolean) => {
    running.current.paused = value;
    setPaused(value);
  };
  const stillAt = (i: number) => {
    clock.current = { phase: 'page', index: i, t: 0 };
    show(still(i));
  };
  const prev = () => {
    if (!moving) return stillAt((frame.index - 1 + items.length) % items.length);
    if (frame.phase === 'outro') go('page', last);
    else go('page', Math.max(0, frame.phase === 'page' ? frame.index - 1 : 0));
    pause(false);
  };
  const next = () => {
    if (!moving) return stillAt((frame.index + 1) % items.length);
    if (frame.phase === 'intro') go('page', 0);
    else if (frame.phase === 'outro' || frame.index >= last) go('outro', last);
    else go('page', frame.index + 1);
    pause(false);
  };

  const jump = (i: number) => {
    if (!moving) return stillAt(i);
    go('page', i);
    pause(false);
  };

  const item = items[frame.index]!;
  const source = [item.publication, item.date].filter(Boolean).join(' · ');
  const onPage = frame.phase === 'page';
  const card =
    frame.phase === 'intro'
      ? { eyebrow: copy.intro.eyebrow, title: copy.heading, sub: copy.intro.sub }
      : frame.phase === 'outro'
        ? { eyebrow: copy.outro.eyebrow, title: copy.name, sub: copy.address }
        : null;

  return (
    <div
      ref={rootRef}
      className={styles.film}
      data-moving={moving ? '' : undefined}
      data-paused={paused ? '' : undefined}
      data-press-film=""
      data-phase={frame.phase}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest('dialog')) return;
        if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
        else return;
        e.preventDefault();
      }}
    >
      <h2 id="home-press" className="sr-only">
        {copy.heading}
      </h2>
      <div className={`${styles.bar} ${styles.top}`} aria-hidden="true" />
      <div className={`${styles.bar} ${styles.bottom}`} aria-hidden="true" />

      <div className={`${styles.scene} ${onPage ? styles.show : ''}`}>
        <div className={styles.ambient} aria-hidden="true" />
        <div className={styles.stage} aria-hidden="true">
          {items.map((it, i) => {
            const s = shotFor(i);
            const [x, y, w, h] = it.box;
            const zs = zoomScale(it.box);
            const current = onPage && i === frame.index;
            const state = !current
              ? ''
              : !moving
                ? styles.still
                : frame.step === 2
                  ? styles.leave
                  : frame.step === 1
                    ? styles.zoom
                    : frame.landed
                      ? styles.land
                      : '';
            const style = {
              '--ratio': it.width / it.height,
              '--start': s.start,
              '--exit': s.exit,
              '--rest': s.rest,
              '--overshoot': s.over,
              '--dur': s.press ? '1.8s' : '2.1s',
              '--zs': zs,
              '--zx': `${(0.5 - (x + w / 2)) * zs * 100}%`,
              '--zy': `${(0.4 - (y + h / 2)) * zs * 100}%`,
            } as CSSProperties;
            const ringOn = current && frame.ring;
            const body = (
              <>
                <picture>
                  <source
                    type="image/avif"
                    srcSet={it.avif}
                    sizes="(max-width: 43.75em) 190vw, 1500px"
                  />
                  <source
                    type="image/webp"
                    srcSet={it.webp}
                    sizes="(max-width: 43.75em) 190vw, 1500px"
                  />
                  <img
                    src={it.src}
                    alt=""
                    width={it.width}
                    height={it.height}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                {/* The square, drawn round the Sotto Sotto part like a pen circling it. */}
                <span
                  className={`${styles.ring} ${ringOn ? styles.show : ''}`}
                  data-ring={ringOn ? '' : undefined}
                  style={{
                    left: `${x * 100}%`,
                    top: `${y * 100}%`,
                    width: `${w * 100}%`,
                    height: `${h * 100}%`,
                  }}
                >
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <rect x="0" y="0" width="100" height="100" pathLength={1} />
                  </svg>
                </span>
              </>
            );
            const common = {
              className: `${styles.sheet} ${state}`,
              style,
              'data-sheet': it.id,
              'data-current': current ? '' : undefined,
            };
            return it.readable ? (
              <a
                key={it.id}
                {...common}
                href={it.src}
                tabIndex={-1}
                data-press-open={it.id}
                onClick={() => pause(true)}
              >
                {body}
              </a>
            ) : (
              <div key={it.id} {...common}>
                {body}
              </div>
            );
          })}
        </div>

        {moving && frame.flutter && onPage && (
          <div className={styles.flutter} aria-hidden="true" key={`f${frame.index}`}>
            {FLIGHTS.map((v, k) => {
              const it = items[(frame.index + k * 3 + 2) % items.length]!;
              const style = {
                left: `${10 + k * 20}%`,
                top: `${8 + k * 10}%`,
                '--a': v[0],
                '--b': v[1],
                '--c': v[2],
                '--d': v[3],
                '--r': v[4],
                '--rr': v[5],
                '--delay': `${k * 0.15}s`,
              } as CSSProperties;
              // eslint-disable-next-line @next/next/no-img-element
              return <img key={k} src={it.small} alt="" style={style} />;
            })}
          </div>
        )}

        {/* The paper reel (ours, in place of the film's printing press): the papers' names
            roll past and stop on the one about to land. */}
        <div
          className={`${styles.reel} ${frame.reel ? styles.on : ''}`}
          aria-hidden="true"
          style={
            { '--to': frame.index + items.length - 2, '--from': frame.index - 2 } as CSSProperties
          }
          key={frame.reel ? `r${frame.index}` : 'r'}
        >
          <p className={`label ${styles.reelLabel}`}>{copy.eyebrow}</p>
          <div className={styles.window}>
            <ol className={styles.names}>
              {[...items, ...items, ...items].map((it, k) => (
                <li key={k} data-here={k === frame.index + items.length ? '' : undefined}>
                  {it.publication}
                </li>
              ))}
            </ol>
          </div>
          <p className={`label ${styles.reelDate}`}>{item.date ?? '\u00a0'}</p>
        </div>

        <p className={`label ${styles.type}`} aria-hidden="true">
          {shotFor(frame.index).kind}
        </p>
        <div className={styles.shadow} aria-hidden="true" />
        <div
          className={`${styles.callout} ${onPage && frame.step === 1 ? styles.show : ''}`}
          aria-live={moving && !paused ? 'off' : 'polite'}
          data-press-callout=""
          key={`c${frame.index}`}
        >
          <p className={styles.headline}>{item.headline}</p>
          <p className={`label ${styles.byline}`}>{source}</p>
        </div>
      </div>

      <div className={`${styles.intertitle} ${card ? styles.show : ''}`} aria-hidden="true">
        {card && (
          <>
            <p className={`label ${styles.cardLabel}`}>{card.eyebrow}</p>
            <p className={styles.bigtitle}>{card.title}</p>
            <p className={`label ${styles.cardSub}`}>{card.sub}</p>
          </>
        )}
      </div>
      <div className={`${styles.glow} ${frame.flash ? styles.on : ''}`} aria-hidden="true" />

      <div className={styles.ui}>
        <div className={styles.controls}>
          <button type="button" onClick={prev} aria-label="Previous page">
            <Icon d="M14.5 5.5 8 12l6.5 6.5" />
          </button>
          {moving && (
            <button
              type="button"
              onClick={() => pause(!paused)}
              aria-label={paused ? 'Play the press film' : 'Pause the press film'}
              data-press-play=""
            >
              {paused ? <Icon d="M8.5 5.8v12.4L18.2 12z" /> : <Icon d="M9 6v12M15 6v12" />}
            </button>
          )}
          <button type="button" onClick={next} aria-label="Next page">
            <Icon d="M9.5 5.5 16 12l-6.5 6.5" />
          </button>
          {onPage && item.readable && (
            <a
              href={item.src}
              className={`label ${styles.read}`}
              data-press-open={item.id}
              data-press-read=""
              onClick={() => pause(true)}
            >
              Read this page<span className="sr-only">: {source}</span>
            </a>
          )}
        </div>

        {/* The papers: where we are, how far through this one, and a way to any other. */}
        <ol className={styles.marks} aria-label="Press pages">
          {items.map((it, i) => {
            const here = onPage && i === frame.index;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={here ? 'true' : undefined}
                  aria-label={`${it.publication}: ${it.headline}`}
                  data-press-mark={it.id}
                >
                  <span
                    ref={here ? progressRef : undefined}
                    className={styles.fill}
                    style={{ transform: `scaleX(${here && !moving ? 1 : 0})` }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** A drawn icon in one stroke weight. */
function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}
