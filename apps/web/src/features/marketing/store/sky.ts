import type { Sky } from "@/features/marketing/ephemeris";

/**
 * The sky, computed once per tick and read from several places.
 *
 * The hero charts, the footer strip and the solar system's planet chip
 * all show positions; recomputing per consumer would let them disagree
 * by a tick, and they sit on screen together. One writer, many readers.
 */
let current: Sky | null = null;
const listeners = new Set<(s: Sky) => void>();

export const getSky = () => current;

export function setSky(next: Sky) {
  current = next;
  listeners.forEach((fn) => fn(next));
}

export function subscribeSky(fn: (s: Sky) => void) {
  listeners.add(fn);
  if (current) fn(current);
  return () => void listeners.delete(fn);
}
