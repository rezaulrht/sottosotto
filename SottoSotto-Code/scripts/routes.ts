/**
 * Getting here walks (D81): fetches the walking routes from Bath Spa station, the bus
 * station and Bath Abbey to the restaurant (site.json `geo`) from OpenStreetMap foot routing,
 * once, and writes src/content/routes.json (committed). The site never calls the router.
 * Also prints the walks from the car parks, to keep site.json `walkingMinutes` honest.
 *
 *   npm run routes
 *
 * Route data © OpenStreetMap contributors (ODbL), routed by routing.openstreetmap.de.
 */
import { setDefaultResultOrder } from 'node:dns';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../data/site.json';

// The router's IPv6 address is not reachable from every network; IPv4 always is.
setDefaultResultOrder('ipv4first');

const root = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(root, 'src', 'content', 'routes.json');
const ROUTER = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';
const HEADERS = { 'User-Agent': 'SiteRebuild/1.0 (getting-here routes)' };

/** A point on Manvers Street: the straight way north that the directions describe. */
const MANVERS = { lat: 51.379105, lng: -2.357069 }; // mid-point of the street's centreline (OSM)

/** Starting points: the station forecourt, the bus bays, the Abbey's west front. */
const STARTS = [
  { mode: 'train', from: 'Bath Spa station', lat: 51.37795, lng: -2.35745, via: MANVERS },
  { mode: 'bus', from: 'Bath bus station', lat: 51.3779, lng: -2.3593, via: MANVERS },
  { mode: 'foot', from: 'Bath Abbey', lat: 51.38138, lng: -2.35937, via: null },
] as const;

/** Car park entrances (OpenStreetMap), for the walking times shown on Find Us. */
const CAR_PARKS = [
  { name: 'Sports and Leisure Centre car park', lat: 51.381512, lng: -2.3542986 },
  { name: 'Manvers Street Car Park', lat: 51.3796902, lng: -2.3565793 },
  { name: 'Bath Cricket Club Public Car Park', lat: 51.3805218, lng: -2.3522239 },
];

interface Route {
  distance: number;
  duration: number;
  geometry: { coordinates: Array<[number, number]> };
}

async function walk(
  lat: number,
  lng: number,
  via: { lat: number; lng: number } | null = null,
): Promise<Route> {
  const { lat: toLat, lng: toLng } = site.geo;
  const stops = [[lng, lat], ...(via ? [[via.lng, via.lat]] : []), [toLng, toLat]];
  const url = `${ROUTER}/${stops.map((s) => s.join(',')).join(';')}?overview=full&geometries=geojson`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Router said ${res.status} for ${url}`);
  const body = (await res.json()) as { routes: Route[] };
  const route = body.routes[0];
  if (!route) throw new Error(`No route from ${lat},${lng}`);
  return route;
}

const pause = () => new Promise((r) => setTimeout(r, 1100));
/** Minutes at an unhurried 80 m a minute, rounded up: never promise a shorter walk. */
const minutes = (metres: number) => Math.max(1, Math.ceil(metres / 80));

const routes = [];
for (const start of STARTS) {
  const r = await walk(start.lat, start.lng, start.via);
  routes.push({
    mode: start.mode,
    from: start.from,
    metres: Math.round(r.distance),
    minutes: minutes(r.distance),
    // [lat, lng], six decimals (about 10 cm): plenty for a 1 km map.
    path: r.geometry.coordinates.map(([lng, lat]) => [+lat.toFixed(6), +lng.toFixed(6)]),
  });
  console.log(`✓ ${start.from}: ${Math.round(r.distance)} m, ${minutes(r.distance)} min`);
  await pause();
}

writeFileSync(
  OUT,
  JSON.stringify(
    {
      to: site.geo,
      fetched: new Date().toISOString().slice(0, 10),
      source: 'OpenStreetMap foot routing (routing.openstreetmap.de), © OpenStreetMap contributors',
      routes,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Wrote ${OUT}`);

console.log('\nCar parks (site.json walkingMinutes):');
for (const p of CAR_PARKS) {
  const r = await walk(p.lat, p.lng);
  console.log(`  ${p.name}: ${Math.round(r.distance)} m → ${minutes(r.distance)} min`);
  await pause();
}
