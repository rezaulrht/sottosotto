/**
 * Map projection for the self-hosted Find Us map (D42). Over about a kilometre an
 * equirectangular projection scaled by cos(latitude) is accurate enough. Shared by the map
 * script (drawing) and the page (placing the pin), so they always agree.
 */
export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

/** Pixel height for a given width, keeping true proportions at the box's latitude. */
export function mapHeight(box: BBox, width: number): number {
  const k = Math.cos((((box.north + box.south) / 2) * Math.PI) / 180);
  return (width * (box.north - box.south)) / ((box.east - box.west) * k);
}

/** A point in map pixels (origin top left). */
export function project(box: BBox, width: number, lat: number, lng: number) {
  const height = mapHeight(box, width);
  return {
    x: ((lng - box.west) / (box.east - box.west)) * width,
    y: ((box.north - lat) / (box.north - box.south)) * height,
  };
}

/** A point as percentages of the map, or null when it falls outside the drawn area. */
export function toPercent(
  box: BBox,
  lat: number,
  lng: number,
): { left: number; top: number } | null {
  const left = ((lng - box.west) / (box.east - box.west)) * 100;
  const top = ((box.north - lat) / (box.north - box.south)) * 100;
  if (left < 0 || left > 100 || top < 0 || top > 100) return null;
  return { left, top };
}
