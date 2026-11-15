'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BOOK_PATH } from '@/lib/nav';
import { BookingFlow, type BookingFlowProps } from './BookingFlow';
import styles from './BookingDialog.module.css';

interface Props extends BookingFlowProps {
  /** "Sotto Sotto is a very small restaurant and booking is strongly recommended." */
  note: string;
}

/**
 * Booking dialog (D39 shell, D59 flow). Every Book a Table link is a real link to /book/;
 * with JS, one delegated listener opens this native <dialog> instead (focus trap, Escape,
 * inert page). Centred panel on larger screens, a full-height sheet on phones. The flow
 * mounts on first open and keeps its state for the visit; focus returns to the opener.
 */
export function BookingDialog({ note, ...flow }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Capture phase: runs before next/link's own click handler, which then sees
    // defaultPrevented and does not navigate.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const link = e.target instanceof Element ? e.target.closest('a[data-booking]') : null;
      const dialog = dialogRef.current;
      if (!link || !dialog || typeof dialog.showModal !== 'function') return;
      if (pathRef.current === BOOK_PATH) return; // the flow is already on the page
      e.preventDefault();
      openerRef.current = link as HTMLElement;
      // Opened from the mobile menu: close that first.
      (link.closest('dialog[open]') as HTMLDialogElement | null)?.close();
      setMounted(true);
      dialog.showModal();
      document.documentElement.toggleAttribute('data-booking-open', true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  const onClose = () => {
    document.documentElement.toggleAttribute('data-booking-open', false);
    openerRef.current?.focus();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="booking-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close(); // click on the backdrop
      }}
      data-lenis-prevent=""
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="booking-dialog-title" className={styles.title}>
            Book a Table
          </h2>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close</span>
          </button>
        </div>
        <p className={styles.note}>{note}</p>
        {mounted ? <BookingFlow {...flow} headingLevel={3} /> : null}
      </div>
    </dialog>
  );
}
