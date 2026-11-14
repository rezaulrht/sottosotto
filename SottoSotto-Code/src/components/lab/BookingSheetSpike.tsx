'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import styles from './BookingSheetSpike.module.css';

interface Props {
  url: string;
  note: string;
}

type Status = 'idle' | 'loading' | 'loaded' | 'slow';
type Size = 'fill' | 'legacy';

interface Metrics {
  viewport: string;
  visualViewport: string;
  sheet: string;
  frame: string;
  dpr: number;
  loadMs: number | null;
}

const SLOW_MS = 10_000;
const px = (r: DOMRect | undefined) =>
  r ? `${Math.round(r.width)} × ${Math.round(r.height)}` : '–';

/**
 * Hospres spike (BUILD_PLAN M2, ARCHITECTURE §8.1, Q25). A bare native <dialog> sheet with
 * the real widget: the iframe is created on first open and kept, a loading state shows
 * until its `load` event, and after 10 s a fallback link appears. Live sizes are shown so
 * a tester on a phone can report them. Two sizes to compare: fill the sheet, or the old
 * site's fixed 575 × 514 embed.
 */
export function BookingSheetSpike({ url, note }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const openedAt = useRef(0);
  const [status, setStatus] = useState<Status>('idle');
  const [size, setSize] = useState<Size>('fill');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const loadMs = useRef<number | null>(null);

  const measure = useCallback(() => {
    const vv = window.visualViewport;
    setMetrics({
      viewport: `${window.innerWidth} × ${window.innerHeight}`,
      visualViewport: vv ? `${Math.round(vv.width)} × ${Math.round(vv.height)}` : '–',
      sheet: px(dialogRef.current?.getBoundingClientRect()),
      frame: px(frameRef.current?.getBoundingClientRect()),
      dpr: window.devicePixelRatio,
      loadMs: loadMs.current,
    });
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    window.addEventListener('resize', measure);
    vv?.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      vv?.removeEventListener('resize', measure);
    };
  }, [measure]);

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(
      () => setStatus((s) => (s === 'loading' ? 'slow' : s)),
      SLOW_MS,
    );
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    requestAnimationFrame(measure);
  }, [size, status, measure]);

  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    const dialog = dialogRef.current;
    const host = hostRef.current;
    if (!dialog || !host || typeof dialog.showModal !== 'function') return; // fall back to the link
    e.preventDefault();
    openerRef.current = e.currentTarget;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    if (!frameRef.current) {
      const frame = document.createElement('iframe');
      frame.src = url;
      frame.title = 'Book a table at Sotto Sotto';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allow = 'payment';
      frame.className = styles.frame ?? '';
      frame.addEventListener('load', () => {
        loadMs.current = Math.round(performance.now() - openedAt.current);
        setStatus('loaded');
      });
      openedAt.current = performance.now();
      setStatus('loading');
      host.append(frame);
      frameRef.current = frame;
    }
    requestAnimationFrame(measure);
  };

  const onClose = () => {
    document.documentElement.style.overflow = '';
    openerRef.current?.focus();
  };

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener"
        data-booking=""
        onClick={open}
        className={styles.opener}
      >
        Book a Table
        <span className="sr-only"> (opens the booking page in a new tab)</span>
      </a>

      <fieldset className={styles.options}>
        <legend>Widget size inside the sheet</legend>
        <label>
          <input
            type="radio"
            name="size"
            checked={size === 'fill'}
            onChange={() => setSize('fill')}
          />{' '}
          Fill the sheet
        </label>
        <label>
          <input
            type="radio"
            name="size"
            checked={size === 'legacy'}
            onChange={() => setSize('legacy')}
          />{' '}
          Old site size (575 × 514)
        </label>
      </fieldset>

      <dialog
        ref={dialogRef}
        className={styles.sheet}
        aria-labelledby="spike-title"
        onClose={onClose}
        data-size={size}
      >
        <div className={styles.header}>
          <h2 id="spike-title" className={styles.heading}>
            Book a Table
          </h2>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close</span>
          </button>
        </div>
        <p className={styles.note}>{note}</p>
        <div className={styles.body}>
          {status === 'loading' ? (
            <p className={styles.status}>Loading the booking widget…</p>
          ) : null}
          {status === 'slow' ? (
            <p className={styles.status}>
              This is taking a while.{' '}
              <a href={url} target="_blank" rel="noopener">
                Open the booking page
              </a>
            </p>
          ) : null}
          <div ref={hostRef} className={styles.host} />
        </div>
      </dialog>

      <section className={styles.readout} aria-labelledby="spike-metrics">
        <h2 id="spike-metrics" className={styles.readoutTitle}>
          Sizes (send these with a screenshot)
        </h2>
        <dl>
          <dt>Status</dt>
          <dd data-testid="spike-status">{status}</dd>
          <dt>Window</dt>
          <dd>{metrics?.viewport ?? '–'}</dd>
          <dt>Visible area (changes when the keyboard opens)</dt>
          <dd>{metrics?.visualViewport ?? '–'}</dd>
          <dt>Sheet</dt>
          <dd>{metrics?.sheet ?? '–'}</dd>
          <dt>Widget frame</dt>
          <dd>{metrics?.frame ?? '–'}</dd>
          <dt>Pixel ratio</dt>
          <dd>{metrics?.dpr ?? '–'}</dd>
          <dt>Widget load time</dt>
          <dd>{metrics?.loadMs != null ? `${metrics.loadMs} ms` : '–'}</dd>
        </dl>
      </section>
    </>
  );
}
