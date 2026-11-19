import buttons from '@/components/global/BookButton.module.css';
import { LandingStage } from '@/components/find-us/LandingStage';
import landing from '@/components/find-us/Landing.module.css';
import { StaticMap } from '@/components/find-us/StaticMap';
import { VideoBackground } from '@/components/home/VideoBackground';
import { pageMetadata, site, videoFor } from '@/content';
import mapData from '@/content/map.json';
import { isProduction } from '@/lib/env';
import { directionsUrl } from '@/lib/prices';
import { MotionScope } from '@/motion/MotionScope';
import { walksMap } from '@/lib/walks';
import routes from '@/content/routes.json';
import { Walks, type WalkRow } from '@/components/find-us/Walks';
import { VenuePhoto } from '@/components/shared/VenuePhoto';
import styles from '../pages.module.css';

export const metadata = pageMetadata('findUs', '/find-us/');

/*
 * Find Us (PAGES.md, M6): opens on one stage (D75) where the client's drone clip (D71)
 * dissolves, as the visitor scrolls, into the self-hosted dark map with the pin (D42), then
 * the address and "Get directions"; without JS or with reduced motion the map and address
 * show at once. Then the contact block, parking cards, optional getting-here lines (hidden in production while
 * mock) and careers. Address, pin and walking times are MOCK until confirmed (Q1, Q30).
 */
const outlineButton = `${buttons.button} ${buttons.outline}`;
export default function FindUsPage() {
  const { address, contact, copy, geo, parking } = site;
  // Getting here is optional and hidden in production while its entries are mock (ARCHITECTURE §4.2).
  const gettingHere = site.gettingHere.filter((g) => !(g.mock && isProduction()));
  // The walks on the map (D81): measured routes, projected onto the Find Us map's own grid.
  const walks = walksMap(mapData, site.geo, routes.routes);
  const walkRows: WalkRow[] = gettingHere.map((g) => {
    // "By train: Leave Bath Spa station…" → the way, then the directions.
    const [way, ...rest] = g.text.split(': ');
    const route = routes.routes.find((r) => r.mode === g.mode);
    return {
      mode: g.mode,
      way: rest.length ? way! : g.mode,
      text: rest.length ? rest.join(': ') : g.text,
      minutes: route?.minutes ?? null,
      from: route?.from ?? null,
    };
  });
  const drone = videoFor(site.media.findUsVideo.src);
  return (
    <MotionScope>
      <div className={styles.page}>
        <LandingStage className={landing.landing} labelledBy="find-title">
          <div className={landing.stage}>
            <div className={landing.clip}>
              {drone ? (
                <VideoBackground video={drone} pauseKey="sotto.findUsMotion" tone="light" />
              ) : null}
            </div>
            <div className={landing.map}>
              <StaticMap />
            </div>
            <h1 id="find-title" className={landing.title}>
              Find Us
            </h1>
            <p className={`label ${landing.hint}`} aria-hidden="true">
              Scroll to land
            </p>
            <div className={landing.card}>
              <p className={`label ${landing.name}`}>{site.name}</p>
              <address>
                {address.line1}, {address.city} {address.postcode}
              </address>
              <a
                href={directionsUrl(geo.lat, geo.lng)}
                className={outlineButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions
                <span className="sr-only"> (opens Google Maps)</span>
              </a>
            </div>
            <p className={landing.credit}>
              Map data{' '}
              <a href={mapData.attributionUrl} rel="noopener license">
                {mapData.attribution}
              </a>
            </p>
          </div>
        </LandingStage>

        <section className={styles.section} aria-labelledby="find-contact">
          <div className={`container ${styles.stack}`} data-rise="">
            <h2 id="find-contact">{copy.enquiriesHeading}</h2>
            <address className={styles.contactLine}>
              {address.line1}, {address.city} {address.postcode}
            </address>
            <p className={`label ${styles.muted}`}>{contact.phoneLabel}</p>
            <p className={styles.contactLine}>
              <a href={`tel:${contact.phoneE164}`}>{contact.phone}</a>
            </p>
            <p className={`label ${styles.muted}`}>{contact.emailLabel}</p>
            <p className={styles.contactLine}>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
            <p className={styles.muted}>{copy.emailResponseNote}</p>
          </div>
        </section>

        <section id="parking" className={styles.section} aria-labelledby="find-parking">
          <div className="container">
            <h2 id="find-parking" className={styles.title} data-effect="reveal-lines">
              Parking
            </h2>
            <ul className={styles.parkingList} data-rise="">
              {parking.map((p) => (
                <li key={p.name} className={styles.parkingRow}>
                  <p className={styles.walk}>
                    {p.walkingMinutes.value}
                    <span className="label"> min walk</span>
                  </p>
                  <div className={styles.parkingText}>
                    <h3 className={styles.cardTitle}>{p.name}</h3>
                    {p.address ? <p className={styles.muted}>{p.address}</p> : null}
                    {p.note ? <p className={styles.muted}>{p.note}</p> : null}
                  </div>
                  {p.image ? (
                    <VenuePhoto
                      image={p.image}
                      sizes="(min-width: 48em) 18rem, 100vw"
                      ratio="3 / 2"
                      className={styles.parkingPhoto}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {gettingHere.length ? (
          <section className={styles.section} aria-labelledby="find-getting-here">
            <div className="container">
              <h2 id="find-getting-here" className={styles.title}>
                Getting here
              </h2>
              <Walks
                map={walks}
                rows={walkRows}
                art={{ src: '/map/north-parade.svg', width: mapData.width, height: mapData.height }}
                attribution={{ text: mapData.attribution, url: mapData.attributionUrl }}
              />
            </div>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="find-careers">
          <div className={`container ${styles.stack}`}>
            <h2 id="find-careers" data-effect="reveal-lines">
              {copy.careers.heading}
            </h2>
            {copy.careers.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>
              {copy.careers.applyText}{' '}
              <a href={`mailto:${contact.careersEmail}`}>{contact.careersEmail}</a>
            </p>
            <a href={`mailto:${contact.careersEmail}`} className={outlineButton}>
              {copy.careers.button}
            </a>
          </div>
        </section>
      </div>
    </MotionScope>
  );
}
