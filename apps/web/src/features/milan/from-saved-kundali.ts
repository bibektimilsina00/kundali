import type { SavedKundali } from "@/features/vault/types";

/** A place value the birthplace picker understands. */
export interface PlaceLike {
  id: number;
  name: string;
  label: string;
  country_code: string;
  country: string;
  latitude: number;
  longitude: number;
  tz_name: string;
  admin1: string;
  matched_as: string;
}

/**
 * Fill the birthplace fields from a saved kundali.
 *
 * Returns null when the saved row has no `tz_name`. The previous version
 * hardcoded `"Asia/Kathmandu"` for every saved kundali, so matching a partner
 * born in London silently used a Nepali timezone — several degrees of ascendant
 * off, in a result that looked entirely normal (CLAUDE.md rule 5).
 *
 * `birth` is populated by the backend for every row saved since the vault
 * started storing IANA zones; older rows return null here and the user picks the
 * birthplace, which is the only honest option.
 */
export function placeFromSavedKundali(k: SavedKundali): PlaceLike | null {
  const tzName = k.birth?.tz_name ?? k.tz_name;
  if (!tzName) return null;

  return {
    id: 0,
    name: k.place_name,
    label: k.place_name,
    country_code: "",
    country: "",
    latitude: k.lat,
    longitude: k.lon,
    tz_name: tzName,
    admin1: "",
    matched_as: k.place_name,
  };
}
