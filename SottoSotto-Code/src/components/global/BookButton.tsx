import styles from './BookButton.module.css';

interface Props {
  href: string;
  label?: string;
  variant?: 'solid' | 'outline';
  className?: string;
}

/**
 * A real link to the Hospres booking page: the no-JS fallback (D39). From M7 a delegated
 * listener catches `[data-booking]` clicks and opens the booking modal instead.
 * Takes the URL as a prop so it can be used inside Client Components without
 * pulling the content module into the client bundle.
 */
export function BookButton({ href, label = 'Book a Table', variant = 'solid', className }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      data-booking=""
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
    >
      {label}
      <span className="sr-only"> (opens the booking page in a new tab)</span>
    </a>
  );
}
