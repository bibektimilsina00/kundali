import type { BirthDetailsIn, Chart } from "../types";

// Key for sessionStorage caching
const STORAGE_KEY = "active_kundali_data";

export interface StoredKundali {
  birth: BirthDetailsIn;
  chart: Chart;
}

export function saveKundaliToStorage(birth: BirthDetailsIn, chart: Chart): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ birth, chart }));
  } catch (e) {
    console.error("Failed to save Kundali to storage", e);
  }
}

export function loadKundaliFromStorage(): StoredKundali | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredKundali;
  } catch (e) {
    console.error("Failed to load Kundali from storage", e);
    return null;
  }
}
