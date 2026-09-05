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

function resolveTimezoneFromCoords(countryCode: string, lng: number): string {
  const cc = countryCode.toUpperCase();
  if (cc === "NP") return "Asia/Kathmandu";
  if (cc === "IN") return "Asia/Kolkata";
  if (cc === "GB") return "Europe/London";
  if (cc === "JP") return "Asia/Tokyo";
  if (cc === "AE") return "Asia/Dubai";
  if (cc === "AU") return lng > 140 ? "Australia/Sydney" : "Australia/Perth";
  if (cc === "CA") return lng < -100 ? "America/Vancouver" : "America/Toronto";
  if (cc === "US") {
    if (lng < -115) return "America/Los_Angeles";
    if (lng < -100) return "America/Denver";
    if (lng < -85) return "America/Chicago";
    return "America/New_York";
  }
  return "UTC";
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
  limit: number = 20,
): Promise<Place[]> {
  if (!query || query.trim().length < 2) {
    return DEFAULT_POPULAR_PLACES;
  }

  const cleanQuery = query.trim();

  // 1. Try local FastAPI endpoint /v1/places
  try {
    const res = await apiFetch<{ results: Place[] }>(
      `/v1/places?q=${encodeURIComponent(cleanQuery)}&limit=${limit}`,
      { signal },
    );
    if (res.results && res.results.length > 0) {
      return res.results;
    }
  } catch (err) {
    // API server may be offline
  }

  // 2. Try OpenStreetMap Nominatim Geocoding API for worldwide coverage
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery,
    )}&addressdetails=1&limit=${limit}`;

    const res = await fetch(osmUrl, { signal });
    if (res.ok) {
      const items = (await res.json()) as any[];
      if (Array.isArray(items) && items.length > 0) {
        return items.map((item, idx) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const countryCode = item.address?.country_code?.toUpperCase() ?? "XX";
          const countryName = item.address?.country ?? "";
          const cityName =
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.name ||
            cleanQuery;
          const state = item.address?.state || item.address?.region || "";

          const labelParts = [cityName, state, countryName].filter(Boolean);
          const label = labelParts.length > 0 ? labelParts.join(", ") : item.display_name;

          return {
            id: item.place_id || idx + 100,
            label,
            name: cityName,
            country_code: countryCode,
            country: countryName,
            tz_name: resolveTimezoneFromCoords(countryCode, lon),
            latitude: lat,
            longitude: lon,
            admin1: state,
            matched_as: cityName,
          };
        });
      }
    }
  } catch (err) {
    console.warn("OSM Nominatim search fallback failed", err);
  }

  // 3. Local fallback matching against popular places dataset
  const q = cleanQuery.toLowerCase();
  const matched = DEFAULT_POPULAR_PLACES.filter(
    (p) =>
      p.label.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q),
  );

  return matched.length > 0 ? matched : DEFAULT_POPULAR_PLACES;
}
