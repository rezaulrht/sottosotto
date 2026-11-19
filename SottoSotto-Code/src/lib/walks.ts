/**
 * Getting here walks (D81): the routes in src/content/routes.json projected onto the Find Us
 * map's own pixel grid (scripts/map.ts), cropped to the walks with some air around them.
 * Pure and run at build time, so the page ships finished SVG paths, not coordinates.
 */
import { project, type BBox } from './map';

export interface WalkInput {
  mode: string;
  from: string;
  minutes: number;
  path: number[][];
}

export interface Walk {
  mode: string;
  from: string;
  minutes: number;
  /** SVG path in map pixels. */
  d: string;
  start: { x: number; y: number };
}

export interface WalksMap {
  /** viewBox "x y width height" in map pixels. */
  viewBox: string;
  crop: { x: number; y: number; width: number; height: number };
  walks: Walk[];
  pin: { x: number; y: number };
  labels: Array<{ text: string; x: number; y: number; angle: number }>;
}

export function walksMap(
  map: {
    bbox: BBox;
    width: number;
    height: number;
    labels: Array<{ text: string; left: number; top: number; angle: number }>;
  },
  to: { lat: number; lng: number },
  routes: WalkInput[],
  /** Air around the walks, as a share of their extent. */
  pad = 0.22,
): WalksMap {
  const at = (lat: number, lng: number) => project(map.bbox, map.width, lat, lng);
  const walks: Walk[] = routes.map((r) => {
    const points = r.path.map(([lat, lng]) => at(lat!, lng!));
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    return { mode: r.mode, from: r.from, minutes: r.minutes, d, start: points[0]! };
  });
  const pin = at(to.lat, to.lng);

  const xs = [pin.x, ...routes.flatMap((r) => r.path.map(([lat, lng]) => at(lat!, lng!).x))];
  const ys = [pin.y, ...routes.flatMap((r) => r.path.map(([lat, lng]) => at(lat!, lng!).y))];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  // A landscape crop (4:3 at least), clamped to the drawn map.
  let width = (maxX - minX) * (1 + pad * 2);
  let height = (maxY - minY) * (1 + pad * 2);
  width = Math.max(width, height * (4 / 3));
  height = Math.max(height, width * (3 / 4));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const x = Math.min(Math.max(cx - width / 2, 0), map.width - width);
  const y = Math.min(Math.max(cy - height / 2, 0), map.height - height);
  const crop = { x, y, width, height };

  const labels = map.labels
    .map((l) => ({
      text: l.text,
      x: (l.left / 100) * map.width,
      y: (l.top / 100) * map.height,
      angle: l.angle,
    }))
    .filter((l) => l.x > x && l.x < x + width && l.y > y && l.y < y + height);

  return {
    viewBox: `${x.toFixed(1)} ${y.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`,
    crop,
    walks,
    pin,
    labels,
  };
}
