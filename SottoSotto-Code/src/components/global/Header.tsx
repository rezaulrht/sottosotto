import Link from 'next/link';
import { site } from '@/content';
import { BookButton } from './BookButton';
import { HeaderScroll } from './HeaderScroll';
import { MobileNav } from './MobileNav';
import { NavLinks } from './NavLinks';
import styles from './Header.module.css';

const HEADER_ID = 'site-header';

/**
 * Nav left, name centred, Book right (PAGES.md, Global). Transparent at the top of the
 * page; solid and smaller once scrolled (`data-scrolled`, set by HeaderScroll).
 * The logo is a text wordmark until the client supplies one (Q9).
 */
export function Header() {
  return (
    <>
      <HeaderScroll headerId={HEADER_ID} className={styles.sentinel} />
      <header id={HEADER_ID} className={styles.header}>
        <div className={styles.bar}>
          <div className={styles.start}>
            <nav aria-label="Main" className={styles.desktopNav}>
              <NavLinks className={styles.list} linkClassName={styles.link} />
            </nav>
            <div className={styles.mobileNav}>
              <MobileNav />
            </div>
          </div>
          <Link href="/" className={styles.wordmark} aria-label={`${site.name}, home`}>
            {site.name}
          </Link>
          <div className={styles.end}>
            <BookButton />
          </div>
        </div>
      </header>
    </>
  );
}
