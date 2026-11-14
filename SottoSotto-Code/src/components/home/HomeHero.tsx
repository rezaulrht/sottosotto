import { BookButton } from '@/components/global/BookButton';
import { HoursChip } from '@/components/global/HoursChip';
import { site, videoFor } from '@/content';
import { RotatingBadge } from './RotatingBadge';
import { VideoBackground } from './VideoBackground';
import styles from './HomeHero.module.css';

interface Props {
  /** The chip's no-JS text, e.g. "Tue–Sat · 12–2 & 5–10". */
  hoursSummary: string;
}

/**
 * Home §1 (PAGES.md): full-screen muted loop under a dark overlay and grain, the name and
 * "Italian Restaurant in Bath", live hours chip, Book button and rotating badge.
 */
export function HomeHero({ hoursSummary }: Props) {
  const video = videoFor(site.media.heroVideo.src);
  return (
    <section className={styles.hero} aria-labelledby="home-title" data-hero="">
      {video ? <VideoBackground video={video} /> : null}
      <div className={`container ${styles.content}`}>
        <h1 id="home-title" className={styles.name}>
          {site.name}
        </h1>
        <p className={styles.tagline}>{site.tagline}</p>
        <p className={styles.intro}>{site.copy.homeIntro}</p>
        <div className={styles.actions}>
          <BookButton href={site.booking.widgetUrl} />
          <HoursChip hours={site.hours} summary={hoursSummary} />
        </div>
      </div>
      <div className={styles.badge}>
        <RotatingBadge href={site.booking.widgetUrl} />
      </div>
    </section>
  );
}
