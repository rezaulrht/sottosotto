import Link from 'next/link';
import { BOOK_PATH } from '@/lib/nav';
import styles from './RotatingBadge.module.css';

interface Props {
  /** Text repeated around the ring. */
  text?: string;
}

const R = 46;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Slowly rotating circular "Book a table" badge (PAGES.md Home §1). A real link to the
 * booking page (`data-booking` opens the booking dialog). Rotation is CSS only, off under
 * reduced motion, and stops with the hero's pause button.
 */
export function RotatingBadge({ text = 'Book a table' }: Props) {
  return (
    <Link href={BOOK_PATH} data-booking="" className={styles.badge}>
      <svg viewBox="0 0 120 120" aria-hidden="true" className={styles.ring}>
        <defs>
          <path
            id="badge-ring"
            d={`M60,60 m-${R},0 a${R},${R} 0 1,1 ${R * 2},0 a${R},${R} 0 1,1 -${R * 2},0`}
          />
        </defs>
        <text className={styles.text}>
          <textPath href="#badge-ring" textLength={CIRCUMFERENCE - 4} lengthAdjust="spacing">
            {`${text} · ${text} · `}
          </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.arrow}>
        <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.25" />
      </svg>
      <span className="sr-only">Book a Table</span>
    </Link>
  );
}
