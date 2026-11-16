'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HomeSections.module.css';

interface Props {
  /** The heading: the wine tab's label from wine.json ("Wine"). */
  title: string;
  names: string[];
}

/**
 * Home §5 wine strip (PAGES.md, DESIGN_SYSTEM §4): a slow, continuous line of wine
 * names, text only. CSS animation on transform; pauses on hover and focus, and a pause
 * button covers WCAG 2.2.2 (motion over 5 s). The list is read once: the second copy that
 * closes the loop is hidden from assistive tech. Reduced motion: a static, wrapped list.
 */
export function WineStrip({ title, names }: Props) {
  const [paused, setPaused] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // The button only works with JS: it ships hidden and is revealed once hydrated.
  useEffect(() => {
    if (toggleRef.current) toggleRef.current.hidden = false;
  }, []);

  const items = (hidden: boolean) => (
    <ul className={styles.track} aria-hidden={hidden || undefined}>
      {names.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );

  return (
    <section
      className={styles.wine}
      aria-labelledby="home-wine"
      data-paused={paused ? '' : undefined}
    >
      <div className={`container ${styles.wineHead}`}>
        <h2 id="home-wine" className={styles.label}>
          {title}
        </h2>
        <button
          ref={toggleRef}
          type="button"
          hidden
          className={styles.wineToggle}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Play' : 'Pause'}
          <span className="sr-only"> the moving wine list</span>
        </button>
      </div>
      <div className={styles.marquee}>
        <div className={styles.marqueeInner}>
          {items(false)}
          {items(true)}
        </div>
      </div>
    </section>
  );
}
