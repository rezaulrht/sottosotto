import { press, pressImage, site } from '@/content';
import type { ManifestEntry, PressItem } from '@/content/schemas';
import { PressFilm, type FilmItem } from './PressFilm';
import { PressReader, type ReaderItem } from './PressReader';

/**
 * Home: the press, as the client's newspaper film (Sotto_Sotto_Newspaper_Film_Reimagined.html,
 * D70): each page flies in, lands, zooms to the Sotto Sotto part of the page and rings it with
 * an amber square, under a big headline. "Read this page" opens the reader.
 */

const largest = (list: ManifestEntry['sources']['webp']) => list.at(-1)!.src;
const srcset = (list: ManifestEntry['sources']['webp']) =>
  list.map((s) => `${s.src} ${s.width}w`).join(', ');

function image(item: PressItem): ManifestEntry {
  const entry = pressImage(item.id);
  if (!entry) throw new Error(`No processed press page for "${item.id}". Run npm run images.`);
  return entry;
}

export function PressSection() {
  const copy = site.copy.press;
  const items: FilmItem[] = press.items.map((i) => {
    const img = image(i);
    return {
      id: i.id,
      publication: i.publication,
      date: i.date,
      headline: i.headline,
      box: i.box,
      readable: i.readable,
      avif: srcset(img.sources.avif),
      webp: srcset(img.sources.webp),
      src: largest(img.sources.webp),
      small: img.sources.webp[0]!.src,
      width: img.width,
      height: img.height,
    };
  });
  const readerItems: ReaderItem[] = press.items
    .filter((i) => i.readable)
    .map((i) => {
      const img = image(i);
      return {
        id: i.id,
        publication: i.publication,
        date: i.date,
        headline: i.headline,
        box: i.box,
        avif: largest(img.sources.avif),
        webp: largest(img.sources.webp),
        width: img.width,
        height: img.height,
      };
    });

  return (
    <section aria-labelledby="home-press">
      <PressFilm
        items={items}
        copy={{
          heading: copy.heading,
          intro: copy.intro,
          outro: copy.outro,
          tagline: copy.tagline,
          eyebrow: copy.eyebrow,
          name: site.name,
          city: site.address.city,
          address: `${site.address.line1} · ${site.address.city}`,
        }}
      />
      <PressReader items={readerItems} />
    </section>
  );
}
