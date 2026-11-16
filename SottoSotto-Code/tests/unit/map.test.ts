import { describe, expect, it } from 'vitest';
import mapData from '../../src/content/map.json';
import site from '../../data/site.json';
import { mapHeight, project, toPercent, type BBox } from '@/lib/map';

const box: BBox = { south: 51.3762, west: -2.3645, north: 51.3852, east: -2.3501 };

describe('map projection (D42)', () => {
  it('keeps true proportions at Bath’s latitude (about a 1 km square)', () => {
    expect(mapHeight(box, 1600)).toBeCloseTo(1602, 0);
  });

  it('maps the corners and the centre', () => {
    expect(project(box, 1600, box.north, box.west)).toEqual({ x: 0, y: 0 });
    const se = project(box, 1600, box.south, box.east);
    expect(se.x).toBeCloseTo(1600);
    expect(se.y).toBeCloseTo(mapHeight(box, 1600));
    expect(toPercent(box, (box.north + box.south) / 2, (box.east + box.west) / 2)).toEqual({
      left: 50,
      top: 50,
    });
  });

  it('returns null for a pin outside the drawn map', () => {
    expect(toPercent(box, 51.4, -2.36)).toBeNull();
  });

  it('the drawn map matches the box and contains the (mock) pin', () => {
    expect(mapData.bbox).toEqual(box);
    const pin = toPercent(mapData.bbox, site.geo.lat, site.geo.lng);
    expect(pin).not.toBeNull();
  });

  it('labels come from the data and sit inside the map', () => {
    expect(mapData.labels.map((l) => l.text)).toEqual(
      expect.arrayContaining(['North Parade', 'River Avon', 'Parade Gardens']),
    );
    for (const l of mapData.labels) {
      expect(l.left).toBeGreaterThan(0);
      expect(l.left).toBeLessThan(100);
      expect(l.top).toBeGreaterThan(0);
      expect(l.top).toBeLessThan(100);
    }
  });
});
