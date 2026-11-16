/**
 * Find Us map (D42, M6): draws a dark SVG of the streets around North Parade from
 * OpenStreetMap data (© OpenStreetMap contributors, ODbL). No tiles, keys or third-party
 * requests on the site.
 *
 *   npm run map            # draw from .cache/map/osm.json
 *
 * The raw data is fetched once from the Overpass API (see docs/ASSETS.md) and kept out of
 * git. Outputs (committed): public/map/north-parade.svg and src/content/map.json (box,
 * size and street/place labels, which the page renders as real text). The pin is not
 * drawn: the page places it from site.json `geo`, so confirming the real pin needs no
 * redraw as long as it falls inside the box.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapHeight, project, type BBox } from '../src/lib/map';

const root = fileURLToPath(new URL('..', import.meta.url));
const SOURCE = join(root, '.cache', 'map', 'osm.json');
const SVG_OUT = join(root, 'public', 'map', 'north-parade.svg');
const JSON_OUT = join(root, 'src', 'content', 'map.json');

/** About 1 km square centred on North Parade (matches the Overpass query). */
const BOX: BBox = { south: 51.3762, west: -2.3645, north: 51.3852, east: -2.3501 };
const WIDTH = 1600;
const HEIGHT = mapHeight(BOX, WIDTH);

/** Labels: only names that exist in the data are placed. */
const LABELS = [
  'River Avon',
  'North Parade',
  'North Parade Road',
  'Pierrepont Street',
  'Manvers Street',
  'Grand Parade',
  'Orange Grove',
  'Parade Gardens',
  'Bath Abbey',
  'Pulteney Bridge',
];

/** Site palette, darkened for a map that sits quietly behind the pin. */
const COLOURS = {
  background: '#141311',
  park: '#1b1e17',
  water: '#1b2224',
  building: '#24221f',
  minor: '#35322e',
  road: '#433f3a',
  major: '#524d46',
  rail: '#2e2c29',
};

interface OsmElement {
  type: 'way' | 'relation' | 'node';
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
  members?: Array<{ role: string; geometry?: Array<{ lat: number; lon: number }> }>;
}

if (!existsSync(SOURCE)) {
  console.error(`✗ ${SOURCE} not found. Fetch the OpenStreetMap extract first (docs/ASSETS.md).`);
  process.exit(1);
}
const { elements } = JSON.parse(readFileSync(SOURCE, 'utf8')) as { elements: OsmElement[] };

type Pt = [number, number];
const pt = (g: { lat: number; lon: number }): Pt => {
  const p = project(BOX, WIDTH, g.lat, g.lon);
  return [Math.round(p.x), Math.round(p.y)]; // whole pixels: smaller file, no visible loss
};
const line = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}`;
const ring = (pts: Pt[]) => `${line(pts)}Z`;

/** Join open member ways of a multipolygon into closed rings. */
function joinRings(parts: Pt[][]): Pt[][] {
  const rings: Pt[][] = [];
  const pool = parts.map((p) => [...p]);
  const same = (a: Pt, b: Pt) => a[0] === b[0] && a[1] === b[1];
  while (pool.length) {
    let current = pool.shift()!;
    let grew = true;
    while (!same(current[0]!, current.at(-1)!) && grew) {
      grew = false;
      for (let i = 0; i < pool.length; i++) {
        const p = pool[i]!;
        const end = current.at(-1)!;
        if (same(end, p[0]!)) current = [...current, ...p.slice(1)];
        else if (same(end, p.at(-1)!)) current = [...current, ...[...p].reverse().slice(1)];
        else continue;
        pool.splice(i, 1);
        grew = true;
        break;
      }
    }
    rings.push(current);
  }
  return rings;
}

const layers: Record<keyof typeof COLOURS, string[]> = {
  background: [],
  park: [],
  water: [],
  building: [],
  minor: [],
  road: [],
  major: [],
  rail: [],
};
const riverLines: string[] = [];
const named = new Map<string, { kind: 'way' | 'area'; pts: Pt[] }>();

const MAJOR = new Set(['trunk', 'primary', 'secondary', 'trunk_link', 'primary_link']);
const ROAD = new Set(['tertiary', 'unclassified', 'residential', 'living_street', 'pedestrian']);
const MINOR = new Set(['service', 'footway', 'path', 'steps', 'cycleway', 'track']);

for (const el of elements) {
  const t = el.tags ?? {};
  if (el.type === 'relation' && el.members) {
    const outers = el.members
      .filter((m) => m.role !== 'inner' && m.geometry)
      .map((m) => m.geometry!.map(pt));
    for (const r of joinRings(outers)) layers.water.push(ring(r));
    continue;
  }
  if (el.type !== 'way' || !el.geometry) continue;
  const pts = el.geometry.map(pt);
  const name = t.name;
  if (t.building) layers.building.push(ring(pts));
  else if (t.natural === 'water') layers.water.push(ring(pts));
  else if (t.leisure || t.landuse === 'grass') layers.park.push(ring(pts));
  else if (t.waterway === 'river') riverLines.push(line(pts));
  else if (t.railway === 'rail') layers.rail.push(line(pts));
  else if (t.highway && MAJOR.has(t.highway)) layers.major.push(line(pts));
  else if (t.highway && ROAD.has(t.highway)) layers.road.push(line(pts));
  else if (t.highway && MINOR.has(t.highway)) layers.minor.push(line(pts));

  if (name && LABELS.includes(name)) {
    const kind = t.highway || t.waterway ? 'way' : 'area';
    const length = (p: Pt[]) =>
      p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i]![0], q[1] - p[i]![1]), 0);
    const prev = named.get(name);
    if (!prev || length(pts) > length(prev.pts)) named.set(name, { kind, pts });
  }
}

/** Label at the middle of the longest way of that name (or an area's centre). */
const labels = [...named.entries()]
  .map(([text, { kind, pts }]) => {
    let x: number;
    let y: number;
    let angle = 0;
    if (kind === 'area') {
      x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    } else {
      // The middle of the part on the map: rivers run far beyond it.
      const inside = pts.filter(([px, py]) => px >= 0 && px <= WIDTH && py >= 0 && py <= HEIGHT);
      const along = inside.length >= 2 ? inside : pts;
      const mid = Math.floor((along.length - 1) / 2);
      const a = along[mid]!;
      const b = along[Math.min(mid + 1, along.length - 1)]!;
      x = (a[0] + b[0]) / 2;
      y = (a[1] + b[1]) / 2;
      angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
      if (angle > 90) angle -= 180;
      if (angle < -90) angle += 180;
    }
    return {
      text,
      left: Math.round((x / WIDTH) * 1000) / 10,
      top: Math.round((y / HEIGHT) * 1000) / 10,
      angle: Math.round(angle),
    };
  })
  .filter((l) => l.left > 3 && l.left < 97 && l.top > 3 && l.top < 97);

const fill = (d: string[], colour: string) =>
  d.length ? `<path fill="${colour}" d="${d.join('')}"/>` : '';
const stroke = (d: string[], colour: string, width: number, extra = '') =>
  d.length
    ? `<path fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra} d="${d.join('')}"/>`
    : '';

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${Math.round(HEIGHT)}" width="${WIDTH}" height="${Math.round(HEIGHT)}">`,
  `<rect width="100%" height="100%" fill="${COLOURS.background}"/>`,
  fill(layers.park, COLOURS.park),
  stroke(riverLines, COLOURS.water, 40),
  fill(layers.water, COLOURS.water),
  fill(layers.building, COLOURS.building),
  stroke(layers.rail, COLOURS.rail, 4, ' stroke-dasharray="10 8"'),
  stroke(layers.minor, COLOURS.minor, 2.5),
  stroke(layers.road, COLOURS.road, 7),
  stroke(layers.major, COLOURS.major, 11),
  '</svg>',
].join('');

mkdirSync(join(root, 'public', 'map'), { recursive: true });
writeFileSync(SVG_OUT, svg);
writeFileSync(
  JSON_OUT,
  `${JSON.stringify(
    {
      bbox: BOX,
      width: WIDTH,
      height: Math.round(HEIGHT),
      labels,
      attribution: '© OpenStreetMap contributors',
      attributionUrl: 'https://www.openstreetmap.org/copyright',
      source: 'OpenStreetMap via the Overpass API, extract of 2026-11-16',
    },
    null,
    2,
  )}\n`,
);
console.log(
  `✓ public/map/north-parade.svg (${Math.round(svg.length / 1024)} KB), ${labels.length} labels: ${labels.map((l) => l.text).join(', ')}`,
);
