import Link from 'next/link';
import { BOOK_PATH } from '@/lib/nav';
import styles from './BookButton.module.css';

interface Props {
  label?: string;
  variant?: 'solid' | 'outline';
  className?: string;
}

/**
 * Book a Table (D59). A real link to the booking page, so it works without JS; with JS the
 * booking dialog catches `[data-booking]` clicks and opens the same flow in place.
 */
export function BookButton({ label = 'Book a Table', variant = 'solid', className }: Props) {
  return (
    <Link
      href={BOOK_PATH}
      data-booking=""
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
    >
      {label}
    </Link>
  );
}
