'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { BookButton } from './BookButton';
import { NavLinks } from './NavLinks';
import styles from './MobileNav.module.css';

/**
 * Full-screen overlay menu for small screens. A native modal <dialog> gives focus
 * trapping, Escape to close and an inert page. Book a Table stays in the header.
 */
export function MobileNav({ bookingUrl }: { bookingUrl: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const close = () => dialog.current?.close();

  // Close when the route changes (e.g. after following a link).
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        ref={opener}
        type="button"
        className={styles.toggle}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <span className={styles.bars} aria-hidden="true" />
        <span className="sr-only">Open menu</span>
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label="Site menu"
        onClose={() => opener.current?.focus()}
      >
        <div className={styles.inner}>
          <button type="button" className={styles.close} onClick={close}>
            Close
          </button>
          <nav aria-label="Main">
            <NavLinks className={styles.list} linkClassName={styles.link} onNavigate={close} />
          </nav>
          <BookButton href={bookingUrl} />
        </div>
      </dialog>
    </>
  );
}
