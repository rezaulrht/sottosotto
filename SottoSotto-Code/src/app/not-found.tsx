import type { Metadata } from 'next';
import Link from 'next/link';
import { seo } from '@/content';
import styles from './pages.module.css';

export const metadata: Metadata = {
  title: seo.pages.notFound.title,
  description: seo.pages.notFound.description,
};

export default function NotFound() {
  return (
    <div className={`container ${styles.page} ${styles.stack}`}>
      <h1 className={styles.lost}>{seo.pages.notFound.title}</h1>
      <p className={`${styles.lead} ${styles.lostLead}`}>{seo.pages.notFound.description}</p>
      <Link href="/" className={styles.textLink}>
        Home
      </Link>
    </div>
  );
}
