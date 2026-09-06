import { apiFetch } from "@/lib/api/client";
import type { Place } from "@/features/kundali/types";

export const DEFAULT_POPULAR_PLACES: Place[] = [
  {
    id: 1,
    label: "Kathmandu, Nepal",
    name: "Kathmandu",
    country_code: "NP",
    country: "Nepal",
    tz_name: "Asia/Kathmandu",
    latitude: 27.7172,
    longitude: 85.3240,
    admin1: "Bagmati",
    matched_as: "Kathmandu",
  },
  {
    id: 2,
    label: "Pokhara, Nepal",
    name: "Pokhara",
    country_code: "NP",
    country: "Nepal",
    tz_name: "Asia/Kathmandu",
    latitude: 28.2096,
    longitude: 83.9856,
    admin1: "Gandaki",
    matched_as: "Pokhara",
  },
  {
    id: 3,
    label: "New Delhi, India",
    name: "New Delhi",
    country_code: "IN",
    country: "India",
    tz_name: "Asia/Kolkata",
    latitude: 28.6139,
    longitude: 77.2090,
    admin1: "Delhi",
    matched_as: "New Delhi",
  },
  {
    id: 4,
    label: "Mumbai, India",
    name: "Mumbai",
    country_code: "IN",
    country: "India",
    tz_name: "Asia/Kolkata",
    latitude: 19.0760,
    longitude: 72.8777,
    admin1: "Maharashtra",
    matched_as: "Mumbai",
  },
  {
    id: 5,
    label: "San Francisco, CA, USA",
    name: "San Francisco",
    country_code: "US",
    country: "United States",
    tz_name: "America/Los_Angeles",
    latitude: 37.7749,
    longitude: -122.4194,
    admin1: "California",
    matched_as: "San Francisco",
  },
  {
    id: 6,
    label: "London, UK",
    name: "London",
    country_code: "GB",
    country: "United Kingdom",
    tz_name: "Europe/London",
    latitude: 51.5074,
    longitude: -0.1278,
    admin1: "England",
    matched_as: "London",
  },
  {
    id: 7,
    label: "New York, NY, USA",
    name: "New York",
    country_code: "US",
    country: "United States",
    tz_name: "America/New_York",
    latitude: 40.7128,
    longitude: -74.0060,
    admin1: "New York",
    matched_as: "New York",
  },
  {
    id: 8,
    label: "Dubai, UAE",
    name: "Dubai",
    country_code: "AE",
    country: "United Arab Emirates",
    tz_name: "Asia/Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
    admin1: "Dubai",
    matched_as: "Dubai",
  },
  {
    id: 9,
    label: "Sydney, Australia",
    name: "Sydney",
    country_code: "AU",
    country: "Australia",
    tz_name: "Australia/Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
    admin1: "New South Wales",
    matched_as: "Sydney",
  },
];

/**
 * Search birthplaces.
 *
 * One source: `/v1/places`, which resolves each result's IANA zone from a
 * 786,650-row GeoNames index — every populated place in Nepal and India plus
 * everywhere worldwide over 1,000 people, alternate names included.
 *
 * This previously fell back to OpenStreetMap and then guessed the timezone from
 * the country code, defaulting to `"UTC"` for anything unlisted. A birth in
 * Berlin came back as UTC — one hour off in winter, two in summer — and produced
 * a chart that looked entirely normal. Guessing a zone is the specific mistake
 * CLAUDE.md rule 5 exists to prevent, and the API already does it properly.
 */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
  limit: number = 20,
): Promise<Place[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) {
    // Before the user has typed anything searchable, offer somewhere to start.
    // Every entry carries a hand-checked IANA zone.
    return DEFAULT_POPULAR_PLACES;
  }

  const { results } = await apiFetch<{ results: Place[] }>(
    `/v1/places?q=${encodeURIComponent(cleanQuery)}&limit=${limit}`,
    { signal },
  );
  return results;
}
