'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PressReader.module.css';

export interface ReaderItem {
  id: string;
  publication: string;
  date: string | null;
  headline: string;
  /** Headline position as fractions of the page. */
  spot: [number, number];
  avif: string;
  webp: string;
  width: number;
  height: number;
}

/**
 * The press reader (design 2026-11-18): a native <dialog> showing one page as large as the
 * screen allows, with an amber ring on its headline (the client's `spot`). Opened by any
 * link with `data-press-open`; without JS those links simply open the image. Arrow keys
 * and the buttons move through the readable pages; focus returns to the opener.
 */
export function PressReader({ items }: { items: ReaderItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  // Opened by a pointer (detail > 0) rather than the keyboard: return focus without scrolling.
  const byPointerRef = useRef(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const link = e.target instanceof Element ? e.target.closest('[data-press-open]') : null;
      const dialog = dialogRef.current;
      if (!link || !dialog || typeof dialog.showModal !== 'function') return;
      const at = items.findIndex((i) => i.id === link.getAttribute('data-press-open'));
      if (at < 0) return;
      e.preventDefault();
      // The table pages are pointer-only: return focus to the headline in the list.
      openerRef.current =
        document.querySelector<HTMLElement>(
          `[data-press-list] [data-press-open="${items[at]!.id}"]`,
        ) ?? (link as HTMLElement);
      byPointerRef.current = e.detail > 0;
      setIndex(at);
      dialog.showModal();
      document.documentElement.toggleAttribute('data-press-reader-open', true);
    };
    document.addEventListener('click', onClick);
    dialogRef.current?.setAttribute('data-ready', ''); // listener attached (tests wait for it)
    return () => document.removeEventListener('click', onClick);
  }, [items]);

  const move = (step: number) => setIndex((i) => (i + step + items.length) % items.length);
  const item = items[index]!;
  const title = [item.publication, item.date].filter(Boolean).join(' · ');

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="press-reader-title"
      aria-describedby="press-reader-headline"
      onClose={() => {
        document.documentElement.toggleAttribute('data-press-reader-open', false);
        openerRef.current?.focus({ preventScroll: byPointerRef.current });
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close(); // the backdrop
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') move(1);
        else if (e.key === 'ArrowLeft') move(-1);
      }}
      data-lenis-prevent=""
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h2 id="press-reader-title" className={`label ${styles.source}`}>
              {title}
            </h2>
            <p id="press-reader-headline" className={styles.headline}>
              {item.headline}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className={styles.stage}>
          <div
            className={styles.page}
            style={{ aspectRatio: `${item.width} / ${item.height}` }}
            key={item.id}
          >
            <picture>
              <source type="image/avif" srcSet={item.avif} />
              <img
                src={item.webp}
                alt={`${title}: ${item.headline}`}
                width={item.width}
                height={item.height}
              />
            </picture>
            <span
              className={styles.ring}
              data-ring=""
              style={{ left: `${item.spot[0] * 100}%`, top: `${item.spot[1] * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
        <nav className={styles.nav} aria-label="Press pages">
          <button type="button" onClick={() => move(-1)}>
            <span aria-hidden="true">‹</span> Previous
          </button>
          <span className={styles.count} aria-live="polite">
            {index + 1} / {items.length}
          </span>
          <button type="button" onClick={() => move(1)}>
            Next <span aria-hidden="true">›</span>
          </button>
        </nav>
      </div>
    </dialog>
  );
}
