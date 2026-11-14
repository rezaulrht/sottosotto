'use client';

import { useEffect, useState } from 'react';
import { hoursStatus, statusText, type HoursData } from '@/lib/hours';
import styles from './HoursChip.module.css';

interface Props {
  hours: HoursData;
  /** Weekly summary rendered at build time, e.g. "Tue–Sat · 12–2 & 5–10". Always true. */
  summary: string;
}

/**
 * Static weekly summary first (correct without JS and with no layout shift), then
 * today's state in Europe/London (ARCHITECTURE §5.2). Recomputed when the tab is shown again.
 */
export function HoursChip({ hours, summary }: Props) {
  const [text, setText] = useState(summary);

  useEffect(() => {
    const update = () => setText(statusText(hoursStatus(new Date(), hours)));
    update();
    const onVisible = () => {
      if (document.visibilityState === 'visible') update();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [hours]);

  return (
    <p className={styles.chip} aria-live="polite">
      <span className={styles.dot} aria-hidden="true" />
      {text}
    </p>
  );
}
