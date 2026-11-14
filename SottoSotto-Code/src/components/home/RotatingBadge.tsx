import styles from './RotatingBadge.module.css';

interface Props {
  href: string;
  /** Text repeated around the ring. */
  text?: string;
}

const R = 46;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Slowly rotating circular "Book a table" badge (PAGES.md Home §1). A real link to
 * Hospres (`data-booking` opens the modal from M7). Rotation is CSS only, off under
 * reduced motion, and stops with the hero's pause button.
 */
export function RotatingBadge({ href, text = 'Book a table' }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener" data-booking="" className={styles.badge}>
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
      <span className="sr-only">Book a Table (opens the booking page in a new tab)</span>
    </a>
  );
}
