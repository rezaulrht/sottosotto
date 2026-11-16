import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Footer } from '@/components/global/Footer';
import { Header } from '@/components/global/Header';
import { MockBadge, showMockBadge } from '@/components/global/MockBadge';
import { bookingFlowProps, seo, site } from '@/content';
import { siteEnv } from '@/lib/env';
import { MotionProvider } from '@/motion/MotionProvider';
import { BookingDialog } from '@/booking/BookingDialog';
import { CookieBanner } from '@/consent/CookieBanner';
import { colors } from '@/lib/tokens';
import { fontVariables } from './fonts';
import '@/styles/globals.css';

/** Indexed only in a clean production build (staging and override builds are noindex). */
const indexable = siteEnv() === 'production' && !showMockBadge();

export const metadata: Metadata = {
  metadataBase: new URL(site.website),
  title: { template: seo.titleTemplate, default: seo.pages.home.title },
  description: seo.pages.home.description,
  applicationName: site.name,
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { siteName: site.name, locale: 'en_GB', type: 'website' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: colors['ink-900'],
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={fontVariables}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <MockBadge />
        <MotionProvider />
        <BookingDialog note={site.copy.bookingNote} {...bookingFlowProps()} />
        <CookieBanner
          copy={site.copy.cookieBanner}
          measurementId={site.analytics.ga4MeasurementId}
        />
      </body>
    </html>
  );
}
