import { describe, expect, it } from "vitest";

import {
  HOUSE_ANCHORS,
  HOUSE_POLYGONS,
  MAX_PLANET_SLOTS,
  PLANET_SLOT_OFFSET,
  S,
  isInside,
  polygonArea,
  type Point,
} from "./chart-geometry";

describe("north indian chart geometry", () => {
  it("has exactly twelve houses", () => {
    expect(Object.keys(HOUSE_POLYGONS)).toHaveLength(12);
  });

  it("tiles the square exactly, with no gap or overlap", () => {
    // If any vertex is off, the areas stop summing to the square. This is the
    // check that a hand-typed coordinate cannot quietly fail.
    const total = Object.values(HOUSE_POLYGONS).reduce(
      (sum, poly) => sum + polygonArea(poly),
      0,
    );
    expect(total).toBe(S * S);
  });

  it("gives the four edge-centre houses equal rhombi", () => {
    for (const house of [1, 4, 7, 10]) {
      expect(polygonArea(HOUSE_POLYGONS[house])).toBe(20000);
    }
  });

  it("gives the eight corner houses equal triangles", () => {
    for (const house of [2, 3, 5, 6, 8, 9, 11, 12]) {
      expect(polygonArea(HOUSE_POLYGONS[house])).toBe(10000);
    }
  });

  it("places every rashi number inside its own house", () => {
    for (const [house, anchor] of Object.entries(HOUSE_ANCHORS)) {
      const point: Point = [anchor.x, anchor.y];
      expect(
        isInside(point, HOUSE_POLYGONS[Number(house)]),
        `house ${house} label is outside its compartment`,
      ).toBe(true);
    }
  });

  it("fits three planets inside every house without spilling", () => {
    // Three is the realistic worst case for a single house; more than that and
    // the list must shrink rather than overflow the compartment.
    for (const [house, anchor] of Object.entries(HOUSE_ANCHORS)) {
      for (let slot = 0; slot < MAX_PLANET_SLOTS; slot++) {
        const point: Point = [
          anchor.x,
          anchor.y + anchor.dir * PLANET_SLOT_OFFSET(slot),
        ];
        expect(
          isInside(point, HOUSE_POLYGONS[Number(house)]),
          `house ${house} planet slot ${slot + 1} spills outside`,
        ).toBe(true);
      }
    }
  });

  it("keeps houses 1, 4, 7, 10 at the four edge centres", () => {
    // The defining property of the North Indian chart: house 1 is always top
    // centre. If this changes, the chart is no longer the one the methodology
    // doc specifies.
    const centroid = (h: number): Point => {
      const poly = HOUSE_POLYGONS[h];
      const n = poly.length;
      return [
        poly.reduce((s, p) => s + p[0], 0) / n,
        poly.reduce((s, p) => s + p[1], 0) / n,
      ];
    };
    expect(centroid(1)).toEqual([200, 100]);   // top
    expect(centroid(4)).toEqual([100, 200]);   // left
    expect(centroid(7)).toEqual([200, 300]);   // bottom
    expect(centroid(10)).toEqual([300, 200]);  // right
  });
});
