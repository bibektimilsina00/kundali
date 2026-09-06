"use client";

import { useEffect, useState } from "react";

import { sky, type Sky } from "@/features/marketing/ephemeris";
import { getSky, setSky, subscribeSky } from "@/features/marketing/store/sky";

/**
 * Drives the shared sky. Exactly one component should pass `drive`, and
 * the rest just read — the ascendant moves a degree every four minutes,
 * so it ticks every second to make that visible.
 */
export function useSky(drive = false): Sky | null {
  const [value, setValue] = useState<Sky | null>(getSky);

  useEffect(() => {
    if (!drive) return;
    const tick = () => setSky(sky(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [drive]);

  useEffect(() => subscribeSky(setValue), []);
  return value;
}
