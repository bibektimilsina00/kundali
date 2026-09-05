/**
 * North Indian chart geometry, kept separate from the component so it can be
 * verified without rendering.
 *
 * A square with both diagonals plus an inner diamond joining the midpoints of
 * the sides yields exactly twelve compartments: four rhombi at the edge centres
 * (houses 1, 4, 7, 10) and eight corner triangles. Houses are FIXED — house 1
 * is always top centre — and the signs move. That is what distinguishes it from
 * the South Indian chart.
 */

export const S = 400; // viewBox size; the SVG scales to its container
export const M = S / 2; // edge midpoints and centre
export const Q = S / 4; // where the diagonals meet the inner diamond

export type Point = readonly [number, number];

export const HOUSE_POLYGONS: Record<number, readonly Point[]> = {
  1: [[M, 0], [S - Q, Q], [M, M], [Q, Q]],
  2: [[0, 0], [M, 0], [Q, Q]],
  3: [[0, 0], [Q, Q], [0, M]],
  4: [[0, M], [Q, Q], [M, M], [Q, S - Q]],
  5: [[0, M], [Q, S - Q], [0, S]],
  6: [[0, S], [Q, S - Q], [M, S]],
  7: [[M, S], [Q, S - Q], [M, M], [S - Q, S - Q]],
  8: [[M, S], [S - Q, S - Q], [S, S]],
  9: [[S, S], [S - Q, S - Q], [S, M]],
  10: [[S, M], [S - Q, S - Q], [M, M], [S - Q, Q]],
  11: [[S, M], [S - Q, Q], [S, 0]],
  12: [[S, 0], [S - Q, Q], [M, 0]],
};

/** Rashi-number position, and which way the planet list stacks from it. */
export const HOUSE_ANCHORS: Record<number, { x: number; y: number; dir: 1 | -1 }> = {
  1: { x: M, y: 74, dir: 1 },
  2: { x: 96, y: 34, dir: 1 },
  3: { x: 34, y: 96, dir: 1 },
  4: { x: 74, y: M, dir: 1 },
  5: { x: 34, y: 304, dir: -1 },
  6: { x: 96, y: 366, dir: -1 },
  7: { x: M, y: 326, dir: -1 },
  8: { x: 304, y: 366, dir: -1 },
  9: { x: 366, y: 304, dir: -1 },
  10: { x: 326, y: M, dir: -1 },
  11: { x: 366, y: 96, dir: 1 },
  12: { x: 304, y: 34, dir: 1 },
};

/** Vertical offset of the nth planet listed in a house. */
export const PLANET_SLOT_OFFSET = (n: number) => 17 + n * 14;
export const MAX_PLANET_SLOTS = 3;

export const toPoints = (poly: readonly Point[]): string =>
  poly.map(([x, y]) => `${x},${y}`).join(" ");

export function polygonArea(poly: readonly Point[]): number {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

export function isInside(point: Point, poly: readonly Point[]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
